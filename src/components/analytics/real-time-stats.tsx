'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Eye, 
  Users, 
  FileText, 
  Monitor,
  TrendingUp,
  Activity
} from 'lucide-react'
import { getAnalytics, getOnlineUsers } from '@/lib/analytics'

export function RealTimeStats() {
  const [stats, setStats] = useState<{ overview: { totalViews: number; totalPosts: number; onlineUsers: number }; period: { views: number; uniqueVisitors: number } } | null>(null)
  const [onlineUsers, setOnlineUsers] = useState<{ onlineCount: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStats = async () => {
    try {
      setError(null)
      const [analyticsData, onlineData] = await Promise.all([
        getAnalytics('30d'),
        getOnlineUsers()
      ])
      
      setStats(analyticsData)
      setOnlineUsers(onlineData)
    } catch (error) {
      console.error('Error loading real-time stats:', error)
      setError(error instanceof Error ? error.message : 'Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
    
    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000)
    
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="md:col-span-2 lg:col-span-4">
          <CardContent className="py-8">
            <div className="text-center">
              <p className="text-destructive mb-2">Failed to load analytics</p>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <button 
                onClick={loadStats}
                className="text-sm underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.overview.totalPosts || 0}</div>
          <p className="text-xs text-muted-foreground">
            Published articles
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Page Views</CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.overview.totalViews?.toLocaleString() || 0}</div>
          <p className="text-xs text-muted-foreground flex items-center">
            <TrendingUp className="h-3 w-3 mr-1" />
            {stats?.period.views?.toLocaleString() || 0} this month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.period.uniqueVisitors?.toLocaleString() || 0}</div>
          <p className="text-xs text-muted-foreground">
            This month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Online Now</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant={(onlineUsers?.onlineCount ?? 0) > 0 ? "default" : "secondary"} className="text-xs">
              <Activity className="h-3 w-3 mr-1" />
              LIVE
            </Badge>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{onlineUsers?.onlineCount || 0}</div>
          <p className="text-xs text-muted-foreground">
            Active visitors
          </p>
        </CardContent>
      </Card>
    </div>
  )
}