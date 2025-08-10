"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MarkdownEditor } from "@/components/editor/markdown-editor"
import { HeaderSimple } from "@/components/layout/header-simple"
import { Footer } from "@/components/layout/footer"
import { postsApi, categoriesApi, handleApiError, type Category } from "@/lib/api"
import { toast } from "sonner"

export default function NewPostPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    // Load categories
    categoriesApi.getAll()
      .then(setCategories)
      .catch(error => {
        console.error("Failed to load categories:", error)
        toast.error("Failed to load categories")
      })
  }, [])

  const handleSave = async (data: {
    title: string
    content: string
    excerpt: string
    tags: string[]
    category: string
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

      const post = await postsApi.create({
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        categoryId,
        tags: data.tags,
        published: true, // Auto-publish for now
        featured: false
      })

      toast.success("Post created successfully!")
      router.push(`/admin/posts/${post.id}/edit`)
    } catch (error) {
      const message = handleApiError(error)
      toast.error(message)
      console.error("Save error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <HeaderSimple />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <MarkdownEditor 
          onSave={handleSave}
          isLoading={isLoading}
        />
      </main>
      
      <Footer />
    </div>
  )
}