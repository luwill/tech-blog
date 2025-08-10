// API client utilities

export interface CreatePostData {
  title: string
  content: string
  excerpt?: string
  categoryId?: string
  tags: string[]
  published?: boolean
  featured?: boolean
}

export interface UpdatePostData extends Partial<CreatePostData> {
  id: string
}

export interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  published: boolean
  featured: boolean
  views: number
  readTime: number
  createdAt: string
  updatedAt: string
  author: {
    name: string
    email: string
  }
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
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  _count?: {
    posts: number
  }
}

export interface Tag {
  id: string
  name: string
  slug: string
}

// Posts API
export const postsApi = {
  // Get all posts
  async getAll(params?: {
    page?: number
    limit?: number
    category?: string
    tag?: string
    published?: boolean
  }) {
    const searchParams = new URLSearchParams()
    
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.category) searchParams.set('category', params.category)
    if (params?.tag) searchParams.set('tag', params.tag)
    if (params?.published !== undefined) {
      searchParams.set('published', params.published.toString())
    }

    const response = await fetch(`/api/posts?${searchParams}`)
    if (!response.ok) throw new Error('Failed to fetch posts')
    return response.json()
  },

  // Get single post
  async getById(id: string): Promise<Post> {
    const response = await fetch(`/api/posts/${id}`)
    if (!response.ok) throw new Error('Failed to fetch post')
    return response.json()
  },

  // Create post
  async create(data: CreatePostData): Promise<Post> {
    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create post')
    }
    
    return response.json()
  },

  // Update post
  async update(data: UpdatePostData): Promise<Post> {
    const { id, ...updateData } = data
    const response = await fetch(`/api/posts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update post')
    }
    
    return response.json()
  },

  // Delete post
  async delete(id: string): Promise<void> {
    const response = await fetch(`/api/posts/${id}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete post')
    }
  }
}

// Categories API
export const categoriesApi = {
  // Get all categories
  async getAll(): Promise<Category[]> {
    const response = await fetch('/api/categories')
    if (!response.ok) throw new Error('Failed to fetch categories')
    return response.json()
  },

  // Create category
  async create(data: { name: string; description?: string }): Promise<Category> {
    const response = await fetch('/api/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create category')
    }
    
    return response.json()
  }
}

// Error handling utility
export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred'
}