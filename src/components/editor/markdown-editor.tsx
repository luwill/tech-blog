"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ImageUpload } from "@/components/ui/image-upload"
import { X, Plus, Save, Eye, Edit3, Image as ImageIcon, Clock, CheckCircle2 } from "lucide-react"
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

// Dynamically import the markdown editor to avoid SSR issues
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false,
  loading: () => <div className="h-96 bg-muted animate-pulse rounded-md" />
})

interface MarkdownEditorProps {
  initialTitle?: string
  initialContent?: string
  initialExcerpt?: string
  initialTags?: string[]
  initialCategory?: string
  onSave?: (data: {
    title: string
    content: string
    excerpt: string
    tags: string[]
    category: string
  }) => void
  onAutoSave?: (data: {
    title: string
    content: string
    excerpt: string
    tags: string[]
    category: string
  }) => Promise<void>
  isLoading?: boolean
  autoSaveInterval?: number // in milliseconds, default 30 seconds
}

export function MarkdownEditor({
  initialTitle = "",
  initialContent = "# Welcome to the Markdown Editor\n\nStart writing your blog post here!\n\n## Features\n\n- **Real-time preview**\n- Code syntax highlighting\n- Math formula support\n- Table editing\n- Image upload\n\n```javascript\nconsole.log('Hello, World!');\n```\n\n$$\nE = mc^2\n$$",
  initialExcerpt = "",
  initialTags = [],
  initialCategory = "",
  onSave,
  onAutoSave,
  isLoading = false,
  autoSaveInterval = 30000 // 30 seconds
}: MarkdownEditorProps) {
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)
  const [excerpt, setExcerpt] = useState(initialExcerpt)
  const [tags, setTags] = useState<string[]>(initialTags)
  const [category, setCategory] = useState(initialCategory)
  const [newTag, setNewTag] = useState("")
  const [preview, setPreview] = useState(false)
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [autoSaving, setAutoSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastAutoSaveDataRef = useRef<string>("")

  const handleSave = useCallback(() => {
    if (onSave) {
      onSave({
        title,
        content,
        excerpt,
        tags,
        category
      })
      setLastSaved(new Date())
      setHasUnsavedChanges(false)
    }
  }, [title, content, excerpt, tags, category, onSave])

  const handleAutoSave = useCallback(async () => {
    if (!onAutoSave || autoSaving) return

    const currentData = {
      title,
      content,
      excerpt,
      tags,
      category
    }

    const currentDataString = JSON.stringify(currentData)
    
    // 只有当数据真正改变时才自动保存
    if (currentDataString === lastAutoSaveDataRef.current) return

    try {
      setAutoSaving(true)
      await onAutoSave(currentData)
      setLastSaved(new Date())
      setHasUnsavedChanges(false)
      lastAutoSaveDataRef.current = currentDataString
    } catch (error) {
      console.error('Auto-save failed:', error)
    } finally {
      setAutoSaving(false)
    }
  }, [title, content, excerpt, tags, category, onAutoSave, autoSaving])

  // 监听内容变化，标记为未保存
  useEffect(() => {
    const currentDataString = JSON.stringify({ title, content, excerpt, tags, category })
    if (currentDataString !== lastAutoSaveDataRef.current && lastAutoSaveDataRef.current !== "") {
      setHasUnsavedChanges(true)
    }
  }, [title, content, excerpt, tags, category])

  // 自动保存定时器
  useEffect(() => {
    if (!onAutoSave) return

    // 清除之前的定时器
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    // 设置新的定时器
    autoSaveTimeoutRef.current = setTimeout(() => {
      handleAutoSave()
    }, autoSaveInterval)

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [title, content, excerpt, tags, category, handleAutoSave, autoSaveInterval, onAutoSave])

  // 初始化时设置基准数据
  useEffect(() => {
    lastAutoSaveDataRef.current = JSON.stringify({ title: initialTitle, content: initialContent, excerpt: initialExcerpt, tags: initialTags, category: initialCategory })
  }, [initialTitle, initialContent, initialExcerpt, initialTags, initialCategory])

  const addTag = useCallback(() => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()])
      setNewTag("")
    }
  }, [newTag, tags])

  const removeTag = useCallback((tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove))
  }, [])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  const handleImageUpload = useCallback((imageUrl: string) => {
    // Insert image markdown at cursor position
    const imageMarkdown = `![Image](${imageUrl})\n\n`
    setContent(prev => prev + imageMarkdown)
    setShowImageUpload(false)
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">Write New Post</h2>
          {/* Auto-save status */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            {autoSaving ? (
              <>
                <Clock className="h-4 w-4 animate-spin" />
                <span>Auto-saving...</span>
              </>
            ) : hasUnsavedChanges ? (
              <>
                <div className="h-2 w-2 rounded-full bg-orange-500" />
                <span>Unsaved changes</span>
              </>
            ) : lastSaved ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Saved at {lastSaved.toLocaleTimeString()}</span>
              </>
            ) : null}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowImageUpload(!showImageUpload)}
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Images
          </Button>
          <Button
            variant="outline"
            onClick={() => setPreview(!preview)}
          >
            {preview ? <Edit3 className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {preview ? "Edit" : "Preview"}
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save Post"}
          </Button>
        </div>
      </div>

      {/* Image Upload Section */}
      {showImageUpload && (
        <ImageUpload
          onUpload={handleImageUpload}
          onError={(error) => console.error('Image upload error:', error)}
          multiple={true}
          maxSize={5}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title..."
              className="text-lg font-medium"
            />
          </div>

          {/* Excerpt */}
          <div>
            <Label htmlFor="excerpt">Excerpt</Label>
            <Input
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief description of your post..."
            />
          </div>

          {/* Markdown Editor */}
          <div className="border rounded-lg overflow-hidden">
            <MDEditor
              value={content}
              onChange={(val) => setContent(val || "")}
              preview={preview ? "preview" : "edit"}
              hideToolbar={preview}
              visibleDragbar={false}
              textareaProps={{
                placeholder: "Start writing your markdown content...",
                style: {
                  fontSize: 14,
                  lineHeight: 1.6,
                }
              }}
              height={500}
              previewOptions={{
                remarkPlugins: [remarkMath],
                rehypePlugins: [rehypeKatex],
              }}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Category */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Category</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 border rounded-md bg-background"
              >
                <option value="">Select category...</option>
                <option value="ai-technology">AI Technology</option>
                <option value="product-reviews">Product Reviews</option>
                <option value="technical-insights">Technical Insights</option>
                <option value="algorithms">Algorithms</option>
                <option value="tutorials">Tutorials</option>
              </select>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add tag..."
                  className="flex-1"
                />
                <Button size="sm" onClick={addTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Post Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Post Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="featured">Featured Post</Label>
                <input
                  type="checkbox"
                  id="featured"
                  className="rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="published">Publish Immediately</Label>
                <input
                  type="checkbox"
                  id="published"
                  className="rounded"
                  defaultChecked
                />
              </div>
            </CardContent>
          </Card>

          {/* Writing Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Writing Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Use headings to structure your content</p>
              <p>• Add code blocks with syntax highlighting</p>
              <p>• Include images to make posts engaging</p>
              <p>• Use math formulas with $$...$$</p>
              <p>• Tag posts for better discoverability</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}