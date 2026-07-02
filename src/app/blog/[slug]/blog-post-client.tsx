'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import MarkdownPreview from '@uiw/react-markdown-preview'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import { HeaderSimple } from '@/components/layout/header-simple'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  Clock
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

// XSS 防护 schema：在 GitHub 默认白名单基础上，
// 保留语法高亮的 class（span/code/pre）并关闭 id 前缀改写（否则 TOC 锚点会失效）
const markdownSanitizeSchema = {
  ...defaultSchema,
  clobberPrefix: '',
  attributes: {
    ...defaultSchema.attributes,
    span: [...(defaultSchema.attributes?.span ?? []), 'className'],
    code: [...(defaultSchema.attributes?.code ?? []), 'className'],
    pre: [...(defaultSchema.attributes?.pre ?? []), 'className'],
  },
}

export interface Post {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  published: boolean
  featured: boolean
  views: number
  likes: number
  readTime: number | null
  createdAt: string
  updatedAt: string
  category?: {
    id: string
    name: string
    slug: string
  } | null
  tags: Array<{
    id: string
    name: string
    slug: string
  }>
  author: {
    name: string | null
    email: string
  }
}

interface BlogPostClientProps {
  post: Post
  relatedPosts: Post[]
}

export default function BlogPostClient({ post, relatedPosts }: BlogPostClientProps) {
  useEffect(() => {
    // 埋点 + 浏览量上报（写操作已从文章 GET 路径剥离到独立端点）
    trackPageView(`/blog/${post.slug}`, post.title)
    fetch(`/api/posts/slug/${post.slug}/view`, { method: 'POST' }).catch(() => {
      // 上报失败不影响阅读
    })
  }, [post.slug, post.title])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Generate structured data
  const articleStructuredData = generateArticleStructuredData({
    title: post.title,
    description: post.excerpt || '',
    content: post.content,
    publishedAt: post.createdAt,
    updatedAt: post.updatedAt,
    slug: post.slug,
    author: post.author.name || 'LouWill',
    category: post.category?.name,
    tags: post.tags.map(tag => tag.name),
    readTime: post.readTime || undefined
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
                  <MarkdownPreview
                    source={sanitizeContent(post.content)}
                    rehypePlugins={[[rehypeSanitize, markdownSanitizeSchema]]}
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
