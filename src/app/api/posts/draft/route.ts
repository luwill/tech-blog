import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUserId } from "@/lib/auth-utils"
import { generateSlug } from "@/lib/markdown"

// 自动保存草稿
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      content,
      excerpt,
      categoryId,
      tags: tagNames,
    } = body

    // 验证用户身份
    const authorId = await getCurrentUserId()
    if (!authorId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // 如果没有标题和内容，不进行保存
    if (!title && !content) {
      return NextResponse.json(
        { message: "No content to save" },
        { status: 200 }
      )
    }

    // 生成草稿slug (添加draft前缀避免与正式文章冲突)
    const baseSlug = title ? generateSlug(title) : "untitled"
    const draftSlug = `draft-${baseSlug}-${Date.now()}`

    // 查找是否存在同一作者的最新草稿
    const existingDraft = await db.post.findFirst({
      where: {
        authorId,
        published: false,
        slug: {
          startsWith: "draft-"
        }
      },
      orderBy: {
        updatedAt: "desc"
      }
    })

    let savedDraft

    if (existingDraft && !existingDraft.published) {
      // 更新现有草稿
      savedDraft = await db.post.update({
        where: { id: existingDraft.id },
        data: {
          title: title || "Untitled Draft",
          content: content || "",
          excerpt: excerpt || "",
          categoryId: categoryId || null,
          updatedAt: new Date()
        }
      })
    } else {
      // 创建新草稿
      savedDraft = await db.post.create({
        data: {
          title: title || "Untitled Draft",
          slug: draftSlug,
          content: content || "",
          excerpt: excerpt || "",
          published: false,
          featured: false,
          authorId,
          categoryId: categoryId || null,
        }
      })
    }

    return NextResponse.json({
      success: true,
      draft: {
        id: savedDraft.id,
        title: savedDraft.title,
        slug: savedDraft.slug,
        updatedAt: savedDraft.updatedAt
      }
    })
  } catch (error) {
    console.error("Error auto-saving draft:", error)
    return NextResponse.json(
      { error: "Failed to auto-save draft" },
      { status: 500 }
    )
  }
}