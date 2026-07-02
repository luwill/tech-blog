interface SearchParams {
  query?: string
  category?: string
  tag?: string
  sort?: 'relevance' | 'newest' | 'oldest' | 'popular' | 'title'
  limit?: number
  offset?: number
}

interface SearchResult {
  posts: Array<{
    id: string
    title: string
    slug: string
    excerpt: string
    views: number
    readTime: number
    createdAt: string
    category?: {
      id: string
      name: string
      slug: string
    }
    tags: Array<{
      id: string
      name: string
      slug: string
    }>
    author: {
      name: string
      email: string
    }
  }>
  pagination: {
    currentPage: number
    totalPages: number
    totalCount: number
    limit: number
    offset: number
    hasMore: boolean
  }
  filters: {
    query?: string
    category?: string
    tag?: string
    sortBy: string
  }
  suggestions: string[]
}

export async function searchPosts(params: SearchParams): Promise<SearchResult | null> {
  try {
    const searchParams = new URLSearchParams()
    
    if (params.query) searchParams.set('q', params.query)
    if (params.category) searchParams.set('category', params.category)
    if (params.tag) searchParams.set('tag', params.tag)
    if (params.sort) searchParams.set('sort', params.sort)
    if (params.limit) searchParams.set('limit', params.limit.toString())
    if (params.offset) searchParams.set('offset', params.offset.toString())
    
    const response = await fetch(`/api/search?${searchParams.toString()}`)
    
    if (!response.ok) {
      throw new Error('Search request failed')
    }
    
    const result = await response.json()
    return result.success ? result.data : null
  } catch (error) {
    console.error('Search error:', error)
    return null
  }
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// 输出经过 HTML 转义，可安全用于 dangerouslySetInnerHTML；
// 搜索词先做同样的转义，保证能匹配到转义后的文本
export function highlightSearchTerm(text: string, searchTerm: string): string {
  if (!text) return ''

  const escapedText = escapeHtml(text)
  if (!searchTerm) return escapedText

  const escapedTerm = escapeHtml(searchTerm).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escapedTerm})`, 'gi')
  return escapedText.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>')
}

export function generateSearchSuggestions(query: string): string[] {
  // Common AI and tech terms for suggestions
  const commonTerms = [
    'artificial intelligence', 'machine learning', 'deep learning',
    'neural networks', 'natural language processing', 'computer vision',
    'transformers', 'GPT', 'Claude', 'OpenAI', 'PyTorch', 'TensorFlow',
    'algorithms', 'data science', 'python', 'javascript', 'react',
    'next.js', 'node.js', 'database', 'API', 'web development'
  ]
  
  const lowerQuery = query.toLowerCase()
  return commonTerms
    .filter(term => term.includes(lowerQuery) && term !== lowerQuery)
    .slice(0, 5)
}