'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import Image from 'next/image'
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Copy, 
  Check
} from 'lucide-react'
import { toast } from 'sonner'

interface ImageUploadProps {
  onUpload?: (url: string) => void
  onError?: (error: string) => void
  className?: string
  accept?: string
  maxSize?: number // in MB
  multiple?: boolean
}

interface UploadedImage {
  url: string
  filename: string
  size: number
  type: string
}

export function ImageUpload({
  onUpload,
  onError,
  className = '',
  accept = 'image/*',
  maxSize = 5,
  multiple = false
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return
    
    const fileArray = Array.from(files)
    if (!multiple && fileArray.length > 1) {
      toast.error('Please select only one file')
      return
    }

    fileArray.forEach(uploadFile)
  }

  const uploadFile = async (file: File) => {
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      const error = `File size too large. Maximum ${maxSize}MB allowed.`
      toast.error(error)
      onError?.(error)
      return
    }

    setUploading(true)
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 100)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const data = await response.json()
      
      if (data.success) {
        const newImage: UploadedImage = {
          url: data.url,
          filename: data.filename,
          size: data.size,
          type: data.type
        }
        
        setUploadedImages(prev => [...prev, newImage])
        toast.success('Image uploaded successfully!')
        onUpload?.(data.url)
      } else {
        throw new Error(data.error || 'Upload failed')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      toast.error(errorMessage)
      onError?.(errorMessage)
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

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedUrl(url)
      toast.success('URL copied to clipboard!')
      
      // Reset copy state after 2 seconds
      setTimeout(() => setCopiedUrl(null), 2000)
    } catch {
      toast.error('Failed to copy URL')
    }
  }

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className={`space-y-4 ${className}`}>
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
              <h3 className="text-lg font-semibold mb-2">Upload Images</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop your images here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Supports: JPEG, PNG, GIF, WebP • Max size: {maxSize}MB {multiple ? '• Multiple files' : '• Single file'}
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose Files
            </Button>

            <Input
              ref={fileInputRef}
              type="file"
              accept={accept}
              multiple={multiple}
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </div>

          {/* Progress */}
          {uploading && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Uploaded Images */}
      {uploadedImages.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Uploaded Images ({uploadedImages.length})
            </h4>
            
            <div className="space-y-4">
              {uploadedImages.map((image, index) => (
                <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                  <Image
                    src={image.url}
                    alt={image.filename}
                    width={64}
                    height={64}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{image.filename}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(image.size)} • {image.type}
                    </p>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {image.url}
                    </code>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(image.url)}
                    >
                      {copiedUrl === image.url ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}