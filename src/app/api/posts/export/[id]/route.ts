import { NextRequest, NextResponse } from "next/server"
import { requireAdminAccess } from "@/lib/auth-utils"
import { handleApiError, NotFoundError } from "@/lib/error-handler"
import { db } from "@/lib/db"
import { toMarkdownFile } from "@/lib/frontmatter"

// GET /api/posts/export/[id] - Export single post as .md file
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin access
    await requireAdminAccess()

    const { id } = await params

    // Fetch the post with category and tags
    const post = await db.post.findUnique({
      where: { id },
      include: {
        category: {
          select: { name: true }
        },
        tags: {
          select: { name: true }
        }
      }
    })

    if (!post) {
      throw new NotFoundError("Post not found")
    }

    // Generate markdown content with frontmatter
    const markdown = toMarkdownFile({
      title: post.title,
      content: post.content,
      createdAt: post.createdAt,
      category: post.category,
      tags: post.tags,
      excerpt: post.excerpt,
      published: post.published,
      featured: post.featured,
      slug: post.slug
    })

    // Return as downloadable .md file
    return new NextResponse(markdown, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="${post.slug}.md"`,
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
}
