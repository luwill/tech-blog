'use client'

import { useState, useCallback } from 'react'
import { HeaderSimple } from '@/components/layout/header-simple'
import { Footer } from '@/components/layout/footer'
import { useLocale } from '@/components/providers/locale-provider'
import { GraduationCap, ChevronRight, FileText, FolderOpen } from 'lucide-react'
import { courseModules, totalTopics } from '@/data/course-data'
import { AsciiFluidOverlay } from '@/components/ascii-fluid'
import styles from '@/styles/pages/course.module.css'

export default function CoursePage() {
  const { t, locale } = useLocale()
  const isZh = locale === 'zh'

  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set())

  const toggleModule = useCallback((id: number) => {
    setExpandedModules(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const allExpanded = expandedModules.size === courseModules.length

  const toggleAll = useCallback(() => {
    if (allExpanded) {
      setExpandedModules(new Set())
    } else {
      setExpandedModules(new Set(courseModules.map(m => m.id)))
    }
  }, [allExpanded])

  return (
    <div className="flex flex-col min-h-screen">
      <AsciiFluidOverlay />
      <HeaderSimple />

      <main className="flex-1">
        {/* Page Header */}
        <div className={styles.pageHeader}>
          <div className="max-w-3xl mx-auto px-4">
            <div className={styles.headerContent}>
              <GraduationCap className={styles.headerIcon} aria-hidden="true" />
              <div>
                <h1 className={styles.headerTitle}>course/</h1>
                <p className={styles.headerSubtitle}>
                  $ tree ./modules --depth 2 → {courseModules.length} directories, {totalTopics} files
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className={styles.hero}>
            <div className={styles.heroLine}>
              <span className={styles.heroKeyword}>const</span>{' '}
              <span className={styles.heroVariable}>courseName</span>{' '}
              <span className={styles.heroOperator}>=</span>{' '}
              <span className={styles.heroString}>&quot;{t.courseTitle}&quot;</span>
            </div>
            <div className={styles.heroLine}>
              <span className={styles.heroKeyword}>const</span>{' '}
              <span className={styles.heroVariable}>subtitle</span>{' '}
              <span className={styles.heroOperator}>=</span>{' '}
              <span className={styles.heroString}>&quot;{t.courseSubtitle}&quot;</span>
            </div>
            <div className={styles.heroLine}>
              <span className={styles.heroComment}>// {t.courseDescription}</span>
            </div>
          </div>

          {/* Control Bar */}
          <div className={styles.controlBar}>
            <span className={styles.statsText}>
              $ wc -l ./course → <span>{courseModules.length}</span> {t.courseModules}, <span>{totalTopics}</span> {t.courseTopics}
            </span>
            <button
              type="button"
              className={styles.toggleButton}
              onClick={toggleAll}
            >
              {allExpanded ? t.courseCollapseAll : t.courseExpandAll}
            </button>
          </div>

          {/* Module List */}
          <div className={styles.moduleList}>
            {courseModules.map((module, index) => {
              const isExpanded = expandedModules.has(module.id)
              return (
                <div key={module.id} className={styles.moduleItem}>
                  <button
                    type="button"
                    className={styles.moduleHeader}
                    onClick={() => toggleModule(module.id)}
                    aria-expanded={isExpanded}
                  >
                    <span className={styles.moduleNumber}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <FolderOpen className={styles.topicIcon} aria-hidden="true" />
                    <span className={styles.moduleIcon}>{module.icon}</span>
                    <div className={styles.moduleInfo}>
                      <h2 className={styles.moduleTitle}>
                        {isZh ? module.title : module.titleEn}
                      </h2>
                      <p className={styles.moduleDesc}>
                        {isZh ? module.description : module.descriptionEn}
                      </p>
                    </div>
                    <ChevronRight
                      className={`${styles.chevron} ${isExpanded ? styles.chevronExpanded : ''}`}
                      aria-hidden="true"
                    />
                  </button>

                  <div className={`${styles.topicWrapper} ${isExpanded ? styles.topicWrapperExpanded : ''}`}>
                    <div className={styles.topicInner}>
                      <div className={styles.topicList}>
                        {module.topics.map((topic, tIndex) => (
                          <div key={topic.id} className={styles.topicItem}>
                            <span className={styles.topicNumber}>
                              {tIndex + 1}
                            </span>
                            <FileText className={styles.topicIcon} aria-hidden="true" />
                            <span className={styles.topicTitle}>
                              {isZh ? topic.title : topic.titleEn}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className={styles.moduleClosing}>{'}'}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
