"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { MarkdownEditor } from "@/components/editor/markdown-editor"
import { HeaderSimple } from "@/components/layout/header-simple"
import { Footer } from "@/components/layout/footer"
import { postsApi, categoriesApi, handleApiError, type Category, type Post } from "@/lib/api"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function EditPostPage() {
  const router = useRouter()
  const params = useParams()
  const postId = params.id as string

  const [post, setPost] = useState<Post | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [postData, categoriesData] = await Promise.all([
          postsApi.getById(postId),
          categoriesApi.getAll()
        ])
        setPost(postData)
        setCategories(categoriesData)
      } catch (err) {
        const message = handleApiError(err)
        setError(message)
        toast.error(message)
      } finally {
        setIsInitialLoading(false)
      }
    }

    if (postId) {
      loadData()
    }
  }, [postId])

  const handleSave = async (data: {
    title: string
    content: string
    excerpt: string
    tags: string[]
    category: string
    featured: boolean
    published: boolean
  }) => {
    if (!data.title.trim() || !data.content.trim()) {
      toast.error("Title and content are required")
      return
    }

    setIsLoading(true)

    try {
      // Find category ID by slug/name
      let categoryId = undefined
      if (data.category) {
        const category = categories.find(c =>
          c.slug === data.category || c.name === data.category
        )
        categoryId = category?.id
      }

      await postsApi.update({
        id: postId,
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        categoryId,
        tags: data.tags,
        published: data.published,
        featured: data.featured
      })

      toast.success("Post updated successfully!")
    } catch (err) {
      const message = handleApiError(err)
      toast.error(message)
      console.error("Update error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAutoSave = async (data: {
    title: string
    content: string
    excerpt: string
    tags: string[]
    category: string
    featured: boolean
    published: boolean
  }) => {
    if (!data.title.trim() || !data.content.trim()) {
      return
    }

    try {
      let categoryId = undefined
      if (data.category) {
        const category = categories.find(c =>
          c.slug === data.category || c.name === data.category
        )
        categoryId = category?.id
      }

      await postsApi.update({
        id: postId,
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        categoryId,
        tags: data.tags,
        published: data.published,
        featured: data.featured
      })
    } catch (err) {
      console.error("Auto-save error:", err)
      throw err
    }
  }

  if (isInitialLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <HeaderSimple />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading post...</span>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="flex flex-col min-h-screen">
        <HeaderSimple />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Post not found</h1>
            <p className="text-muted-foreground mb-4">{error || "The post you're looking for doesn't exist."}</p>
            <button
              onClick={() => router.push('/admin/posts')}
              className="text-primary hover:underline"
            >
              Back to posts
            </button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <HeaderSimple />

      <main className="flex-1 container mx-auto px-4 py-8">
        <MarkdownEditor
          initialTitle={post.title}
          initialContent={post.content}
          initialExcerpt={post.excerpt || ""}
          initialTags={post.tags?.map(t => t.name) || []}
          initialCategory={post.category?.slug || ""}
          initialFeatured={post.featured}
          initialPublished={post.published}
          onSave={handleSave}
          onAutoSave={handleAutoSave}
          isLoading={isLoading}
        />
      </main>

      <Footer />
    </div>
  )
}
