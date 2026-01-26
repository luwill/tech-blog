'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import styles from '@/styles/components/code-card.module.css'

interface CodeCardProps {
  title: string
  slug: string
  excerpt?: string
  date?: string
  author?: string
  tags?: string[]
  readTime?: string
  views?: number
  isDraft?: boolean
  isFeatured?: boolean
  compact?: boolean
  fileExtension?: string
  className?: string
}

export function CodeCard({
  title,
  slug,
  excerpt,
  date,
  author,
  tags = [],
  readTime,
  views,
  isDraft = false,
  isFeatured = false,
  compact = false,
  fileExtension = 'md',
  className = '',
}: CodeCardProps) {
  // Generate fake line numbers based on excerpt length
  const lineCount = excerpt ? Math.min(Math.ceil(excerpt.length / 50), 6) : 4
  const lines = Array.from({ length: lineCount }, (_, i) => i + 1)

  // Split excerpt into lines for display
  const excerptLines = excerpt
    ? excerpt.split(/[.。!！?？]/).filter(Boolean).slice(0, lineCount)
    : []

  const cardClasses = [
    styles.codeCard,
    compact && styles.compact,
    isFeatured && styles.featured,
    className,
  ].filter(Boolean).join(' ')

  // Format date as code-like
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toISOString().split('T')[0]
  }

  return (
    <Link href={`/blog/${slug}`} className={cardClasses}>
      {/* File Header */}
      <div className={styles.fileHeader}>
        <FileIcon className={styles.fileIcon} />
        <span className={styles.fileName}>{title}</span>
        <span className={styles.fileExtension}>{fileExtension}</span>
        {isDraft && (
          <span className={`${styles.statusDot} ${styles.draft}`} title="Draft" />
        )}
      </div>

      {/* Code Content */}
      <div className={styles.codeContent}>
        <div className={styles.lineNumbers}>
          {lines.map((num) => (
            <div key={num} className={styles.lineNumber}>
              {num}
            </div>
          ))}
        </div>
        <div className={styles.codeLines}>
          {excerptLines.length > 0 ? (
            excerptLines.map((line, idx) => (
              <div key={idx} className={styles.codeLine}>
                {line.trim()}
              </div>
            ))
          ) : (
            <>
              <div className={styles.codeLine}>{title}</div>
              <div className={styles.codeLine}>Loading content...</div>
            </>
          )}
        </div>
      </div>

      {/* Meta Footer */}
      <div className={styles.metaFooter}>
        {date && (
          <div className={styles.metaItem}>
            <CalendarIcon className={styles.metaIcon} />
            <span className={styles.metaLabel}>date:</span>
            <span className={styles.metaValue}>{formatDate(date)}</span>
          </div>
        )}
        {readTime && (
          <div className={styles.metaItem}>
            <ClockIcon className={styles.metaIcon} />
            <span className={styles.metaValue}>{readTime}</span>
          </div>
        )}
        {views !== undefined && (
          <div className={styles.metaItem}>
            <EyeIcon className={styles.metaIcon} />
            <span className={styles.metaValue}>{views}</span>
          </div>
        )}
        {tags.length > 0 && (
          <div className={styles.tags}>
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}

// Simple inline icons
function FileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14,2 14,8 20,8" />
    </svg>
  )
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12,6 12,12 16,14" />
    </svg>
  )
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

// Grid wrapper component
interface CodeCardGridProps {
  children: ReactNode
  className?: string
}

export function CodeCardGrid({ children, className = '' }: CodeCardGridProps) {
  return (
    <div className={`${styles.codeCardGrid} ${className}`}>
      {children}
    </div>
  )
}

export default CodeCard
