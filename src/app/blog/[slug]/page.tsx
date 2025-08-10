import BlogPostClient from './blog-post-client'

// Export metadata generation
export { generateMetadata } from './page-metadata'

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <BlogPostClient slug={slug} />
}