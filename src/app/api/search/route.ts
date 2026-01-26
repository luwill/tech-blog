import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const category = searchParams.get('category')
    const tag = searchParams.get('tag')
    const sortBy = searchParams.get('sort') || 'relevance'
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0)

    if (!query && !category && !tag) {
      return NextResponse.json({
        success: false,
        error: 'Search query, category, or tag is required'
      }, { status: 400 })
    }

    // Build where clause based on filters
    const whereClause: Record<string, unknown> = {
      published: true,
    }

    // Text search across title, excerpt, and content
    if (query) {
      whereClause.OR = [
        {
          title: {
            contains: query
          }
        },
        {
          excerpt: {
            contains: query
          }
        },
        {
          content: {
            contains: query
          }
        },
        {
          tags: {
            some: {
              name: {
                contains: query
              }
            }
          }
        }
      ]
    }

    // Category filter
    if (category && category !== 'all') {
      whereClause.category = {
        slug: category
      }
    }

    // Tag filter
    if (tag && tag !== 'all') {
      whereClause.tags = {
        some: {
          slug: tag
        }
      }
    }

    // Build order by clause
    let orderBy: Record<string, string> | Record<string, string>[] = { createdAt: 'desc' }
    
    switch (sortBy) {
      case 'newest':
        orderBy = { createdAt: 'desc' }
        break
      case 'oldest':
        orderBy = { createdAt: 'asc' }
        break
      case 'popular':
        orderBy = { views: 'desc' }
        break
      case 'title':
        orderBy = { title: 'asc' }
        break
      case 'relevance':
      default:
        // For relevance, we'll order by views and creation date
        orderBy = [
          { views: 'desc' },
          { createdAt: 'desc' }
        ]
        break
    }

    // Execute search query
    const [posts, totalCount] = await Promise.all([
      db.post.findMany({
        where: whereClause,
        include: {
          author: {
            select: {
              name: true,
              email: true
            }
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          tags: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        },
        orderBy,
        take: limit,
        skip: offset
      }),
      db.post.count({
        where: whereClause
      })
    ])

    // Calculate pagination info
    const hasMore = offset + posts.length < totalCount
    const totalPages = Math.ceil(totalCount / limit)
    const currentPage = Math.floor(offset / limit) + 1

    // Get search suggestions if no results found
    let suggestions: string[] = []
    if (posts.length === 0 && query) {
      const suggestedPosts = await db.post.findMany({
        where: {
          published: true,
          OR: [
            {
              title: {
                contains: query.split(' ')[0] // Use first word for suggestions
              }
            },
            {
              tags: {
                some: {
                  name: {
                    contains: query.split(' ')[0]
                  }
                }
              }
            }
          ]
        },
        select: {
          title: true,
          tags: {
            select: {
              name: true
            }
          }
        },
        take: 5
      })

      suggestions = [
        ...suggestedPosts.map(p => p.title),
        ...suggestedPosts.flatMap(p => p.tags.map(t => t.name))
      ].filter((item, index, arr) => arr.indexOf(item) === index).slice(0, 5)
    }

    return NextResponse.json({
      success: true,
      data: {
        posts,
        pagination: {
          currentPage,
          totalPages,
          totalCount,
          limit,
          offset,
          hasMore
        },
        filters: {
          query,
          category,
          tag,
          sortBy
        },
        suggestions
      }
    })

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({
      success: false,
      error: 'Search failed'
    }, { status: 500 })
  }
}