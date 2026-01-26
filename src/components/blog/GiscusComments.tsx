'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import Giscus from '@giscus/react'
import { AlertCircle } from 'lucide-react'
import styles from '@/styles/components/giscus-comments.module.css'

interface GiscusCommentsProps {
  slug: string
}

export function GiscusComments({ slug }: GiscusCommentsProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Get Giscus configuration from environment variables
  const repo = process.env.NEXT_PUBLIC_GISCUS_REPO as `${string}/${string}`
  const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID
  const category = process.env.NEXT_PUBLIC_GISCUS_CATEGORY
  const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID

  // Check if Giscus is configured
  const isConfigured = repo && repoId && category && categoryId

  if (!mounted) {
    return (
      <section className={styles.commentsContainer}>
        <div className={styles.giscusWrapper}>
          <div className={styles.loading}>
            <div className={styles.loadingSpinner} />
            <span>Loading comments...</span>
          </div>
        </div>
      </section>
    )
  }

  if (!isConfigured) {
    return (
      <section className={styles.commentsContainer}>
        <div className={styles.error}>
          <AlertCircle />
          <p className={styles.errorText}>
            Comments are not configured. Please set up Giscus environment variables.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.commentsContainer}>
      <div className={styles.giscusWrapper}>
        <Giscus
          id="comments"
          repo={repo}
          repoId={repoId}
          category={category}
          categoryId={categoryId}
          mapping="pathname"
          term={slug}
          reactionsEnabled="1"
          emitMetadata="0"
          inputPosition="top"
          theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
          lang="zh-CN"
          loading="lazy"
        />
      </div>
    </section>
  )
}
