'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { HeaderSimple } from '@/components/layout/header-simple'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Eye, 
  BookOpen,
  X,
  Lightbulb
} from 'lucide-react'
import { searchPosts, highlightSearchTerm, generateSearchSuggestions } from '@/lib/search'

interface SearchResult {
  posts: Array<{
    id: string
    title: string
    slug: string
    excerpt: string
    views: number
    readTime: number
    createdAt: string
    category?: {
      name: string
      slug: string
    }
    tags: Array<{
      name: string
      slug: string
    }>
  }>
  pagination: {
    currentPage: number
    totalPages: number
    totalCount: number
    hasMore: boolean
  }
  filters: {
    query?: string
    category?: string
    tag?: string
    sortBy: string
  }
  suggestions: string[]
}

function SearchPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [results, setResults] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [category, setCategory] = useState(searchParams.get('category') || 'all')
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'relevance')
  const [suggestions, setSuggestions] = useState<string[]>([])

  const performSearch = useCallback(async (query: string, cat: string = 'all', sort: string = 'relevance') => {
    if (!query.trim()) return
    
    setLoading(true)
    try {
      const searchResults = await searchPosts({
        query: query.trim(),
        category: cat !== 'all' ? cat : undefined,
        sort: sort as 'relevance' | 'newest' | 'oldest' | 'popular' | 'title',
        limit: 12
      })
      
      setResults(searchResults)
      
      // Update URL
      const params = new URLSearchParams()
      params.set('q', query.trim())
      if (cat !== 'all') params.set('category', cat)
      if (sort !== 'relevance') params.set('sort', sort)
      
      router.push(`/search?${params.toString()}`)
      
      // Generate suggestions if no results
      if (!searchResults?.posts.length) {
        setSuggestions(generateSearchSuggestions(query))
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    const query = searchParams.get('q')
    const cat = searchParams.get('category') || 'all'
    const sort = searchParams.get('sort') || 'relevance'
    
    if (query) {
      setSearchQuery(query)
      setCategory(cat)
      setSortBy(sort)
      performSearch(query, cat, sort)
    }
  }, [searchParams, performSearch])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch(searchQuery, category, sortBy)
  }

  const clearSearch = () => {
    setSearchQuery('')
    setResults(null)
    setSuggestions([])
    router.push('/search')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="flex flex-col min-h-screen">
      <HeaderSimple />
      
      <main className="flex-1">
        {/* Search Header */}
        <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center">
                Search Articles
              </h1>
              
              {/* Search Form */}
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                    <Input
                      type="text"
                      placeholder="Search for articles, topics, or technologies..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 h-12 text-lg"
                    />
                    {searchQuery && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearSearch}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-48 h-12">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="ai-technology">AI Technology</SelectItem>
                      <SelectItem value="product-reviews">Product Reviews</SelectItem>
                      <SelectItem value="technical-insights">Technical Insights</SelectItem>
                      <SelectItem value="algorithms">Algorithms</SelectItem>
                      <SelectItem value="tutorials">Tutorials</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40 h-12">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="oldest">Oldest</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="title">Title A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button type="submit" className="h-12 px-8" disabled={loading}>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* Search Results */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            
            {/* Results Header */}
            {results && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">
                    Search Results
                  </h2>
                  {results.filters.query && (
                    <p className="text-muted-foreground">
                      Found {results.pagination.totalCount} result{results.pagination.totalCount !== 1 ? 's' : ''} for &quot;{results.filters.query}&quot;
                    </p>
                  )}
                </div>
                
                {/* Active Filters */}
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Filters:</span>
                  {results.filters.query && (
                    <Badge variant="outline">
                      Query: {results.filters.query}
                    </Badge>
                  )}
                  {results.filters.category && results.filters.category !== 'all' && (
                    <Badge variant="outline">
                      Category: {results.filters.category}
                    </Badge>
                  )}
                  <Badge variant="outline">
                    Sort: {results.filters.sortBy}
                  </Badge>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}

            {/* Search Results */}
            {results && results.posts.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {results.posts.map((post) => (
                  <Card key={post.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                    <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                      <BookOpen className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        {post.category && (
                          <Badge variant="outline">{post.category.name}</Badge>
                        )}
                      </div>
                      <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
                        <Link href={`/blog/${post.slug}`}>
                          <span 
                            dangerouslySetInnerHTML={{ 
                              __html: results.filters.query 
                                ? highlightSearchTerm(post.title, results.filters.query)
                                : post.title
                            }} 
                          />
                        </Link>
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        <span 
                          dangerouslySetInnerHTML={{ 
                            __html: results.filters.query 
                              ? highlightSearchTerm(post.excerpt, results.filters.query)
                              : post.excerpt
                          }} 
                        />
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {post.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag.slug} variant="secondary" className="text-xs">
                            #{tag.name}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(post.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{post.readTime || 5}min</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{post.views}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* No Results */}
            {results && results.posts.length === 0 && (
              <div className="text-center py-16">
                <Search className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No articles found</h3>
                <p className="text-muted-foreground mb-8">
                  We couldn&apos;t find any articles matching your search criteria.
                </p>
                
                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <div className="max-w-md mx-auto">
                    <div className="flex items-center gap-2 mb-4">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">Try these suggestions:</span>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {suggestions.map((suggestion, index) => (
                        <Badge 
                          key={index}
                          variant="outline" 
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                          onClick={() => {
                            setSearchQuery(suggestion)
                            performSearch(suggestion, category, sortBy)
                          }}
                        >
                          {suggestion}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-8">
                  <Button variant="outline" onClick={clearSearch}>
                    Clear Search
                  </Button>
                </div>
              </div>
            )}

            {/* Pagination */}
            {results && results.posts.length > 0 && results.pagination.totalPages > 1 && (
              <div className="mt-12 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Showing page {results.pagination.currentPage} of {results.pagination.totalPages}
                </p>
                {results.pagination.hasMore && (
                  <Button variant="outline">
                    Load More Results
                  </Button>
                )}
              </div>
            )}

            {/* Popular Searches */}
            {!results && (
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-2xl font-bold mb-8">Popular Topics</h2>
                <div className="flex flex-wrap gap-3 justify-center">
                  {[
                    'Machine Learning', 'Deep Learning', 'Neural Networks', 
                    'AI Ethics', 'Natural Language Processing', 'Computer Vision',
                    'Transformers', 'GPT', 'Claude', 'Python', 'PyTorch', 'TensorFlow'
                  ].map((topic) => (
                    <Badge 
                      key={topic}
                      variant="outline" 
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground py-2 px-4"
                      onClick={() => {
                        setSearchQuery(topic)
                        performSearch(topic, category, sortBy)
                      }}
                    >
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen">
        <HeaderSimple />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading search...</p>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  )
}