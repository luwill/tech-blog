import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { generateSlug, calculateReadingTime, extractExcerpt } from "@/lib/markdown"
import { requireAdminAccess } from "@/lib/auth-utils"

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

    // 增加浏览量
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

// PUT /api/posts/[id] - 更新文章
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 验证管理员权限
    await requireAdminAccess()

    const { id } = await params
    const body = await request.json()
    const {
      title,
      content,
      excerpt,
      categoryId,
      tags: tagNames,
      published,
      featured
    } = body

    // 验证文章是否存在
    const existingPost = await db.post.findUnique({
      where: { id }
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      )
    }

    // 生成新的slug（如果标题改变了）
    let slug = existingPost.slug
    if (title && title !== existingPost.title) {
      slug = generateSlug(title)
      
      // 检查新slug是否与其他文章冲突
      const conflictingPost = await db.post.findFirst({
        where: {
          slug,
          id: {
            not: id
          }
        }
      })

      if (conflictingPost) {
        return NextResponse.json(
          { error: "A post with this title already exists" },
          { status: 400 }
        )
      }
    }

    // 计算阅读时间
    const readTime = content ? calculateReadingTime(content) : existingPost.readTime

    // 处理摘要
    const finalExcerpt = excerpt || (content ? extractExcerpt(content) : existingPost.excerpt)

    // 处理标签
    let tagUpdates = {}
    if (tagNames) {
      // 断开所有现有标签连接
      await db.post.update({
        where: { id },
        data: {
          tags: {
            set: []
          }
        }
      })

      // 重新连接新标签
      const tagConnections = []
      for (const tagName of tagNames) {
        const tagSlug = generateSlug(tagName)
        
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

      tagUpdates = {
        tags: {
          connect: tagConnections
        }
      }
    }

    // 处理分类
    let categoryUpdate = {}
    if (categoryId !== undefined) {
      if (categoryId) {
        categoryUpdate = { category: { connect: { id: categoryId } } }
      } else {
        categoryUpdate = { category: { disconnect: true } }
      }
    }

    // 更新文章
    const updatedPost = await db.post.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(title && { slug }),
        ...(content && { content }),
        excerpt: finalExcerpt,
        ...(typeof published === "boolean" && { published }),
        ...(typeof featured === "boolean" && { featured }),
        readTime,
        ...categoryUpdate,
        ...tagUpdates
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

    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error("Error updating post:", error)
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    )
  }
}

// DELETE /api/posts/[id] - 删除文章
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 验证管理员权限
    await requireAdminAccess()

    const { id } = await params

    // 验证文章是否存在
    const existingPost = await db.post.findUnique({
      where: { id }
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      )
    }

    // 删除文章
    await db.post.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Post deleted successfully" })
  } catch (error) {
    console.error("Error deleting post:", error)
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    )
  }
}