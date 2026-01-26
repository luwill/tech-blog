/**
 * Frontmatter parsing and generation utilities for Markdown import/export
 */

export interface Frontmatter {
  title: string
  date: string
  category?: string
  tags?: string[]
  excerpt?: string
  published?: boolean
  featured?: boolean
  slug?: string
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

/**
 * Simple YAML parser for frontmatter
 * Handles basic key-value pairs and arrays
 */
function parseYaml(yaml: string): Frontmatter {
  const result: Record<string, unknown> = {}
  const lines = yaml.split('\n')
  let currentKey: string | null = null
  let currentArray: string[] | null = null

  for (const line of lines) {
    // Skip empty lines
    if (!line.trim()) continue

    // Check for array item
    if (line.match(/^\s+-\s+/)) {
      const value = line.replace(/^\s+-\s+/, '').trim()
      if (currentArray && currentKey) {
        currentArray.push(removeQuotes(value))
      }
      continue
    }

    // Check for key-value pair
    const keyValueMatch = line.match(/^(\w+):\s*(.*)$/)
    if (keyValueMatch) {
      // Save previous array if any
      if (currentKey && currentArray) {
        result[currentKey] = currentArray
      }

      currentKey = keyValueMatch[1]
      const value = keyValueMatch[2].trim()

      // Check if value is an inline array [item1, item2]
      if (value.startsWith('[') && value.endsWith(']')) {
        const arrayItems = value
          .slice(1, -1)
          .split(',')
          .map(item => removeQuotes(item.trim()))
          .filter(item => item.length > 0)
        result[currentKey] = arrayItems
        currentArray = null
      } else if (value === '' || value === '[]') {
        // Empty value or empty array - start collecting array items
        currentArray = []
      } else {
        // Simple value
        result[currentKey] = parseValue(value)
        currentArray = null
      }
    }
  }

  // Save last array if any
  if (currentKey && currentArray) {
    result[currentKey] = currentArray
  }

  return {
    title: (result.title as string) || '',
    date: (result.date as string) || new Date().toISOString().split('T')[0],
    category: result.category as string | undefined,
    tags: result.tags as string[] | undefined,
    excerpt: result.excerpt as string | undefined,
    published: result.published as boolean | undefined,
    featured: result.featured as boolean | undefined,
    slug: result.slug as string | undefined
  }
}

/**
 * Remove surrounding quotes from a string
 */
function removeQuotes(str: string): string {
  if ((str.startsWith('"') && str.endsWith('"')) ||
      (str.startsWith("'") && str.endsWith("'"))) {
    return str.slice(1, -1)
  }
  return str
}

/**
 * Parse a YAML value into appropriate type
 */
function parseValue(value: string): string | boolean | number {
  // Remove quotes
  const unquoted = removeQuotes(value)

  // Boolean
  if (unquoted.toLowerCase() === 'true') return true
  if (unquoted.toLowerCase() === 'false') return false

  // Number
  if (!isNaN(Number(unquoted)) && unquoted !== '') {
    return Number(unquoted)
  }

  return unquoted
}

/**
 * Generate frontmatter YAML from post data
 */
export function generateFrontmatter(post: {
  title: string
  createdAt: Date | string
  category?: { name: string } | null
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
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
}

/**
 * Generate complete markdown file content from post data
 */
export function toMarkdownFile(post: {
  title: string
  content: string
  createdAt: Date | string
  category?: { name: string } | null
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
