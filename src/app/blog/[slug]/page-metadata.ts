import { generateSEO } from '@/lib/seo'
import { db } from '@/lib/db'

// Generate metadata for SEO using direct database access
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  try {
    // Direct database query instead of HTTP fetch to avoid timeout
    const post = await db.post.findUnique({
      where: { slug, published: true },
      select: {
        title: true,
        slug: true,
        excerpt: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: { name: true }
        },
        category: {
          select: { name: true }
        },
        tags: {
          select: { name: true }
        }
      }
    })

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
      ].filter(Boolean)
    })
  } catch (error) {
    console.error('Error generating metadata:', error)
    return generateSEO({
      title: 'Blog Post',
      description: 'Read the latest insights on AI and technology.'
    })
  }
}