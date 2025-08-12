import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { handleApiError } from '@/lib/error-handler'
import { db } from '@/lib/db'
import { Role } from '@prisma/client'

// Get comprehensive site statistics (Admin only)
export async function GET(request: NextRequest) {
  try {
    // Check admin access via session
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== Role.ADMIN) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
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
      db.siteStats.findFirst({
        where: { id: 1 },
      }),
      
      // Total page views in period
      db.pageView.count({
        where: {
          visitedAt: {
            gte: startDate,
          },
        },
      }),
      
      // Unique visitors in period
      db.pageView.groupBy({
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
      db.onlineUser.count({
        where: {
          lastActiveAt: {
            gte: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
          },
        },
      }),
      
      // Top pages by views
      db.pageView.groupBy({
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
      db.pageView.findMany({
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
      db.$queryRaw`
        SELECT 
          DATE("visitedAt") as date,
          COUNT(*) as views,
          COUNT(DISTINCT "ipAddress") as unique_views
        FROM page_views 
        WHERE "visitedAt" >= ${startDate}
        GROUP BY DATE("visitedAt")
        ORDER BY date ASC
      `,
      
      // Post statistics
      db.post.count(),
    ])
    
    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalViews: siteStats?.totalViews || 0,
          totalPosts: Number(postStats),
          totalCategories: siteStats?.totalCategories || 0,
          totalTags: siteStats?.totalTags || 0,
          onlineUsers: Number(onlineUsers),
        },
        period: {
          views: Number(totalViews),
          uniqueVisitors: uniqueVisitors.length,
          startDate: startDate.toISOString(),
          endDate: new Date().toISOString(),
        },
        topPages: topPages.map((page) => ({
          path: page.path,
          title: page.title,
          views: Number(page._count.path),
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
        trends: Array.isArray(viewTrends) ? viewTrends.map((trend: { date: Date; views: bigint; unique_views: bigint }) => ({
          date: trend.date,
          views: Number(trend.views),
          unique_views: Number(trend.unique_views),
        })) : [],
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}