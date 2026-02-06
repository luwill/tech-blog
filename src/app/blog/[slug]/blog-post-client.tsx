'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { HeaderSimple } from '@/components/layout/header-simple'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  Clock,
  ArrowLeft
} from 'lucide-react'
import { trackPageView } from '@/lib/analytics'
import { generateArticleStructuredData, generateBreadcrumbStructuredData } from '@/lib/seo'
import { TableOfContents } from '@/components/blog/TableOfContents'
import { GiscusComments } from '@/components/blog/GiscusComments'
import { ScrollToTop } from '@/components/ui/ScrollToTop'
import styles from '@/styles/pages/blog-post.module.css'
import contentStyles from '@/styles/components/blog-content.module.css'

/**
 * Sanitize content by removing unwanted tags like <think> from AI-generated content
 */
function sanitizeContent(content: string): string {
  if (!content) return ''

  // Remove <think>...</think> tags and their content (including multiline)
  let sanitized = content.replace(/<think>[\s\S]*?<\/think>/gi, '')

  // Remove self-closing <think /> tags
  sanitized = sanitized.replace(/<think\s*\/?>/gi, '')

  // Remove any other potentially problematic AI artifact tags
  sanitized = sanitized.replace(/<(antml|anthropic|claude)[^>]*>[\s\S]*?<\/\1[^>]*>/gi, '')
  sanitized = sanitized.replace(/<(antml|anthropic|claude)[^>]*\/?>/gi, '')

  return sanitized.trim()
}

// Dynamically import MDViewer to avoid SSR issues
const MDEditor = dynamic(() => import("@uiw/react-md-editor").then((mod) => mod.default.Markdown), {
  ssr: false,
  loading: () => <div className="h-96 bg-muted animate-pulse rounded-md" />
})

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  published: boolean
  featured: boolean
  views: number
  likes: number
  readTime: number
  createdAt: string
  updatedAt: string
  category?: {
    id: string
    name: string
    slug: string
  }
  tags: Array<{
    id: string
    name: string
    slug: string
  }>
  author: {
    name: string
    email: string
  }
}

export default function BlogPostClient({ slug }: { slug: string }) {
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return

    const loadPost = async () => {
      try {
        const response = await fetch(`/api/posts/slug/${slug}`)
        
        if (response.ok) {
          const data = await response.json()
          setPost(data.post)
          
          // Track page view
          trackPageView(`/blog/${slug}`, data.post.title)
          
          // Load related posts
          if (data.post.category) {
            const relatedResponse = await fetch(`/api/posts?category=${data.post.category.slug}&limit=3&exclude=${data.post.id}`)
            if (relatedResponse.ok) {
              const relatedData = await relatedResponse.json()
              setRelatedPosts(relatedData.posts || [])
            }
          }
        } else if (response.status === 404) {
          router.push('/404')
        }
      } catch (error) {
        console.error('Error loading post:', error)
        router.push('/404')
      } finally {
        setLoading(false)
      }
    }
    
    loadPost()
  }, [slug, router])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <HeaderSimple />
        <main className={styles.loadingContent}>
          <div className="animate-pulse">
            <div className={`${styles.skeleton} h-8 w-3/4 mb-4`}></div>
            <div className={`${styles.skeleton} h-4 w-1/2 mb-8`}></div>
            <div className={`${styles.skeleton} h-96 mb-8`}></div>
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className={`${styles.skeleton} h-4 w-full`}></div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="flex flex-col min-h-screen">
        <HeaderSimple />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold mb-4">Post not found</h1>
            <p className="text-muted-foreground mb-8">
              The article you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Button asChild>
              <Link href="/blog">
                <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
                Back to Blog
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Generate structured data
  const articleStructuredData = generateArticleStructuredData({
    title: post.title,
    description: post.excerpt,
    content: post.content,
    publishedAt: post.createdAt,
    updatedAt: post.updatedAt,
    slug: post.slug,
    author: post.author.name || 'LouWill',
    category: post.category?.name,
    tags: post.tags.map(tag => tag.name),
    readTime: post.readTime
  })

  const breadcrumbStructuredData = generateBreadcrumbStructuredData([
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
    ...(post.category ? [{ name: post.category.name, url: `/blog?category=${post.category.slug}` }] : []),
    { name: post.title, url: `/blog/${post.slug}` }
  ])

  return (
    <div className={styles.blogPostLayout}>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
      />

      <HeaderSimple />

      <main className="flex-1">
        {/* Article Header - Minimalist Design */}
        <section className={styles.articleHeader}>
          <div className={styles.headerContainer}>
            <h1 className={styles.articleTitle}>{post.title}</h1>

            <div className={styles.metaInfo}>
              <span>{post.author.name || 'louwill'}</span>
              <span className={styles.metaDivider}>·</span>
              <span>{formatDate(post.createdAt)}</span>
              <span className={styles.metaDivider}>·</span>
              <span>{post.readTime || 5} min read</span>
              <span className={styles.metaDivider}>·</span>
              <span>{post.views.toLocaleString()} views</span>
            </div>
          </div>
        </section>

        {/* Content Section with Two-Column Layout */}
        <section className={styles.contentSection}>
          <div className={styles.contentContainer}>
            {/* Mobile TOC - Outside grid for proper positioning */}
            <div className="xl:hidden mb-6">
              <TableOfContents content={post.content} />
            </div>

            <div className={styles.contentGrid}>
              {/* Main Content Column */}
              <div className={styles.mainContent}>
                {/* Article Body */}
                <article className={`${styles.articleBody} ${contentStyles.articleContent} prose prose-lg max-w-none dark:prose-invert`}>
                  <MDEditor
                    source={sanitizeContent(post.content)}
                    style={{
                      backgroundColor: 'transparent',
                    }}
                  />
                </article>

                {/* Comments */}
                <GiscusComments slug={post.slug} />
              </div>

              {/* Sidebar with TOC (Desktop Only) */}
              <aside className={styles.sidebar}>
                <TableOfContents content={post.content} />
              </aside>
            </div>
          </div>
        </section>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className={styles.relatedSection}>
            <div className={styles.relatedContainer}>
              <h2 className={styles.relatedTitle}>Related Articles</h2>
              <div className={styles.relatedGrid}>
                {relatedPosts.map((relatedPost) => (
                  <Card key={relatedPost.id} className="group hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      {relatedPost.category && (
                        <Badge variant="outline" className="w-fit mb-2">
                          {relatedPost.category.name}
                        </Badge>
                      )}
                      <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                        <Link href={`/blog/${relatedPost.slug}`}>
                          {relatedPost.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="line-clamp-3">
                        {relatedPost.excerpt}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" aria-hidden="true" />
                          <span>{formatDate(relatedPost.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" aria-hidden="true" />
                          <span>{relatedPost.readTime || 5}min</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className={styles.relatedViewAll}>
                <Button variant="outline" asChild>
                  <Link href="/blog">View All Articles</Link>
                </Button>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />

      {/* Scroll to Top Button */}
      <ScrollToTop threshold={300} showProgress />
    </div>
  )
}