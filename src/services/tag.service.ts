import { db } from '@/lib/db'
import { generateSlug } from '@/lib/markdown'

export interface TagInput {
  name: string
}

/**
 * Tag service - handles tag-related business logic
 */
export const tagService = {
  /**
   * Get or create tags from a list of names
   * Uses batch operations to avoid N+1 queries
   */
  async getOrCreateTags(tagNames: string[]): Promise<{ id: string }[]> {
    if (!tagNames || tagNames.length === 0) {
      return []
    }

    // Generate slugs for all tags
    const tagData = tagNames.map((name) => ({
      name,
      slug: generateSlug(name)
    }))
    const tagSlugs = tagData.map(t => t.slug)

    // Find existing tags in single query
    const existingTags = await db.tag.findMany({
      where: { slug: { in: tagSlugs } },
      select: { id: true, slug: true }
    })
    const existingSlugs = new Set(existingTags.map(t => t.slug))

    // Find tags that need to be created
    const newTags = tagData.filter(t => !existingSlugs.has(t.slug))

    // Batch create new tags
    if (newTags.length > 0) {
      await db.tag.createMany({
        data: newTags,
        skipDuplicates: true
      })
    }

    // Get all tag IDs in single query
    const allTags = await db.tag.findMany({
      where: { slug: { in: tagSlugs } },
      select: { id: true }
    })

    return allTags
  },

  /**
   * Get all tags with post count
   */
  async getAllTags() {
    return db.tag.findMany({
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
   * Get popular tags (by post count)
   */
  async getPopularTags(limit: number = 10) {
    const tags = await db.tag.findMany({
      include: {
        _count: {
          select: {
            posts: {
              where: { published: true }
            }
          }
        }
      },
      orderBy: {
        posts: {
          _count: 'desc'
        }
      },
      take: limit
    })

    return tags.filter(tag => tag._count.posts > 0)
  },

  /**
   * Delete unused tags (no posts)
   */
  async deleteUnusedTags() {
    const result = await db.tag.deleteMany({
      where: {
        posts: {
          none: {}
        }
      }
    })

    return result.count
  }
}
