import { z } from 'zod'
import { CONFIG } from '../constants'

/**
 * Post validation schemas
 */

// Create post request body
export const CreatePostSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(CONFIG.CONTENT.TITLE_MAX_LENGTH, `Title must be at most ${CONFIG.CONTENT.TITLE_MAX_LENGTH} characters`),
  content: z.string()
    .min(1, 'Content is required'),
  excerpt: z.string()
    .max(500, 'Excerpt must be at most 500 characters')
    .optional(),
  categoryId: z.string().cuid().optional().nullable(),
  tags: z.array(z.string().min(1).max(50))
    .min(1, 'At least one tag is required')
    .max(10, 'Maximum 10 tags allowed')
    .default([]),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
})

export type CreatePostInput = z.infer<typeof CreatePostSchema>

// Update post request body (all fields optional)
export const UpdatePostSchema = CreatePostSchema.partial()

export type UpdatePostInput = z.infer<typeof UpdatePostSchema>

// Post query parameters
export const PostQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  category: z.string().optional(),
  tag: z.string().optional(),
  published: z.enum(['true', 'false']).optional(),
  featured: z.enum(['true', 'false']).optional(),
  search: z.string().optional(),
})

export type PostQueryInput = z.infer<typeof PostQuerySchema>

// Search query parameters
export const SearchQuerySchema = z.object({
  q: z.string().min(1).optional(),
  category: z.string().optional(),
  tag: z.string().optional(),
  sort: z.enum(['relevance', 'newest', 'oldest', 'popular', 'title']).default('relevance'),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  offset: z.coerce.number().int().min(0).default(0),
})

export type SearchQueryInput = z.infer<typeof SearchQuerySchema>
