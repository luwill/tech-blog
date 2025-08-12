import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { handleApiError } from '@/lib/error-handler'

// Track page view
export async function POST(request: NextRequest) {
  try {
    const { path, title, userAgent } = await request.json()
    
    // Get client IP
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown'
    
    // Extract basic info from user agent
    const isBot = /bot|crawler|spider/i.test(userAgent || '')
    
    if (isBot) {
      return NextResponse.json({ success: true, message: 'Bot detected, not tracked' })
    }
    
    // Create page view record
    const pageView = await db.pageView.create({
      data: {
        path,
        title,
        userAgent,
        ipAddress: ip,
        visitedAt: new Date(),
      },
    })
    
    // Update site stats
    await db.siteStats.upsert({
      where: { id: 1 },
      update: {
        totalViews: {
          increment: 1,
        },
        updatedAt: new Date(),
      },
      create: {
        id: 1,
        totalViews: 1,
        totalPosts: 0,
        totalCategories: 0,
        totalTags: 0,
      },
    })
    
    return NextResponse.json({ success: true, id: pageView.id })
  } catch (error) {
    return handleApiError(error)
  }
}

// Get page view statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')
    const period = searchParams.get('period') || '7d' // 7d, 30d, 90d, 1y
    
    const startDate = new Date()
    switch (period) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24)
        break
      case '7d':
        startDate.setDate(startDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(startDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(startDate.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
    }
    
    const whereClause = {
      visitedAt: {
        gte: startDate,
      },
      ...(path ? { path } : {}),
    }
    
    const [totalViews, uniqueViews, viewsByDay] = await Promise.all([
      // Total views
      db.pageView.count({
        where: whereClause,
      }),
      
      // Unique views (by IP)
      db.pageView.groupBy({
        by: ['ipAddress'],
        where: whereClause,
        _count: {
          ipAddress: true,
        },
      }),
      
      // Views grouped by day
      db.$queryRaw`
        SELECT 
          DATE("visitedAt") as date,
          COUNT(*) as views,
          COUNT(DISTINCT "ipAddress") as unique_views
        FROM page_views 
        WHERE "visitedAt" >= ${startDate}
        ${path ? db.$queryRawUnsafe('AND path = ?', path) : db.$queryRawUnsafe('')}
        GROUP BY DATE("visitedAt")
        ORDER BY date DESC
        LIMIT 30
      `,
    ])
    
    return NextResponse.json({
      success: true,
      data: {
        totalViews: Number(totalViews),
        uniqueViews: uniqueViews.length,
        viewsByDay: Array.isArray(viewsByDay) ? viewsByDay.map((day: { date: Date; views: bigint; unique_views: bigint }) => ({
          date: day.date,
          views: Number(day.views),
          unique_views: Number(day.unique_views),
        })) : [],
        period,
        path,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}