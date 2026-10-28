/**
 * Frontmatter parsing and generation utilities for Markdown import/export
 */

import { parseDocument } from 'yaml'
import { z } from 'zod'

export type ImportStatus = 'ready' | 'failed' | 'preview'

export interface Frontmatter {
  title: string
  date: string
  category?: string
  categorySlug?: string
  tags?: string[]
  excerpt?: string
  published?: boolean
  featured?: boolean
  slug?: string
  importStatus?: ImportStatus
}

export interface ParsedMarkdown {
  frontmatter: Frontmatter
  content: string
}

export interface FrontmatterValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * Parse frontmatter from markdown content
 * Extracts YAML between --- delimiters
 */
export function parseFrontmatter(markdown: string): ParsedMarkdown {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/
  const match = markdown.match(frontmatterRegex)

  if (!match) {
    // No frontmatter found, treat entire content as markdown
    return {
      frontmatter: {
        title: '',
        date: new Date().toISOString().split('T')[0]
      },
      content: markdown.trim()
    }
  }

  const yamlContent = match[1]
  const markdownContent = match[2].trim()

  const frontmatter = parseYaml(yamlContent)

  return {
    frontmatter,
    content: markdownContent
  }
}

const FrontmatterSchema = z.object({
  title: z.string().default(''),
  date: z.string().default(() => new Date().toISOString().split('T')[0]),
  category: z.string().optional(),
  categorySlug: z.string().optional(),
  tags: z.array(z.string()).optional(),
  excerpt: z.string().optional(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
  slug: z.string().optional(),
  importStatus: z.enum(['ready', 'failed', 'preview']).optional(),
})

function yamlDocument(yaml: string) {
  const doc = parseDocument(yaml, { version: '1.2', uniqueKeys: true })
  if (doc.errors.length > 0) throw new Error(`Invalid frontmatter YAML: ${doc.errors[0].message}`)
  return doc
}

function parseYaml(yaml: string): Frontmatter {
  // 标准 YAML 保留带引号的布尔/数字和数组里的逗号，禁止别名展开。
  const value: unknown = yamlDocument(yaml).toJS({ maxAliasCount: 0 })
  const parsed = FrontmatterSchema.safeParse(value)
  if (!parsed.success) {
    const errors = parsed.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`)
    throw new Error(`Invalid frontmatter: ${errors.join('; ')}`)
  }
  return parsed.data
}

/** 保留原始元数据；预览或迁图失败必须同时标记状态并降为草稿。 */
export function markImportStatus(markdown: string, status: ImportStatus): string {
  const match = markdown.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/)
  if (!match) throw new Error('Imported markdown must have frontmatter')
  const doc = yamlDocument(match[1])
  doc.set('importStatus', status)
  if (status !== 'ready') doc.set('published', false)
  return `---\n${doc.toString()}---\n\n${match[2]}`
}

/**
 * Generate frontmatter YAML from post data
 */
export function generateFrontmatter(post: {
  title: string
  createdAt: Date | string
  category?: { name: string; slug?: string } | null
  tags?: { name: string }[]
  excerpt?: string | null
  published?: boolean
  featured?: boolean
  slug: string
}): string {
  const lines: string[] = ['---']

  // Title (always include)
  lines.push(`title: "${escapeYamlString(post.title)}"`)

  // Date
  const date = post.createdAt instanceof Date
    ? post.createdAt.toISOString().split('T')[0]
    : new Date(post.createdAt).toISOString().split('T')[0]
  lines.push(`date: "${date}"`)

  // Category
  if (post.category?.name) {
    lines.push(`category: "${escapeYamlString(post.category.name)}"`)
    if (post.category.slug) {
      lines.push(`categorySlug: "${escapeYamlString(post.category.slug)}"`)
    }
  }

  // Tags
  if (post.tags && post.tags.length > 0) {
    const tagList = post.tags.map(t => `"${escapeYamlString(t.name)}"`).join(', ')
    lines.push(`tags: [${tagList}]`)
  }

  // Excerpt
  if (post.excerpt) {
    lines.push(`excerpt: "${escapeYamlString(post.excerpt)}"`)
  }

  // Published
  lines.push(`published: ${post.published ?? false}`)

  // Featured
  lines.push(`featured: ${post.featured ?? false}`)

  // Slug
  lines.push(`slug: "${escapeYamlString(post.slug)}"`)

  lines.push('---')

  return lines.join('\n')
}

/**
 * Escape special characters in YAML strings
 */
function escapeYamlString(str: string): string {
  // JSON 双引号转义是 YAML 1.2 的子集，也覆盖制表符与回车。
  return JSON.stringify(str).slice(1, -1)
}

/**
 * Generate complete markdown file content from post data
 */
export function toMarkdownFile(post: {
  title: string
  content: string
  createdAt: Date | string
  category?: { name: string; slug?: string } | null
  tags?: { name: string }[]
  excerpt?: string | null
  published?: boolean
  featured?: boolean
  slug: string
}): string {
  const frontmatter = generateFrontmatter(post)
  return `${frontmatter}\n\n${post.content}`
}

/**
 * Validate frontmatter has required fields
 */
export function validateFrontmatter(fm: Frontmatter): FrontmatterValidationResult {
  const errors: string[] = []

  const parsed = FrontmatterSchema.safeParse(fm)
  if (!parsed.success) {
    return { isValid: false, errors: parsed.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`) }
  }

  if (!fm.title || fm.title.trim() === '') {
    errors.push('Title is required')
  }

  if (fm.title && fm.title.length > 200) {
    errors.push('Title must be less than 200 characters')
  }

  if (fm.excerpt && fm.excerpt.length > 500) {
    errors.push('Excerpt must be less than 500 characters')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Generate slug from filename (remove .md extension and sanitize)
 */
export function slugFromFilename(filename: string): string {
  return filename
    .replace(/\.md$/i, '')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
