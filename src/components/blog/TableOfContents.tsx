'use client'

import { useState, useEffect, useCallback } from 'react'
import { List, ChevronDown } from 'lucide-react'
import styles from '@/styles/components/table-of-contents.module.css'

interface TocItem {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  content: string
}

/**
 * Extract headings from Markdown content
 * Supports h2, h3, and h4 headings
 */
function extractHeadings(content: string): TocItem[] {
  const headingRegex = /^(#{2,4})\s+(.+)$/gm
  const headings: TocItem[] = []
  const idCounts: Record<string, number> = {}
  let match

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length
    const text = match[2].trim()

    // Skip empty headings
    if (!text) continue

    // Generate ID from heading text (same as rehype-slug)
    let id = text
      .toLowerCase()
      .replace(/[^\w\s\u4e00-\u9fff-]/g, '') // Keep Chinese characters
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    // Skip if ID is still empty after processing
    if (!id) {
      id = `heading-${headings.length}`
    }

    // Handle duplicate IDs by appending a number
    if (idCounts[id] !== undefined) {
      idCounts[id]++
      id = `${id}-${idCounts[id]}`
    } else {
      idCounts[id] = 0
    }

    headings.push({ id, text, level })
  }

  return headings
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [mobileOpen, setMobileOpen] = useState(false)

  // Extract headings from content
  useEffect(() => {
    const extracted = extractHeadings(content)
    setHeadings(extracted)
  }, [content])

  // Use Intersection Observer to track active heading
  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-80px 0px -80% 0px',
        threshold: 0
      }
    )

    // Observe all heading elements
    headings.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [headings])

  const handleClick = useCallback((id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const yOffset = -100 // Account for fixed header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
      setActiveId(id)
      setMobileOpen(false)
    }
  }, [])

  if (headings.length === 0) {
    return null
  }

  const renderTocList = () => (
    <ul className={styles.tocNav}>
      {headings.map((heading, index) => (
        <li key={`${heading.id}-${index}`} className={styles.tocItem}>
          <button
            onClick={() => handleClick(heading.id)}
            className={`${styles.tocLink} ${styles[`h${heading.level}`]} ${
              activeId === heading.id ? styles.active : ''
            }`}
          >
            {heading.text}
          </button>
        </li>
      ))}
    </ul>
  )

  return (
    <>
      {/* Desktop TOC - Fixed Sidebar */}
      <nav className={styles.tocContainer} aria-label="Table of contents">
        <div className={styles.tocHeader}>
          <List />
          <span>On This Page</span>
        </div>
        {renderTocList()}
      </nav>

      {/* Mobile TOC - Collapsible */}
      <div className={styles.tocMobile}>
        <button
          className={`${styles.tocMobileButton} ${mobileOpen ? styles.open : ''}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
        >
          <span>Table of Contents</span>
          <ChevronDown />
        </button>
        {mobileOpen && (
          <div className={styles.tocMobileContent}>
            {renderTocList()}
          </div>
        )}
      </div>
    </>
  )
}
