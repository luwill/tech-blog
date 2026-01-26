import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET /api/posts/slug/[slug] - 通过slug获取文章
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const post = await db.post.findUnique({
      where: { 
        slug,
        published: true // 只返回已发布的文章
      },
      include: {
        author: {
          select: {
            name: true,
            email: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        tags: {
          select: {
            id: true,
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

    // 增加浏览量
    await db.post.update({
      where: { slug },
      data: {
        views: {
          increment: 1
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      post: {
        ...post,
        views: post.views + 1 // 返回更新后的浏览量
      }
    })
  } catch (error) {
    console.error("Error fetching post by slug:", error)
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    )
  }
}