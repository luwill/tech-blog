import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { db } from "@/lib/db"
import { handleApiError } from "@/lib/error-handler"
import { viewLimiter, checkRateLimit, getClientIp } from "@/lib/rate-limit"

// POST /api/posts/slug/[slug]/view - 浏览量上报
// 从文章 GET 读路径剥离出来的写操作，由客户端在页面加载后异步上报
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await checkRateLimit(viewLimiter, getClientIp(request)))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  try {
    const { slug } = await params

    await db.post.update({
      where: { slug, published: true },
      data: { views: { increment: 1 } },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    // 文章不存在或未发布
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }
    return handleApiError(error)
  }
}
