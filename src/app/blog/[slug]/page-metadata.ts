import { generateSEO } from '@/lib/seo'
import { getPublishedPost } from '@/lib/posts'

// Generate metadata for SEO — 与页面共享 getPublishedPost 的 React cache，避免重复查询
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  try {
    const post = await getPublishedPost(slug)

    if (!post) {
      return generateSEO({
        title: 'Post not found',
        description: 'The requested blog post could not be found.'
      })
    }

    return generateSEO({
      title: post.title,
      description: post.excerpt || '',
      url: `/blog/${post.slug}`,
      image: `/og?title=${encodeURIComponent(post.title)}`,
      type: 'article',
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.author.name || 'LouWill'],
      section: post.category?.name,
      tags: post.tags.map((tag) => tag.name),
      keywords: [
        ...post.tags.map((tag) => tag.name),
        post.category?.name,
        'AI', 'Technology', 'Blog', 'LouWill'
      ].filter((k): k is string => Boolean(k))
    })
  } catch (error) {
    console.error('Error generating metadata:', error)
    return generateSEO({
      title: 'Blog Post',
      description: 'Read the latest insights on AI and technology.'
    })
  }
}
