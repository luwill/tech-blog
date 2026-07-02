import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { likeLimiter, checkRateLimit, getClientIp } from "@/lib/rate-limit"

// POST /api/posts/[id]/like - 点赞文章
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!(await checkRateLimit(likeLimiter, getClientIp(request)))) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      )
    }

    // 验证文章是否存在
    const existingPost = await db.post.findUnique({
      where: { id },
      select: { id: true, likes: true }
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      )
    }

    // 简单的实现：每次请求都增加点赞数
    // 在实际应用中，你可能想要追踪用户的点赞状态
    const updatedPost = await db.post.update({
      where: { id },
      data: {
        likes: {
          increment: 1
        }
      },
      select: {
        id: true,
        likes: true
      }
    })

    return NextResponse.json({ 
      success: true, 
      likes: updatedPost.likes,
      message: "Post liked successfully" 
    })
  } catch (error) {
    console.error("Error liking post:", error)
    return NextResponse.json(
      { error: "Failed to like post" },
      { status: 500 }
    )
  }
}