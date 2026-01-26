import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { generateSlug, calculateReadingTime, extractExcerpt } from "@/lib/markdown"
import { getCurrentUserId, requireAdminAccess } from "@/lib/auth-utils"
import { handleApiError, ApiError } from "@/lib/error-handler"

// GET /api/posts - 获取文章列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const category = searchParams.get("category")
    const tag = searchParams.get("tag")
    const published = searchParams.get("published")

    const where: Record<string, unknown> = {}

    // 只显示已发布的文章（除非明确查询未发布的）
    if (published !== "false") {
      where.published = true
    }

    if (category) {
      where.category = {
        slug: category
      }
    }

    if (tag) {
      where.tags = {
        some: {
          slug: tag
        }
      }
    }

    const posts = await db.post.findMany({
      where,
      include: {
        author: {
          select: {
            name: true,
            email: true
          }
        },
        category: {
          select: {
            name: true,
            slug: true
          }
        },
        tags: {
          select: {
            name: true,
            slug: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      skip: (page - 1) * limit,
      take: limit
    })

    const total = await db.post.count({ where })

    // Add cache headers for better performance
    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/posts - 创建新文章
export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    await requireAdminAccess()

    const body = await request.json()
    const {
      title,
      content,
      excerpt,
      categoryId,
      tags: tagNames,
      published = false,
      featured = false
    } = body

    // 验证必填字段
    if (!title || !content) {
      throw new ApiError("Title and content are required", 400, "MISSING_REQUIRED_FIELDS")
    }

    // 生成slug
    const slug = generateSlug(title)

    // 检查slug是否已存在
    const existingPost = await db.post.findUnique({
      where: { slug }
    })

    if (existingPost) {
      throw new ApiError("A post with this title already exists", 409, "DUPLICATE_TITLE")
    }

    // 计算阅读时间
    const readTime = calculateReadingTime(content)

    // 如果没有提供摘要，自动生成
    const finalExcerpt = excerpt || extractExcerpt(content)

    // 获取当前用户ID
    const authorId = await getCurrentUserId()

    // 处理标签 - 使用批量操作避免 N+1 查询
    const tagConnections: { id: string }[] = []
    if (tagNames && tagNames.length > 0) {
      // 1. 生成所有标签的 slug
      const tagData: { name: string; slug: string }[] = tagNames.map((name: string) => ({
        name,
        slug: generateSlug(name)
      }))
      const tagSlugs = tagData.map((t) => t.slug)

      // 2. 单次查询已存在的标签
      const existingTags = await db.tag.findMany({
        where: { slug: { in: tagSlugs } },
        select: { id: true, slug: true }
      })
      const existingSlugs = new Set(existingTags.map(t => t.slug))

      // 3. 找出需要创建的新标签
      const newTags = tagData.filter(t => !existingSlugs.has(t.slug))

      // 4. 批量创建新标签
      if (newTags.length > 0) {
        await db.tag.createMany({
          data: newTags,
          skipDuplicates: true
        })
      }

      // 5. 单次获取所有标签 ID
      const allTags = await db.tag.findMany({
        where: { slug: { in: tagSlugs } },
        select: { id: true }
      })

      tagConnections.push(...allTags.map(t => ({ id: t.id })))
    }

    // 创建文章数据
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createData: any = {
      title,
      slug,
      content,
      excerpt: finalExcerpt,
      published,
      featured,
      readTime,
      authorId,
      tags: {
        connect: tagConnections
      }
    }

    // 添加分类（如果有）
    if (categoryId) {
      createData.category = { connect: { id: categoryId } }
    }

    // 创建文章
    const post = await db.post.create({
      data: createData,
      include: {
        author: {
          select: {
            name: true,
            email: true
          }
        },
        category: {
          select: {
            name: true,
            slug: true
          }
        },
        tags: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}