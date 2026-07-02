import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { handleApiError } from "@/lib/error-handler"

// GET /api/posts - 获取文章列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pageParam = parseInt(searchParams.get("page") || "1", 10)
    const limitParam = parseInt(searchParams.get("limit") || "10", 10)
    const page = Number.isNaN(pageParam) ? 1 : Math.max(pageParam, 1)
    const limit = Number.isNaN(limitParam) ? 10 : Math.min(Math.max(limitParam, 1), 50)
    const category = searchParams.get("category")
    const tag = searchParams.get("tag")

    // 公开 API 只返回已发布文章，草稿仅可通过 CLI 直连数据库访问
    const where: Record<string, unknown> = { published: true }

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
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
}
