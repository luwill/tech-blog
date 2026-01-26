'use client'

import { useState, useEffect, useCallback } from 'react'
import { ArrowUp } from 'lucide-react'
import styles from '@/styles/components/scroll-to-top.module.css'

interface ScrollToTopProps {
  threshold?: number
  showProgress?: boolean
}

export function ScrollToTop({
  threshold = 300,
  showProgress = false
}: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(0)

  // Calculate scroll progress and visibility
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight

      // Show/hide button based on threshold
      setIsVisible(scrollTop > threshold)

      // Calculate scroll progress (0-100)
      if (showProgress && docHeight > 0) {
        const scrollProgress = (scrollTop / docHeight) * 100
        setProgress(Math.min(scrollProgress, 100))
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial check

    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold, showProgress])

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }, [])

  // Calculate stroke-dashoffset for progress ring
  const circumference = 2 * Math.PI * 22 // radius = 22
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div
      className={`${styles.scrollToTop} ${isVisible ? styles.visible : ''}`}
      aria-hidden={!isVisible}
    >
      <button
        className={styles.button}
        onClick={scrollToTop}
        aria-label="Scroll to top"
        title="Back to top"
      >
        <ArrowUp />

        {/* Progress Ring */}
        {showProgress && (
          <div className={styles.progressRing}>
            <svg viewBox="0 0 48 48">
              <circle
                cx="24"
                cy="24"
                r="22"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
          </div>
        )}
      </button>
    </div>
  )
}
