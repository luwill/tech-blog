import { NextRequest, NextResponse } from "next/server"
import { requireAdminAccess } from "@/lib/auth-utils"
import { handleApiError, ValidationError } from "@/lib/error-handler"
import {
  parseFrontmatter,
  validateFrontmatter,
  slugFromFilename,
  type Frontmatter
} from "@/lib/frontmatter"
import { db } from "@/lib/db"
import { generateSlug } from "@/lib/markdown"

export interface ImportPreview {
  filename: string
  frontmatter: Frontmatter
  slug: string
  conflict: boolean
  conflictType?: 'slug' | 'title'
  errors: string[]
  content: string
}

export interface ImportPreviewResponse {
  success: boolean
  previews: ImportPreview[]
  totalFiles: number
  validFiles: number
  conflictFiles: number
}

// POST /api/posts/import - Preview uploaded .md files
export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    await requireAdminAccess()

    const formData = await request.formData()
    const files = formData.getAll('files')

    if (!files || files.length === 0) {
      throw new ValidationError("No files uploaded")
    }

    const previews: ImportPreview[] = []

    // Get existing slugs for conflict detection
    const existingSlugs = await db.post.findMany({
      select: { slug: true }
    })
    const slugSet = new Set(existingSlugs.map(p => p.slug))

    for (const file of files) {
      if (!(file instanceof File)) continue

      // Validate file type
      if (!file.name.endsWith('.md')) {
        previews.push({
          filename: file.name,
          frontmatter: { title: '', date: '' },
          slug: '',
          conflict: false,
          errors: ['File must be a .md file'],
          content: ''
        })
        continue
      }

      // Read file content
      const text = await file.text()

      // Parse frontmatter
      const { frontmatter, content } = parseFrontmatter(text)

      // Validate frontmatter
      const validation = validateFrontmatter(frontmatter)

      // Determine slug (use frontmatter slug, or generate from title, or from filename)
      let slug = frontmatter.slug
      if (!slug && frontmatter.title) {
        slug = generateSlug(frontmatter.title)
      }
      if (!slug) {
        slug = slugFromFilename(file.name)
      }

      // Check for slug conflicts
      const conflict = slugSet.has(slug)

      // Add to slugSet for detecting conflicts within the batch
      slugSet.add(slug)

      previews.push({
        filename: file.name,
        frontmatter,
        slug,
        conflict,
        conflictType: conflict ? 'slug' : undefined,
        errors: validation.errors,
        content
      })
    }

    const validFiles = previews.filter(p => p.errors.length === 0).length
    const conflictFiles = previews.filter(p => p.conflict).length

    const response: ImportPreviewResponse = {
      success: true,
      previews,
      totalFiles: previews.length,
      validFiles,
      conflictFiles
    }

    return NextResponse.json(response)
  } catch (error) {
    return handleApiError(error)
  }
}
