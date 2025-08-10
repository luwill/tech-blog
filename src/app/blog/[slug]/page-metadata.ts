import { generateSEO } from '@/lib/seo'

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/posts/slug/${slug}`)
    
    if (!response.ok) {
      return generateSEO({
        title: 'Post not found',
        description: 'The requested blog post could not be found.'
      })
    }
    
    const { post } = await response.json()
    
    return generateSEO({
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
      section: post.category?.name,
      tags: post.tags.map((tag: { name: string }) => tag.name),
      keywords: [
        ...post.tags.map((tag: { name: string }) => tag.name),
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