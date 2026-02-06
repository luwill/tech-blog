// Calculate estimated reading time
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

// Generate slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

// Extract excerpt from markdown content
export function extractExcerpt(markdown: string, maxLength: number = 160): string {
  // Remove markdown syntax
  const plainText = markdown
    .replace(/#{1,6}\s+/g, '') // Remove headings
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/`(.*?)`/g, '$1') // Remove inline code
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim()

  return plainText.length > maxLength 
    ? plainText.substring(0, maxLength) + '...'
    : plainText
}

// Validate markdown content
export function validateMarkdownPost(data: {
  title: string
  content: string
  category: string
  tags: string[]
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.title.trim()) {
    errors.push('Title is required')
  }

  if (!data.content.trim()) {
    errors.push('Content is required')
  }

  if (!data.category) {
    errors.push('Category is required')
  }

  if (data.tags.length === 0) {
    errors.push('At least one tag is required')
  }

  if (data.title.length > 100) {
    errors.push('Title must be less than 100 characters')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}