import { getPublishedPostSummaries, getCategoriesWithCounts } from '@/lib/posts'
import BlogListClient from './blog-list-client'

// ISR：列表最多 5 分钟内反映 CLI 的内容变更
export const revalidate = 300

async function loadListData() {
  try {
    return await Promise.all([
      getPublishedPostSummaries(),
      getCategoriesWithCounts(),
    ])
  } catch (error) {
    // 构建期数据库不可达时渲染空壳，ISR 会在运行时（≤5 分钟）用真实数据重新生成
    console.error('Error loading blog list data:', error)
    return [[], []] as const
  }
}

export default async function BlogPage() {
  const [posts, categories] = await loadListData()

  return (
    <BlogListClient
      posts={posts.map((post) => ({
        ...post,
        createdAt: post.createdAt.toISOString(),
      }))}
      categories={categories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        count: category._count.posts,
      }))}
    />
  )
}
