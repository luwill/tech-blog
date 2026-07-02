import { notFound } from 'next/navigation'
import { getPublishedPost, getRelatedPosts } from '@/lib/posts'
import BlogPostClient, { type Post } from './blog-post-client'

// Export metadata generation
export { generateMetadata } from './page-metadata'

// ISR：CLI 直写数据库后，页面最多 5 分钟内更新
export const revalidate = 300

export async function generateStaticParams() {
  // 不在构建期预渲染文章页：并行构建 worker 会打满 Supabase 连接池（P1001）。
  // 文章按需渲染（首次访问）后由 ISR 缓存，效果等同。
  return []
}

type PostRow = Omit<Post, 'createdAt' | 'updatedAt'> & {
  createdAt: Date
  updatedAt: Date
}

function serializePost(post: PostRow): Post {
  return {
    ...post,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPublishedPost(slug)

  if (!post) {
    notFound()
  }

  const relatedPosts = post.category
    ? await getRelatedPosts(post.category.id, post.id)
    : []

  return (
    <BlogPostClient
      post={serializePost(post)}
      relatedPosts={relatedPosts.map(serializePost)}
    />
  )
}
