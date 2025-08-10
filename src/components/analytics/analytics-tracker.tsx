'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { trackPageView, updateOnlineStatus } from '@/lib/analytics'

export function AnalyticsTracker() {
  const pathname = usePathname()
  
  useEffect(() => {
    // Track page view when component mounts or path changes
    trackPageView(pathname)
    
    // Update online status initially
    updateOnlineStatus()
    
    // Set up interval to update online status every minute
    const interval = setInterval(() => {
      updateOnlineStatus()
    }, 60 * 1000) // Update every 60 seconds
    
    // Handle visibility change to update status when user becomes active again
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateOnlineStatus()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // Cleanup function
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [pathname])
  
  return null // This component doesn't render anything visible
}