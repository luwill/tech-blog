'use client'

import { useState } from 'react'
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Edit3,
  Trash2,
  Eye,
  Plus,
  Calendar,
  Clock,
  Upload,
  Loader2
} from "lucide-react"
import { ExportSingleButton, BatchExportButton } from './markdown-export'
import { postsApi } from '@/lib/api'
import { toast } from 'sonner'

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string | null
  published: boolean
  featured: boolean
  views: number
  readTime: number | null
  createdAt: Date
  category: {
    name: string
    slug: string
  } | null
}

interface PostsListProps {
  posts: Post[]
}

export function PostsList({ posts }: PostsListProps) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteTarget) return

    setIsDeleting(true)
    try {
      await postsApi.delete(deleteTarget.id)
      toast.success('Post deleted successfully')
      setDeleteTarget(null)
      router.refresh()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete post')
    } finally {
      setIsDeleting(false)
    }
  }

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const selectAll = () => {
    setSelectedIds(new Set(posts.map(p => p.id)))
  }

  const selectNone = () => {
    setSelectedIds(new Set())
  }

  const handleExportComplete = () => {
    setSelectedIds(new Set())
  }

  if (posts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">No posts yet</h3>
            <p className="text-muted-foreground mb-4">
              Start by creating your first blog post or import from Markdown files
            </p>
            <div className="flex justify-center gap-2">
              <Button asChild>
                <Link href="/admin/posts/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Post
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/posts/import">
                  <Upload className="h-4 w-4 mr-2" />
                  Import from Markdown
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-4">
          <Checkbox
            checked={selectedIds.size === posts.length && posts.length > 0}
            onCheckedChange={(checked) => checked ? selectAll() : selectNone()}
          />
          <span className="text-sm text-muted-foreground">
            {selectedIds.size > 0
              ? `${selectedIds.size} of ${posts.length} selected`
              : `${posts.length} posts`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <BatchExportButton
            selectedPostIds={Array.from(selectedIds)}
            onExportComplete={handleExportComplete}
          />
          <Button asChild variant="outline">
            <Link href="/admin/posts/import">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/posts/new">
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Link>
          </Button>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid gap-6">
        {posts.map((post) => (
          <Card key={post.id} className={`hover:shadow-lg transition-shadow ${selectedIds.has(post.id) ? 'ring-2 ring-primary' : ''}`}>
            <CardHeader>
              <div className="flex items-start gap-4">
                <Checkbox
                  checked={selectedIds.has(post.id)}
                  onCheckedChange={() => toggleSelect(post.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-2 mb-2">
                        {post.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {post.excerpt || 'No excerpt available'}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Badge variant={post.published ? "default" : "secondary"}>
                        {post.published ? "Published" : "Draft"}
                      </Badge>
                      {post.featured && (
                        <Badge variant="outline">Featured</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between ml-10">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{post.views} views</span>
                  </div>
                  {post.readTime && (
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{post.readTime} min read</span>
                    </div>
                  )}
                  {post.category && (
                    <Badge variant="outline" className="text-xs">
                      {post.category.name}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <ExportSingleButton postId={post.id} slug={post.slug} />
                  {post.published && (
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/blog/${post.slug}`} target="_blank">
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/posts/${post.id}/edit`}>
                      <Edit3 className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget({ id: post.id, title: post.title })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.title}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
