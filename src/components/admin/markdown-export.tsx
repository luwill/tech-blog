'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, FileText, Archive, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface ExportButtonProps {
  postId: string
  slug: string
}

// Single post export button
export function ExportSingleButton({ postId, slug }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)

    try {
      const response = await fetch(`/api/posts/export/${postId}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Export failed')
      }

      // Get the file content
      const blob = await response.blob()

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${slug}.md`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Post exported successfully')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Export failed'
      toast.error(message)
    } finally {
      setExporting(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={exporting}
      title="Export as Markdown"
    >
      {exporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
    </Button>
  )
}

interface BatchExportButtonProps {
  selectedPostIds: string[]
  onExportComplete?: () => void
}

// Batch export button with dropdown
export function BatchExportButton({ selectedPostIds, onExportComplete }: BatchExportButtonProps) {
  const [exporting, setExporting] = useState(false)

  const handleExport = async (all: boolean) => {
    setExporting(true)

    try {
      const response = await fetch('/api/posts/export/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postIds: all ? [] : selectedPostIds
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Export failed')
      }

      // Get the zip file
      const blob = await response.blob()

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition')
      let filename = `blog-posts-${new Date().toISOString().split('T')[0]}.zip`
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/)
        if (match) {
          filename = match[1]
        }
      }

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success(all ? 'All posts exported successfully' : `${selectedPostIds.length} posts exported successfully`)
      onExportComplete?.()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Export failed'
      toast.error(message)
    } finally {
      setExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={exporting}>
          {exporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleExport(false)}
          disabled={selectedPostIds.length === 0}
        >
          <FileText className="h-4 w-4 mr-2" />
          Export Selected ({selectedPostIds.length})
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport(true)}>
          <Archive className="h-4 w-4 mr-2" />
          Export All Posts
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
