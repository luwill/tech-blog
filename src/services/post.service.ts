import { db } from '@/lib/db'
import { generateSlug, calculateReadingTime, extractExcerpt } from '@/lib/markdown'
import { ConflictError, NotFoundError } from '@/lib/error-handler'
import { tagService } from './tag.service'
import type { CreatePostInput, UpdatePostInput } from '@/lib/validations'

export interface PostQueryOptions {
  page?: number
  limit?: number
  category?: string
  tag?: string
  published?: boolean
  featured?: boolean
  search?: string
}

/**
 * Post service - handles post-related business logic
 */
export const postService = {
  /**
   * Get posts with pagination and filters
   */
  async getPosts(options: PostQueryOptions = {}) {
    const {
      page = 1,
      limit = 10,
      category,
      tag,
      published = true,
      featured,
      search
    } = options

    const where: Record<string, unknown> = {}

    if (published !== undefined) {
      where.published = published
    }

    if (featured !== undefined) {
      where.featured = featured
    }

    if (category) {
      where.category = { slug: category }
    }

    if (tag) {
      where.tags = { some: { slug: tag } }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [posts, total] = await Promise.all([
      db.post.findMany({
        where,
        include: {
          author: {
            select: { name: true, email: true }
          },
          category: {
            select: { name: true, slug: true }
          },
          tags: {
            select: { name: true, slug: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      db.post.count({ where })
    ])

    return {
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  },

  /**
   * Get post by slug
   */
  async getPostBySlug(slug: string, incrementViews = false) {
    const post = await db.post.findUnique({
      where: { slug },
      include: {
        author: {
          select: { name: true, email: true, image: true }
        },
        category: {
          select: { name: true, slug: true }
        },
        tags: {
          select: { name: true, slug: true }
        }
      }
    })

    if (!post) {
      throw new NotFoundError('Post not found')
    }

    // Increment views if requested
    if (incrementViews) {
      await db.post.update({
        where: { id: post.id },
        data: { views: { increment: 1 } }
      })
    }

    return post
  },

  /**
   * Get post by ID
   */
  async getPostById(id: string) {
    const post = await db.post.findUnique({
      where: { id },
      include: {
        author: {
          select: { name: true, email: true }
        },
        category: {
          select: { name: true, slug: true }
        },
        tags: {
          select: { name: true, slug: true }
        }
      }
    })

    if (!post) {
      throw new NotFoundError('Post not found')
    }

    return post
  },

  /**
   * Create a new post
   */
  async createPost(input: CreatePostInput, authorId: string) {
    const slug = generateSlug(input.title)

    // Check if slug already exists
    const existing = await db.post.findUnique({
      where: { slug }
    })

    if (existing) {
      throw new ConflictError('A post with this title already exists')
    }

    // Calculate reading time and generate excerpt
    const readTime = calculateReadingTime(input.content)
    const excerpt = input.excerpt || extractExcerpt(input.content)

    // Get or create tags
    const tagConnections = await tagService.getOrCreateTags(input.tags)

    // Build create data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createData: any = {
      title: input.title,
      slug,
      content: input.content,
      excerpt,
      published: input.published ?? false,
      featured: input.featured ?? false,
      readTime,
      authorId,
      tags: {
        connect: tagConnections.map(t => ({ id: t.id }))
      }
    }

    if (input.categoryId) {
      createData.category = { connect: { id: input.categoryId } }
    }

    return db.post.create({
      data: createData,
      include: {
        author: {
          select: { name: true, email: true }
        },
        category: {
          select: { name: true, slug: true }
        },
        tags: {
          select: { name: true, slug: true }
        }
      }
    })
  },

  /**
   * Update a post
   */
  async updatePost(id: string, input: UpdatePostInput) {
    const existing = await db.post.findUnique({
      where: { id }
    })

    if (!existing) {
      throw new NotFoundError('Post not found')
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {}

    if (input.title) {
      updateData.title = input.title
      updateData.slug = generateSlug(input.title)

      // Check for slug conflict
      const slugConflict = await db.post.findFirst({
        where: {
          slug: updateData.slug,
          id: { not: id }
        }
      })

      if (slugConflict) {
        throw new ConflictError('A post with this title already exists')
      }
    }

    if (input.content) {
      updateData.content = input.content
      updateData.readTime = calculateReadingTime(input.content)
    }

    if (input.excerpt !== undefined) {
      updateData.excerpt = input.excerpt
    }

    if (input.published !== undefined) {
      updateData.published = input.published
    }

    if (input.featured !== undefined) {
      updateData.featured = input.featured
    }

    if (input.categoryId !== undefined) {
      updateData.category = input.categoryId
        ? { connect: { id: input.categoryId } }
        : { disconnect: true }
    }

    if (input.tags) {
      const tagConnections = await tagService.getOrCreateTags(input.tags)
      updateData.tags = {
        set: [],
        connect: tagConnections.map(t => ({ id: t.id }))
      }
    }

    return db.post.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: { name: true, email: true }
        },
        category: {
          select: { name: true, slug: true }
        },
        tags: {
          select: { name: true, slug: true }
        }
      }
    })
  },

  /**
   * Delete a post
   */
  async deletePost(id: string) {
    const existing = await db.post.findUnique({
      where: { id }
    })

    if (!existing) {
      throw new NotFoundError('Post not found')
    }

    return db.post.delete({
      where: { id }
    })
  },

  /**
   * Toggle post like
   */
  async toggleLike(postId: string) {
    const post = await db.post.findUnique({
      where: { id: postId },
      select: { likes: true }
    })

    if (!post) {
      throw new NotFoundError('Post not found')
    }

    return db.post.update({
      where: { id: postId },
      data: { likes: { increment: 1 } },
      select: { id: true, likes: true }
    })
  },

  /**
   * Get featured posts
   */
  async getFeaturedPosts(limit = 5) {
    return db.post.findMany({
      where: {
        published: true,
        featured: true
      },
      include: {
        author: {
          select: { name: true }
        },
        category: {
          select: { name: true, slug: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })
  },

  /**
   * Get related posts (same category or tags)
   */
  async getRelatedPosts(postId: string, limit = 4) {
    const post = await db.post.findUnique({
      where: { id: postId },
      include: {
        tags: { select: { id: true } }
      }
    })

    if (!post) {
      throw new NotFoundError('Post not found')
    }

    const tagIds = post.tags.map(t => t.id)

    return db.post.findMany({
      where: {
        published: true,
        id: { not: postId },
        OR: [
          { categoryId: post.categoryId },
          { tags: { some: { id: { in: tagIds } } } }
        ]
      },
      include: {
        category: {
          select: { name: true, slug: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })
  }
}
