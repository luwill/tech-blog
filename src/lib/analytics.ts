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
