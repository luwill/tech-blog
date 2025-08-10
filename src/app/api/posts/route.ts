import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { generateSlug, calculateReadingTime, extractExcerpt } from "@/lib/markdown"
import { getCurrentUserId } from "@/lib/auth-utils"

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

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    )
  }
}

// POST /api/posts - 创建新文章
export async function POST(request: NextRequest) {
  try {
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
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      )
    }

    // 生成slug
    const slug = generateSlug(title)

    // 检查slug是否已存在
    const existingPost = await db.post.findUnique({
      where: { slug }
    })

    if (existingPost) {
      return NextResponse.json(
        { error: "A post with this title already exists" },
        { status: 400 }
      )
    }

    // 计算阅读时间
    const readTime = calculateReadingTime(content)

    // 如果没有提供摘要，自动生成
    const finalExcerpt = excerpt || extractExcerpt(content)

    // 获取当前用户ID
    const authorId = await getCurrentUserId()

    // 处理标签
    const tagConnections = []
    if (tagNames && tagNames.length > 0) {
      for (const tagName of tagNames) {
        const tagSlug = generateSlug(tagName)
        
        // 查找或创建标签
        const tag = await db.tag.upsert({
          where: { slug: tagSlug },
          update: {},
          create: {
            name: tagName,
            slug: tagSlug
          }
        })
        
        tagConnections.push({ id: tag.id })
      }
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
      authorId, // TODO: 替换为实际用户ID
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
    console.error("Error creating post:", error)
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    )
  }
}