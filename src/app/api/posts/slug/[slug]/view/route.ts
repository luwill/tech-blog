import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// POST /api/posts/slug/[slug]/view - 浏览量上报
// 从文章 GET 读路径剥离出来的写操作，由客户端在页面加载后异步上报
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    await db.post.update({
      where: { slug, published: true },
      data: { views: { increment: 1 } },
    })

    return NextResponse.json({ success: true })
  } catch {
    // 文章不存在或未发布（Prisma P2025）
    return NextResponse.json(
      { error: "Post not found" },
      { status: 404 }
    )
  }
}
