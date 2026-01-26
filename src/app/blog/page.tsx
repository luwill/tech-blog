'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { HeaderSimple } from '@/components/layout/header-simple'
import { Footer } from '@/components/layout/footer'
import { useLocale } from '@/components/providers/locale-provider'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Calendar,
  Clock,
  Eye,
  FolderOpen,
  Terminal
} from 'lucide-react'
import { getContentPreview } from '@/lib/utils'
import styles from '@/styles/pages/blog-list.module.css'

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
  const router = useRouter()
  const searchParams = useSearchParams()
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // Read filter state from URL
  const selectedCategory = searchParams.get('category') || 'all'
  const sortBy = searchParams.get('sort') || 'newest'

  // Update URL when filters change
  const updateFilters = useCallback((category: string, sort: string) => {
    const params = new URLSearchParams()
    if (category !== 'all') params.set('category', category)
    if (sort !== 'newest') params.set('sort', sort)
    const queryString = params.toString()
    router.push(queryString ? `/blog?${queryString}` : '/blog', { scroll: false })
  }, [router])

  const setSelectedCategory = (category: string) => {
    updateFilters(category, sortBy)
  }

  const setSortBy = (sort: string) => {
    updateFilters(selectedCategory, sort)
  }

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
          // Handle both array and object response formats
          const cats = Array.isArray(categoriesData)
            ? categoriesData
            : categoriesData.categories || []
          setCategories(cats)
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
    return new Date(dateString).toISOString().split('T')[0]
  }

  return (
    <div className="flex flex-col min-h-screen">
      <HeaderSimple />

      <main className="flex-1">
        {/* Page Header */}
        <div className={styles.pageHeader}>
          <div className="max-w-3xl mx-auto px-4">
            <div className={styles.headerContent}>
              <FolderOpen className={styles.headerIcon} aria-hidden="true" />
              <div>
                <h1 className={styles.headerTitle}>blog/</h1>
                <p className={styles.headerSubtitle}>
                  $ ls -la ./articles | wc -l → {filteredPosts.length} files
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Filter Bar */}
          <div className={styles.filterBar}>
            <span className={styles.filterLabel}>filter:</span>
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

            <div className={styles.filterSeparator} />

            <span className={styles.filterLabel}>sort:</span>
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

            <span className={styles.filterCount}>
              showing <span>{filteredPosts.length}</span> of <span>{posts.filter(p => p.published).length}</span>
            </span>
          </div>

          {loading ? (
            <div className={styles.articleList}>
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`${styles.articleItem} ${styles.skeleton}`}>
                  <div className={styles.articleContent}>
                    <div className={`${styles.skeletonLine} ${styles.short}`}></div>
                    <div className={`${styles.skeletonLine} ${styles.medium}`}></div>
                    <div className={styles.skeletonLine}></div>
                    <div className={`${styles.skeletonLine} ${styles.short}`}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* All Articles */}
              {filteredPosts.length > 0 ? (
                <section>
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>{t.latestArticles}</h2>
                  </div>
                  <div className={styles.articleList}>
                    {filteredPosts.map((post, index) => (
                      <Link
                        key={post.id}
                        href={`/blog/${post.slug}`}
                        className={styles.articleItem}
                      >
                        <div className={styles.lineGutter}>
                          {[...Array(4)].map((_, i) => (
                            <span key={i} className={styles.lineNumber}>{index * 10 + i + 1}</span>
                          ))}
                        </div>
                        <div className={styles.articleContent}>
                          <div className={styles.articleHeader}>
                            {post.category && (
                              <span className={styles.articleCategory}>{post.category.name}</span>
                            )}
                            {post.featured && (
                              <span className={styles.articleFeatured}>{t.featured}</span>
                            )}
                          </div>
                          <h3 className={styles.articleTitle}>{post.title}</h3>
                          <p className={styles.articleExcerpt}>
                            {getContentPreview(post.content || post.excerpt, 100)}
                          </p>
                          <div className={styles.articleClosing}>{'}'}</div>
                          <div className={styles.articleMeta}>
                            <div className={styles.metaItem}>
                              <Calendar className={styles.metaIcon} aria-hidden="true" />
                              <span className={styles.metaValue}>{formatDate(post.createdAt)}</span>
                            </div>
                            <div className={styles.metaItem}>
                              <Clock className={styles.metaIcon} aria-hidden="true" />
                              <span className={styles.metaValue}>{post.readTime || 5} min</span>
                            </div>
                            <div className={styles.metaItem}>
                              <Eye className={styles.metaIcon} aria-hidden="true" />
                              <span className={styles.metaValue}>{post.views.toLocaleString()}</span>
                            </div>
                            {post.tags.length > 0 && (
                              <div className={styles.articleTags}>
                                {post.tags.slice(0, 3).map(tag => (
                                  <span key={tag.slug} className={styles.tagItem}>{tag.name}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              ) : (
                <div className={styles.emptyState}>
                  <Terminal className={styles.emptyIcon} aria-hidden="true" />
                  <h3 className={styles.emptyTitle}>{t.noArticlesFound}</h3>
                  <p className={styles.emptyDescription}>
                    {selectedCategory !== 'all'
                      ? t.tryAdjusting
                      : t.noPublished
                    }
                  </p>
                  {selectedCategory !== 'all' && (
                    <Button
                      variant="outline"
                      onClick={() => setSelectedCategory('all')}
                    >
                      {t.clearFilters}
                    </Button>
                  )}
                </div>
              )}

              {/* Categories Section */}
              {categories.length > 0 && (
                <section className={styles.categoriesSection}>
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>{t.browseByCategory}</h2>
                  </div>
                  <div className={styles.categoriesGrid}>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        className={styles.categoryCard}
                        onClick={() => setSelectedCategory(category.slug)}
                        type="button"
                      >
                        <div className={styles.categoryName}>{category.name}/</div>
                        <div className={styles.categoryCount}>
                          <span>{posts.filter(p => p.category?.slug === category.slug && p.published).length}</span> {t.articles}
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
