import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Get comprehensive site statistics (Admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is admin
    if (!session?.user?.email || session.user.email !== 'admin@louwill.com') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d'
    
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
    
    const [
      siteStats,
      totalViews,
      uniqueVisitors,
      onlineUsers,
      topPages,
      recentViews,
      viewTrends,
      postStats,
    ] = await Promise.all([
      // Basic site statistics
      prisma.siteStats.findFirst({
        where: { id: 1 },
      }),
      
      // Total page views in period
      prisma.pageView.count({
        where: {
          visitedAt: {
            gte: startDate,
          },
        },
      }),
      
      // Unique visitors in period
      prisma.pageView.groupBy({
        by: ['ipAddress'],
        where: {
          visitedAt: {
            gte: startDate,
          },
        },
        _count: {
          ipAddress: true,
        },
      }),
      
      // Current online users
      prisma.onlineUser.count({
        where: {
          lastActiveAt: {
            gte: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
          },
        },
      }),
      
      // Top pages by views
      prisma.pageView.groupBy({
        by: ['path', 'title'],
        where: {
          visitedAt: {
            gte: startDate,
          },
        },
        _count: {
          path: true,
        },
        orderBy: {
          _count: {
            path: 'desc',
          },
        },
        take: 10,
      }),
      
      // Recent page views
      prisma.pageView.findMany({
        select: {
          id: true,
          path: true,
          title: true,
          visitedAt: true,
          ipAddress: true,
          userAgent: true,
        },
        orderBy: {
          visitedAt: 'desc',
        },
        take: 20,
      }),
      
      // View trends by day
      prisma.$queryRaw`
        SELECT 
          DATE(visitedAt) as date,
          COUNT(*) as views,
          COUNT(DISTINCT ipAddress) as unique_views
        FROM PageView 
        WHERE visitedAt >= ${startDate}
        GROUP BY DATE(visitedAt)
        ORDER BY date ASC
      `,
      
      // Post statistics
      prisma.post.count(),
    ])
    
    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalViews: siteStats?.totalViews || 0,
          totalPosts: postStats,
          totalCategories: siteStats?.totalCategories || 0,
          totalTags: siteStats?.totalTags || 0,
          onlineUsers,
        },
        period: {
          views: totalViews,
          uniqueVisitors: uniqueVisitors.length,
          startDate: startDate.toISOString(),
          endDate: new Date().toISOString(),
        },
        topPages: topPages.map((page) => ({
          path: page.path,
          title: page.title,
          views: page._count.path,
        })),
        recentViews: recentViews.map((view) => ({
          id: view.id,
          path: view.path,
          title: view.title,
          visitedAt: view.visitedAt,
          visitor: {
            ip: view.ipAddress,
            userAgent: view.userAgent,
          },
        })),
        trends: viewTrends,
      },
    })
  } catch (error) {
    console.error('Error fetching site statistics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}