import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Count words in a text string
 */
export function countWords(text: string): number {
  if (!text) return 0
  
  // More comprehensive markdown cleanup
  const cleanText = text
    // Remove YAML front matter
    .replace(/^---[\s\S]*?---\n/g, '')
    // Remove code blocks (fenced with ``` or indented)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^    .+$/gm, ' ')
    // Remove inline code
    .replace(/`[^`\n]*`/g, ' ')
    // Remove images
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    // Remove links but keep text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    // Remove HTML tags
    .replace(/<[^>]*>/g, ' ')
    // Remove markdown headers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove horizontal rules
    .replace(/^[-*_]{3,}$/gm, '')
    // Remove list markers
    .replace(/^[\s]*[-*+]\s+/gm, '')
    .replace(/^[\s]*\d+\.\s+/gm, '')
    // Remove blockquotes
    .replace(/^>\s*/gm, '')
    // Remove emphasis markers but keep text
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // Remove strikethrough
    .replace(/~~(.*?)~~/g, '$1')
    // Replace multiple whitespace with single space
    .replace(/\s+/g, ' ')
    // Remove extra punctuation that might create false word boundaries
    .replace(/[^\w\s\u4e00-\u9fff\u3400-\u4dbf]/g, ' ')
    .trim()
  
  if (!cleanText) return 0
  
  // Count words - handle both English and Chinese
  const words = cleanText.split(/\s+/).filter(word => {
    // Filter out empty strings and very short fragments
    return word.length > 0 && word.trim().length > 0
  })
  
  // For mixed content, also count Chinese characters
  let chineseCharCount = 0
  const chineseChars = cleanText.match(/[\u4e00-\u9fff]/g)
  if (chineseChars) {
    chineseCharCount = chineseChars.length
  }
  
  // Approximate: each Chinese character counts as one word
  // English words are counted normally
  const englishWords = words.filter(word => !/[\u4e00-\u9fff]/.test(word)).length
  
  return englishWords + chineseCharCount
}

/**
 * Truncate text to specified character length
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text
  
  // Find the last space before the max length to avoid cutting words
  const truncated = text.substring(0, maxLength)
  const lastSpaceIndex = truncated.lastIndexOf(' ')
  
  if (lastSpaceIndex > 0 && lastSpaceIndex > maxLength * 0.8) {
    return text.substring(0, lastSpaceIndex) + '...'
  }
  
  return truncated + '...'
}

/**
 * Get preview text from content (plain text without markdown)
 */
export function getContentPreview(content: string, maxLength: number = 150): string {
  if (!content) return ''
  
  // Remove markdown syntax for preview
  const plainText = content
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`[^`]*`/g, '') // Remove inline code
    .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Keep link text only
    .replace(/#{1,6}\s*/g, '') // Remove headers
    .replace(/[*_~]/g, '') // Remove formatting
    .replace(/\n\s*\n/g, ' ') // Replace multiple newlines with space
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
  
  return truncateText(plainText, maxLength)
}