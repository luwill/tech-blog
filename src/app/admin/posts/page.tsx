import { HeaderSimple } from "@/components/layout/header-simple"
import { Footer } from "@/components/layout/footer"
import { PostsList } from "@/components/admin/posts-list"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import { Role } from "@prisma/client"

async function getPosts() {
  try {
    const posts = await db.post.findMany({
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
        _count: {
          select: {
            pageViews: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return posts
  } catch (error) {
    console.error('Error fetching posts:', error)
    return []
  }
}

export default async function AdminPostsPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== Role.ADMIN) {
    redirect('/')
  }

  const posts = await getPosts()

  // Transform posts for the client component
  const postsData = posts.map(post => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    published: post.published,
    featured: post.featured,
    views: post.views,
    readTime: post.readTime,
    createdAt: post.createdAt,
    category: post.category
  }))

  return (
    <div className="flex flex-col min-h-screen">
      <HeaderSimple />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Manage Posts</h1>
          <p className="text-muted-foreground">
            View and manage all your blog posts. Import markdown files or export for backup.
          </p>
        </div>

        {/* Posts List with selection and export */}
        <PostsList posts={postsData} />
      </main>

      <Footer />
    </div>
  )
}
