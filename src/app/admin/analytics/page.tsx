'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Eye, 
  FileText, 
  TrendingUp, 
  Clock,
  Monitor,
  Globe,
  Activity
} from 'lucide-react'
import { getAnalytics, getOnlineUsers } from '@/lib/analytics'

interface AnalyticsData {
  overview: {
    totalViews: number
    totalPosts: number
    totalCategories: number
    totalTags: number
    onlineUsers: number
  }
  period: {
    views: number
    uniqueVisitors: number
    startDate: string
    endDate: string
  }
  topPages: Array<{
    path: string
    title: string
    views: number
  }>
  recentViews: Array<{
    id: number
    path: string
    title: string
    visitedAt: string
    visitor: {
      ip: string
      userAgent: string
    }
  }>
  trends: Array<{
    date: string
    views: number
    unique_views: number
  }>
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [onlineData, setOnlineData] = useState<{ onlineCount: number; recentVisitors: Array<{ id: number; ipAddress: string; userAgent: string; lastActiveAt: string }> } | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30d')

  const loadAnalytics = useCallback(async () => {
    setLoading(true)
    try {
      const [analyticsData, onlineUsersData] = await Promise.all([
        getAnalytics(period),
        getOnlineUsers()
      ])
      
      setData(analyticsData)
      setOnlineData(onlineUsersData)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => {
    loadAnalytics()
    
    // Refresh online users every 30 seconds
    const interval = setInterval(() => {
      getOnlineUsers().then(setOnlineData)
    }, 30000)
    
    return () => clearInterval(interval)
  }, [period, loadAnalytics])

  const formatUserAgent = (userAgent: string) => {
    if (userAgent.includes('Chrome')) return 'Chrome'
    if (userAgent.includes('Firefox')) return 'Firefox'
    if (userAgent.includes('Safari')) return 'Safari'
    if (userAgent.includes('Edge')) return 'Edge'
    return 'Unknown'
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive site statistics and visitor insights</p>
        </div>
        
        <div className="flex items-center space-x-2">
          {['24h', '7d', '30d', '90d', '1y'].map((p) => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod(p)}
            >
              {p}
            </Button>
          ))}
          <Button onClick={loadAnalytics} size="sm" variant="outline">
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.overview.totalViews?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              {data?.period.views?.toLocaleString() || 0} in selected period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.period.uniqueVisitors?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              In selected period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Now</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{onlineData?.onlineCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active in last 5 minutes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.overview.totalPosts || 0}</div>
            <p className="text-xs text-muted-foreground">
              Published articles
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Top Pages
            </CardTitle>
            <CardDescription>Most visited pages in selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.topPages.slice(0, 10).map((page, index) => (
                <div key={page.path} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {page.title || page.path}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {page.path}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{page.views}</Badge>
                    <span className="text-xs text-muted-foreground">#{index + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Visitors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              Current Online Users
            </CardTitle>
            <CardDescription>Active visitors in the last 5 minutes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {onlineData?.recentVisitors.slice(0, 8).map((visitor) => (
                <div key={visitor.id} className="flex items-center justify-between p-2 rounded border">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">{visitor.ipAddress}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatUserAgent(visitor.userAgent)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      Active {Math.round((Date.now() - new Date(visitor.lastActiveAt).getTime()) / (1000 * 60))}m ago
                    </p>
                  </div>
                </div>
              ))}
              
              {(!onlineData?.recentVisitors || onlineData.recentVisitors.length === 0) && (
                <div className="text-center py-4 text-muted-foreground">
                  <Monitor className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No active users at the moment</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest page views and visitor activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data?.recentViews.slice(0, 15).map((view) => (
              <div key={view.id} className="flex items-center justify-between p-2 rounded border">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {view.title || view.path}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {view.path} • {view.visitor.ip} • {formatUserAgent(view.visitor.userAgent)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {new Date(view.visitedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}