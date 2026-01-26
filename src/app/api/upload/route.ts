import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { requireAdminAccess } from '@/lib/auth-utils'
import { handleApiError } from '@/lib/error-handler'
import { uploadRateLimiter } from '@/lib/rate-limiter'

// Validate file magic bytes to prevent extension spoofing
function validateFileMagicBytes(buffer: Buffer, mimeType: string): boolean {
  const signatures: Record<string, number[][]> = {
    'image/jpeg': [[0xFF, 0xD8, 0xFF]],
    'image/jpg': [[0xFF, 0xD8, 0xFF]],
    'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
    'image/gif': [[0x47, 0x49, 0x46, 0x38, 0x37, 0x61], [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]],
    'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF header, WebP follows
  }

  const sigs = signatures[mimeType]
  if (!sigs) return false

  return sigs.some(sig =>
    sig.every((byte, index) => buffer[index] === byte)
  )
}

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting (5 uploads per minute)
    await uploadRateLimiter.limit(request)

    // Require admin authentication
    await requireAdminAccess()

    const data = await request.formData()
    const file = data.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size too large. Maximum 5MB allowed.' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const filename = `${timestamp}-${randomString}.${fileExtension}`

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Validate file magic bytes to prevent extension spoofing attacks
    if (!validateFileMagicBytes(buffer, file.type)) {
      return NextResponse.json(
        { success: false, error: 'File content does not match declared type. Possible file spoofing detected.' },
        { status: 400 }
      )
    }

    // Save file
    const filePath = join(uploadsDir, filename)
    await writeFile(filePath, buffer)
    
    // Return the public URL
    const imageUrl = `/uploads/${filename}`
    
    return NextResponse.json({
      success: true,
      url: imageUrl,
      filename: filename,
      size: file.size,
      type: file.type
    })
  } catch (error) {
    return handleApiError(error)
  }
}