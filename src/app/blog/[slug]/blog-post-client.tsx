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
  Eye, 
  ArrowLeft, 
  Share2,
  BookmarkPlus,
  ThumbsUp,
  User,
  Tag,
  ChevronRight
} from 'lucide-react'
import { trackPageView } from '@/lib/analytics'
import { generateArticleStructuredData, generateBreadcrumbStructuredData } from '@/lib/seo'

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
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)

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

  const handleShare = async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const handleLike = async () => {
    if (!post) return
    
    try {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: 'POST',
      })
      
      if (response.ok) {
        setLiked(!liked)
        setPost(prev => prev ? {
          ...prev,
          likes: liked ? prev.likes - 1 : prev.likes + 1
        } : null)
      }
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <HeaderSimple />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="h-96 bg-gray-200 rounded mb-8"></div>
              <div className="space-y-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
                ))}
              </div>
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
                <ArrowLeft className="h-4 w-4 mr-2" />
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
    <div className="flex flex-col min-h-screen">
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
        {/* Article Header */}
        <section className="bg-gradient-to-r from-primary/5 to-background py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Navigation */}
              <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
                <Link href="/" className="hover:text-primary">Home</Link>
                <ChevronRight className="h-4 w-4" />
                <Link href="/blog" className="hover:text-primary">Blog</Link>
                <ChevronRight className="h-4 w-4" />
                {post.category && (
                  <>
                    <Link href={`/blog?category=${post.category.slug}`} className="hover:text-primary">
                      {post.category.name}
                    </Link>
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
                <span className="text-foreground">{post.title}</span>
              </nav>

              {/* Article Meta */}
              <div className="mb-8">
                {post.featured && (
                  <Badge className="mb-4">Featured Article</Badge>
                )}
                
                <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  {post.title}
                </h1>
                
                {post.excerpt && (
                  <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                    {post.excerpt}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{post.author.name || 'LouWill'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{post.readTime || 5} min read</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>{post.views.toLocaleString()} views</span>
                  </div>

                  {post.category && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{post.category.name}</Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mb-8">
                <Button
                  variant={liked ? "default" : "outline"}
                  size="sm"
                  onClick={handleLike}
                  className="gap-2"
                >
                  <ThumbsUp className="h-4 w-4" />
                  {post.likes} {liked ? 'Liked' : 'Like'}
                </Button>
                
                <Button
                  variant={bookmarked ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBookmarked(!bookmarked)}
                  className="gap-2"
                >
                  <BookmarkPlus className="h-4 w-4" />
                  {bookmarked ? 'Saved' : 'Save'}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Article Content */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <article className="prose prose-lg max-w-none dark:prose-invert">
              <MDEditor
                source={post.content}
                style={{
                  backgroundColor: 'transparent',
                }}
              />
            </article>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">Tags</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag.id} variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                      <Link href={`/blog?tag=${tag.slug}`}>
                        #{tag.name}
                      </Link>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Author Info */}
            <div className="mt-12 pt-8 border-t">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <CardTitle>About the Author</CardTitle>
                      <CardDescription>{post.author.name || 'LouWill'}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    AI Algorithm Engineer & Full Stack Developer passionate about sharing insights on artificial intelligence, 
                    machine learning, and cutting-edge technology trends. Dedicated to making complex AI concepts accessible 
                    through practical examples and real-world applications.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="bg-muted/50 py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold mb-8">Related Articles</h2>
                <div className="grid md:grid-cols-3 gap-6">
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
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(relatedPost.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            <span>{relatedPost.readTime || 5}min</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="text-center mt-8">
                  <Button variant="outline" asChild>
                    <Link href="/blog">
                      View All Articles
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
      
      <Footer />
    </div>
  )
}