import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { generateSlug } from "@/lib/markdown"
import { requireAdminAccess } from "@/lib/auth-utils"
import { handleApiError } from "@/lib/error-handler"

// GET /api/categories - 获取分类列表
export async function GET() {
  try {
    const categories = await db.category.findMany({
      include: {
        _count: {
          select: {
            posts: {
              where: {
                published: true
              }
            }
          }
        }
      },
      orderBy: {
        name: "asc"
      }
    })

    // Add cache headers - categories change infrequently
    return NextResponse.json({ categories }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    )
  }
}

// POST /api/categories - 创建分类 (admin only)
export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    await requireAdminAccess()

    const body = await request.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      )
    }

    const slug = generateSlug(name)

    // 检查分类是否已存在
    const existingCategory = await db.category.findUnique({
      where: { slug }
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: "Category already exists" },
        { status: 400 }
      )
    }

    const category = await db.category.create({
      data: {
        name,
        slug,
        description
      }
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}