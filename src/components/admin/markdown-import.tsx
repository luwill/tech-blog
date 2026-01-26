'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import type { ImportPreview, ImportPreviewResponse } from '@/app/api/posts/import/route'

interface MarkdownImportProps {
  onImportComplete?: () => void
}

export function MarkdownImport({ onImportComplete }: MarkdownImportProps) {
  const [uploading, setUploading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [previews, setPreviews] = useState<ImportPreview[]>([])
  const [selectedPreviews, setSelectedPreviews] = useState<Set<number>>(new Set())
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    // Filter for .md files
    const mdFiles = Array.from(files).filter(f => f.name.endsWith('.md'))
    if (mdFiles.length === 0) {
      toast.error('Please select .md files')
      return
    }

    setUploading(true)
    setProgress(0)

    try {
      const formData = new FormData()
      mdFiles.forEach(file => {
        formData.append('files', file)
      })

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 100)

      const response = await fetch('/api/posts/import', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const data: ImportPreviewResponse = await response.json()

      setPreviews(data.previews)
      // Select all valid non-conflicting files by default
      const validIndices = new Set<number>()
      data.previews.forEach((preview, index) => {
        if (preview.errors.length === 0 && !preview.conflict) {
          validIndices.add(index)
        }
      })
      setSelectedPreviews(validIndices)

      toast.success(`Parsed ${data.totalFiles} files: ${data.validFiles} valid, ${data.conflictFiles} conflicts`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed'
      toast.error(message)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const togglePreview = (index: number) => {
    const newSelected = new Set(selectedPreviews)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedPreviews(newSelected)
  }

  const selectAll = () => {
    const validIndices = new Set<number>()
    previews.forEach((preview, index) => {
      if (preview.errors.length === 0) {
        validIndices.add(index)
      }
    })
    setSelectedPreviews(validIndices)
  }

  const selectNone = () => {
    setSelectedPreviews(new Set())
  }

  const handleImport = async () => {
    if (selectedPreviews.size === 0) {
      toast.error('Please select at least one file to import')
      return
    }

    setImporting(true)

    try {
      const postsToImport = Array.from(selectedPreviews).map(index => {
        const preview = previews[index]
        return {
          title: preview.frontmatter.title,
          content: preview.content,
          slug: preview.slug,
          category: preview.frontmatter.category,
          tags: preview.frontmatter.tags,
          excerpt: preview.frontmatter.excerpt,
          published: preview.frontmatter.published,
          featured: preview.frontmatter.featured,
          date: preview.frontmatter.date,
          overwriteSlug: preview.conflict // Auto-rename if conflict
        }
      })

      const response = await fetch('/api/posts/import/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ posts: postsToImport }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`Successfully imported ${data.imported} posts${data.failed > 0 ? `, ${data.failed} failed` : ''}`)
        setPreviews([])
        setSelectedPreviews(new Set())
        onImportComplete?.()
      } else {
        toast.error(`Import failed: ${data.failed} posts could not be imported`)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Import failed'
      toast.error(message)
    } finally {
      setImporting(false)
    }
  }

  const reset = () => {
    setPreviews([])
    setSelectedPreviews(new Set())
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getStatusBadge = (preview: ImportPreview) => {
    if (preview.errors.length > 0) {
      return <Badge variant="destructive">Error</Badge>
    }
    if (preview.conflict) {
      return <Badge variant="secondary">Conflict</Badge>
    }
    return <Badge variant="default">Valid</Badge>
  }

  const getStatusIcon = (preview: ImportPreview) => {
    if (preview.errors.length > 0) {
      return <XCircle className="h-4 w-4 text-destructive" />
    }
    if (preview.conflict) {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card className={`transition-all duration-200 ${dragOver ? 'border-primary bg-primary/5' : 'border-dashed'}`}>
        <CardContent className="p-6">
          <div
            className="space-y-4 text-center"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Upload className="h-6 w-6 text-primary" />
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Import Markdown Files</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop .md files here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Files should include YAML frontmatter with title, date, category, tags, etc.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              {uploading ? 'Processing...' : 'Choose Files'}
            </Button>

            <Input
              ref={fileInputRef}
              type="file"
              accept=".md"
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </div>

          {/* Progress */}
          {uploading && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Processing files...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Table */}
      {previews.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Preview ({previews.length} files)
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  Select All Valid
                </Button>
                <Button variant="outline" size="sm" onClick={selectNone}>
                  Select None
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <span className="sr-only">Select</span>
                  </TableHead>
                  <TableHead className="w-12">Status</TableHead>
                  <TableHead>Filename</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Slug</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previews.map((preview, index) => (
                  <TableRow key={index} className={preview.errors.length > 0 ? 'opacity-60' : ''}>
                    <TableCell>
                      <Checkbox
                        checked={selectedPreviews.has(index)}
                        onCheckedChange={() => togglePreview(index)}
                        disabled={preview.errors.length > 0}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(preview)}
                        {getStatusBadge(preview)}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {preview.filename}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {preview.frontmatter.title || '-'}
                    </TableCell>
                    <TableCell>
                      {preview.frontmatter.category || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {preview.frontmatter.tags?.slice(0, 3).map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {(preview.frontmatter.tags?.length || 0) > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{(preview.frontmatter.tags?.length || 0) - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      <span className={preview.conflict ? 'text-yellow-500' : ''}>
                        {preview.slug}
                        {preview.conflict && ' (will rename)'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Errors summary */}
            {previews.some(p => p.errors.length > 0) && (
              <div className="mt-4 p-4 bg-destructive/10 rounded-lg">
                <h4 className="font-semibold text-destructive mb-2">Errors Found</h4>
                <ul className="text-sm space-y-1">
                  {previews.filter(p => p.errors.length > 0).map((preview, index) => (
                    <li key={index}>
                      <span className="font-mono">{preview.filename}</span>: {preview.errors.join(', ')}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {selectedPreviews.size} of {previews.length} files selected
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={reset}>
                  Cancel
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={importing || selectedPreviews.size === 0}
                >
                  {importing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {importing ? 'Importing...' : `Import ${selectedPreviews.size} Files`}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
