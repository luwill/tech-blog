import { z } from 'zod'

/**
 * Category validation schemas
 */

// Create category request body
export const CreateCategorySchema = z.object({
  name: z.string()
    .min(1, 'Category name is required')
    .max(50, 'Category name must be at most 50 characters'),
  description: z.string()
    .max(200, 'Description must be at most 200 characters')
    .optional(),
})

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>

// Update category request body
export const UpdateCategorySchema = CreateCategorySchema.partial()

export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>
