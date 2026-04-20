import { NextResponse } from "next/server"
import { db } from "@/lib/db"

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
