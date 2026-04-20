import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET /api/posts/[id] - 获取单个文章
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const post = await db.post.findUnique({
      where: { id },
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

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      )
    }

    await db.post.update({
      where: { id },
      data: {
        views: {
          increment: 1
        }
      }
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error("Error fetching post:", error)
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    )
  }
}
