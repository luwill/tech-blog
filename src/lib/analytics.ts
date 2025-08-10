'use client'

// Generate a unique session ID for tracking
function generateSessionId(): string {
  const stored = typeof window !== 'undefined' ? localStorage.getItem('session_id') : null
  if (stored) {
    return stored
  }
  
  const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  if (typeof window !== 'undefined') {
    localStorage.setItem('session_id', newSessionId)
  }
  return newSessionId
}

// Track page view
export async function trackPageView(path: string, title?: string): Promise<void> {
  try {
    if (typeof window === 'undefined') return
    
    const response = await fetch('/api/analytics/page-views', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path,
        title: title || document.title,
        userAgent: navigator.userAgent,
      }),
    })
    
    if (!response.ok) {
      console.warn('Failed to track page view:', response.statusText)
    }
  } catch (error) {
    console.warn('Error tracking page view:', error)
  }
}

// Update online user status
export async function updateOnlineStatus(): Promise<void> {
  try {
    if (typeof window === 'undefined') return
    
    const sessionId = generateSessionId()
    
    const response = await fetch('/api/analytics/online-users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        userAgent: navigator.userAgent,
      }),
    })
    
    if (!response.ok) {
      console.warn('Failed to update online status:', response.statusText)
    }
  } catch (error) {
    console.warn('Error updating online status:', error)
  }
}

// Hook to automatically track page views and online status
export function useAnalytics(path: string, title?: string) {
  if (typeof window === 'undefined') return
  
  // Track page view on mount
  trackPageView(path, title)
  
  // Update online status initially and then every 60 seconds
  updateOnlineStatus()
  const interval = setInterval(updateOnlineStatus, 60 * 1000)
  
  // Cleanup function
  return () => {
    clearInterval(interval)
  }
}

// Get analytics data for admin dashboard
export async function getAnalytics(period = '30d') {
  try {
    const response = await fetch(`/api/analytics/stats?period=${period}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch analytics')
    }
    
    const data = await response.json()
    return data.success ? data.data : null
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return null
  }
}

// Get current online users count
export async function getOnlineUsers() {
  try {
    const response = await fetch('/api/analytics/online-users')
    
    if (!response.ok) {
      throw new Error('Failed to fetch online users')
    }
    
    const data = await response.json()
    return data.success ? data.data : null
  } catch (error) {
    console.error('Error fetching online users:', error)
    return null
  }
}

// Get page view statistics for a specific page
export async function getPageViews(path?: string, period = '7d') {
  try {
    const url = new URL('/api/analytics/page-views', window.location.origin)
    if (path) url.searchParams.set('path', path)
    url.searchParams.set('period', period)
    
    const response = await fetch(url.toString())
    
    if (!response.ok) {
      throw new Error('Failed to fetch page views')
    }
    
    const data = await response.json()
    return data.success ? data.data : null
  } catch (error) {
    console.error('Error fetching page views:', error)
    return null
  }
}