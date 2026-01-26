import { NextRequest, NextResponse } from "next/server"
import { requireAdminAccess, getCurrentUserId } from "@/lib/auth-utils"
import { handleApiError, ValidationError } from "@/lib/error-handler"
import { HTTP_STATUS } from "@/lib/constants"
import { db } from "@/lib/db"
import { generateSlug, calculateReadingTime, extractExcerpt } from "@/lib/markdown"

interface ImportPost {
  title: string
  content: string
  slug: string
  category?: string
  tags?: string[]
  excerpt?: string
  published?: boolean
  featured?: boolean
  date?: string
  overwriteSlug?: boolean // If true, append number to slug on conflict
}

interface ImportResult {
  slug: string
  title: string
  success: boolean
  error?: string
  postId?: string
}

interface ImportConfirmResponse {
  success: boolean
  results: ImportResult[]
  imported: number
  failed: number
}

// POST /api/posts/import/confirm - Confirm and save imported posts
export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    await requireAdminAccess()

    const body = await request.json()
    const { posts } = body as { posts: ImportPost[] }

    if (!posts || !Array.isArray(posts) || posts.length === 0) {
      throw new ValidationError("No posts to import")
    }

    const authorId = await getCurrentUserId()
    const results: ImportResult[] = []

    for (const post of posts) {
      try {
        // Validate required fields
        if (!post.title || !post.content) {
          results.push({
            slug: post.slug || 'unknown',
            title: post.title || 'Unknown',
            success: false,
            error: 'Title and content are required'
          })
          continue
        }

        // Generate or validate slug
        let slug = post.slug || generateSlug(post.title)

        // Check for slug conflicts and resolve
        const existingPost = await db.post.findUnique({
          where: { slug }
        })

        if (existingPost) {
          if (post.overwriteSlug) {
            // Find unique slug by appending number
            let counter = 1
            let newSlug = `${slug}-${counter}`
            while (await db.post.findUnique({ where: { slug: newSlug } })) {
              counter++
              newSlug = `${slug}-${counter}`
            }
            slug = newSlug
          } else {
            results.push({
              slug,
              title: post.title,
              success: false,
              error: `Slug "${slug}" already exists`
            })
            continue
          }
        }

        // Calculate reading time
        const readTime = calculateReadingTime(post.content)

        // Generate excerpt if not provided
        const excerpt = post.excerpt || extractExcerpt(post.content)

        // Handle category - find or create
        let categoryId: string | undefined
        if (post.category) {
          const categorySlug = generateSlug(post.category)
          let category = await db.category.findUnique({
            where: { slug: categorySlug }
          })

          if (!category) {
            category = await db.category.create({
              data: {
                name: post.category,
                slug: categorySlug
              }
            })
          }
          categoryId = category.id
        }

        // Handle tags - find or create
        const tagConnections: { id: string }[] = []
        if (post.tags && post.tags.length > 0) {
          for (const tagName of post.tags) {
            const tagSlug = generateSlug(tagName)
            let tag = await db.tag.findUnique({
              where: { slug: tagSlug }
            })

            if (!tag) {
              tag = await db.tag.create({
                data: {
                  name: tagName,
                  slug: tagSlug
                }
              })
            }
            tagConnections.push({ id: tag.id })
          }
        }

        // Create the post
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const createData: any = {
          title: post.title,
          slug,
          content: post.content,
          excerpt,
          published: post.published ?? false,
          featured: post.featured ?? false,
          readTime,
          authorId,
          tags: {
            connect: tagConnections
          }
        }

        // Add category if available
        if (categoryId) {
          createData.category = { connect: { id: categoryId } }
        }

        // Set createdAt if date is provided
        if (post.date) {
          createData.createdAt = new Date(post.date)
        }

        const createdPost = await db.post.create({
          data: createData
        })

        results.push({
          slug,
          title: post.title,
          success: true,
          postId: createdPost.id
        })
      } catch (error) {
        results.push({
          slug: post.slug || 'unknown',
          title: post.title || 'Unknown',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    const imported = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length

    const response: ImportConfirmResponse = {
      success: imported > 0,
      results,
      imported,
      failed
    }

    return NextResponse.json(response, {
      status: imported > 0 ? HTTP_STATUS.CREATED : HTTP_STATUS.BAD_REQUEST
    })
  } catch (error) {
    return handleApiError(error)
  }
}
