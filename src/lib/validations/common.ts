import { z } from 'zod'
import { CONFIG } from '../constants'

/**
 * Common validation schemas used across multiple features
 */

// Pagination query parameters
export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(CONFIG.PAGINATION.DEFAULT_PAGE),
  limit: z.coerce.number().int().min(1).max(CONFIG.PAGINATION.MAX_LIMIT).default(CONFIG.PAGINATION.DEFAULT_LIMIT),
})

export type PaginationInput = z.infer<typeof PaginationSchema>

// ID parameter (cuid format)
export const IdSchema = z.string().cuid()

// Slug validation
export const SlugSchema = z.string()
  .min(1)
  .max(CONFIG.CONTENT.SLUG_MAX_LENGTH)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format')

// Email validation
export const EmailSchema = z.string().email()

// URL validation
export const UrlSchema = z.string().url()

// Date range for analytics
export const DateRangeSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  period: z.enum(['24h', '7d', '30d', '90d', '1y']).optional().default('7d'),
})

export type DateRangeInput = z.infer<typeof DateRangeSchema>
