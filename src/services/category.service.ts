import { db } from '@/lib/db'
import { generateSlug } from '@/lib/markdown'
import { ConflictError, NotFoundError } from '@/lib/error-handler'
import type { CreateCategoryInput, UpdateCategoryInput } from '@/lib/validations'

/**
 * Category service - handles category-related business logic
 */
export const categoryService = {
  /**
   * Get all categories with published post count
   */
  async getAllCategories() {
    return db.category.findMany({
      include: {
        _count: {
          select: {
            posts: {
              where: { published: true }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    })
  },

  /**
   * Get category by ID
   */
  async getCategoryById(id: string) {
    const category = await db.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            posts: {
              where: { published: true }
            }
          }
        }
      }
    })

    if (!category) {
      throw new NotFoundError('Category not found')
    }

    return category
  },

  /**
   * Get category by slug
   */
  async getCategoryBySlug(slug: string) {
    const category = await db.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            posts: {
              where: { published: true }
            }
          }
        }
      }
    })

    if (!category) {
      throw new NotFoundError('Category not found')
    }

    return category
  },

  /**
   * Create a new category
   */
  async createCategory(input: CreateCategoryInput) {
    const slug = generateSlug(input.name)

    // Check if category already exists
    const existing = await db.category.findUnique({
      where: { slug }
    })

    if (existing) {
      throw new ConflictError('Category already exists')
    }

    return db.category.create({
      data: {
        name: input.name,
        slug,
        description: input.description
      }
    })
  },

  /**
   * Update a category
   */
  async updateCategory(id: string, input: UpdateCategoryInput) {
    // Check if category exists
    const existing = await db.category.findUnique({
      where: { id }
    })

    if (!existing) {
      throw new NotFoundError('Category not found')
    }

    // If name is being updated, generate new slug
    const updateData: Record<string, unknown> = {}

    if (input.name) {
      updateData.name = input.name
      updateData.slug = generateSlug(input.name)

      // Check if new slug conflicts with another category
      const slugConflict = await db.category.findFirst({
        where: {
          slug: updateData.slug as string,
          id: { not: id }
        }
      })

      if (slugConflict) {
        throw new ConflictError('A category with this name already exists')
      }
    }

    if (input.description !== undefined) {
      updateData.description = input.description
    }

    return db.category.update({
      where: { id },
      data: updateData
    })
  },

  /**
   * Delete a category
   */
  async deleteCategory(id: string) {
    const existing = await db.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    })

    if (!existing) {
      throw new NotFoundError('Category not found')
    }

    // Prevent deletion if category has posts
    if (existing._count.posts > 0) {
      throw new ConflictError('Cannot delete category with existing posts')
    }

    return db.category.delete({
      where: { id }
    })
  }
}
