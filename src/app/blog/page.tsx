'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { HeaderSimple } from '@/components/layout/header-simple'
import { Footer } from '@/components/layout/footer'
import { useLocale } from '@/components/providers/locale-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Calendar, 
  Clock, 
  Eye, 
  BookOpen,
  FileText
} from 'lucide-react'
import { countWords, getContentPreview } from '@/lib/utils'

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  published: boolean
  featured: boolean
  views: number
  readTime: number
  createdAt: string
  updatedAt: string
  category?: {
    name: string
    slug: string
  }
  tags: Array<{
    name: string
    slug: string
  }>
  author: {
    name: string
    email: string
  }
}

interface Category {
  id: string
  name: string
  slug: string
}

export default function BlogPage() {
  const { t } = useLocale()
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    const loadData = async () => {
      try {
        const [postsResponse, categoriesResponse] = await Promise.all([
          fetch('/api/posts'),
          fetch('/api/categories')
        ])
        
        if (postsResponse.ok) {
          const postsData = await postsResponse.json()
          setPosts(postsData.posts || [])
        }
        
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          setCategories(categoriesData.categories || [])
        }
      } catch (error) {
        console.error('Error loading blog data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  // Filter and sort posts
  const filteredPosts = posts
    .filter(post => {
      if (!post.published) return false
      
      const matchesCategory = selectedCategory === 'all' || 
        post.category?.slug === selectedCategory
      
      return matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'popular':
          return b.views - a.views
        case 'reading-time':
          return (a.readTime || 0) - (b.readTime || 0)
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const featuredPosts = filteredPosts.filter(post => post.featured).slice(0, 2)
  const regularPosts = filteredPosts.filter(post => !post.featured)

  return (
    <div className="flex flex-col min-h-screen">
      <HeaderSimple />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          {/* Filter Section */}
          <div className="mb-12">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
              <div className="flex gap-3">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.allCategories}</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.slug}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">{t.newest}</SelectItem>
                    <SelectItem value="oldest">{t.oldest}</SelectItem>
                    <SelectItem value="popular">{t.mostPopular}</SelectItem>
                    <SelectItem value="reading-time">{t.readingTime}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="max-w-4xl mx-auto space-y-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="flex gap-4 text-sm">
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {/* Featured Posts */}
              {featuredPosts.length > 0 && (
                <section className="mb-16">
                  <div className="flex items-center gap-2 mb-8">
                    <h2 className="text-2xl font-bold">{t.featuredArticles}</h2>
                    <Badge variant="secondary">{t.featured}</Badge>
                  </div>
                  <div className="space-y-8">
                    {featuredPosts.map((post) => (
                      <article key={post.id} className="group border-b border-border pb-8 last:border-b-0">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            {post.category && (
                              <Badge variant="outline">{post.category.name}</Badge>
                            )}
                            <Badge className="bg-primary/10 text-primary hover:bg-primary/20">{t.featured}</Badge>
                          </div>
                          
                          <h3 className="text-2xl font-bold leading-tight">
                            <Link 
                              href={`/blog/${post.slug}`}
                              className="hover:text-primary transition-colors"
                            >
                              {post.title}
                            </Link>
                          </h3>
                          
                          <p className="text-muted-foreground leading-relaxed">
                            {getContentPreview(post.content || post.excerpt, 120)}
                          </p>
                          
                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(post.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{post.readTime || 5} min read</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              <span>{post.views.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              <span>{countWords(post.content)} words</span>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {/* All Articles */}
              {(regularPosts.length > 0 || featuredPosts.length > 0) ? (
                <section className={featuredPosts.length > 0 ? "border-t border-border pt-16" : ""}>
                  <h2 className="text-2xl font-bold mb-8">
                    {featuredPosts.length > 0 ? 'All Articles' : 'Latest Articles'}
                  </h2>
                  <div className="space-y-8">
                    {(featuredPosts.length > 0 ? regularPosts : filteredPosts).map((post) => (
                      <article key={post.id} className="group border-b border-border pb-8 last:border-b-0">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            {post.category && (
                              <Badge variant="outline">{post.category.name}</Badge>
                            )}
                          </div>
                          
                          <h3 className="text-xl font-bold leading-tight">
                            <Link 
                              href={`/blog/${post.slug}`}
                              className="hover:text-primary transition-colors"
                            >
                              {post.title}
                            </Link>
                          </h3>
                          
                          <p className="text-muted-foreground leading-relaxed">
                            {getContentPreview(post.content || post.excerpt, 120)}
                          </p>
                          
                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(post.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{post.readTime || 5} min read</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              <span>{post.views.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              <span>{countWords(post.content)} words</span>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ) : (
                <div className="text-center py-16">
                  <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{t.noArticlesFound}</h3>
                  <p className="text-muted-foreground mb-6">
                    {selectedCategory !== 'all' 
                      ? t.tryAdjusting
                      : t.noPublished
                    }
                  </p>
                  {selectedCategory !== 'all' && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedCategory('all')
                      }}
                    >
                      {t.clearFilters}
                    </Button>
                  )}
                </div>
              )}

              {/* Categories Section */}
              {categories.length > 0 && (
                <section className="mt-16 pt-16 border-t">
                  <h2 className="text-2xl font-bold mb-8">{t.browseByCategory}</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {categories.map((category) => (
                      <Card key={category.id} className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4 text-center">
                          <h3 className="font-semibold">{category.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {posts.filter(p => p.category?.slug === category.slug && p.published).length} {t.articles}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  )
}