import { cache } from 'react'
import { db } from '@/lib/db'

/**
 * 服务端文章查询（Server Components / generateMetadata 专用）。
 * getPublishedPost 用 React cache() 去重：同一次渲染中 metadata 和页面共享一次查询。
 */
export const getPublishedPost = cache(async (slug: string) => {
  return db.post.findUnique({
    where: { slug, published: true },
    include: {
      author: { select: { name: true, email: true } },
      category: { select: { id: true, name: true, slug: true } },
      tags: { select: { id: true, name: true, slug: true } },
    },
  })
})

export async function getRelatedPosts(categoryId: string, excludePostId: string, take = 3) {
  return db.post.findMany({
    where: { published: true, categoryId, id: { not: excludePostId } },
    orderBy: { createdAt: 'desc' },
    take,
    include: {
      author: { select: { name: true, email: true } },
      category: { select: { id: true, name: true, slug: true } },
      tags: { select: { id: true, name: true, slug: true } },
    },
  })
}

// 列表页摘要：不含 content，避免把全文打进列表 payload
export async function getPublishedPostSummaries() {
  return db.post.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      featured: true,
      views: true,
      readTime: true,
      createdAt: true,
      category: { select: { name: true, slug: true } },
      tags: { select: { name: true, slug: true } },
    },
  })
}

export async function getCategoriesWithCounts() {
  return db.category.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
      _count: { select: { posts: { where: { published: true } } } },
    },
  })
}
