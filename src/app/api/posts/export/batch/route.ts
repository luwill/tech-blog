import { NextRequest, NextResponse } from "next/server"
import { requireAdminAccess } from "@/lib/auth-utils"
import { handleApiError, ValidationError } from "@/lib/error-handler"
import { db } from "@/lib/db"
import { toMarkdownFile } from "@/lib/frontmatter"
import JSZip from "jszip"

interface BatchExportRequest {
  postIds?: string[]
}

// POST /api/posts/export/batch - Export multiple posts as ZIP file
export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    await requireAdminAccess()

    const body = await request.json() as BatchExportRequest
    const { postIds } = body

    // Build query - if postIds is empty or not provided, export all posts
    const where = postIds && postIds.length > 0
      ? { id: { in: postIds } }
      : {}

    // Fetch posts with category and tags
    const posts = await db.post.findMany({
      where,
      include: {
        category: {
          select: { name: true }
        },
        tags: {
          select: { name: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (posts.length === 0) {
      throw new ValidationError("No posts to export")
    }

    // Create ZIP file
    const zip = new JSZip()

    // Add each post as a .md file
    for (const post of posts) {
      const markdown = toMarkdownFile({
        title: post.title,
        content: post.content,
        createdAt: post.createdAt,
        category: post.category,
        tags: post.tags,
        excerpt: post.excerpt,
        published: post.published,
        featured: post.featured,
        slug: post.slug
      })

      // Use slug as filename, ensure uniqueness
      zip.file(`${post.slug}.md`, markdown)
    }

    // Generate ZIP as Blob for browser compatibility
    const zipBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 }
    })

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `blog-posts-${timestamp}.zip`

    // Return as downloadable ZIP file
    return new NextResponse(zipBlob, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
}
