'use client'

import { ReactNode } from 'react'
import styles from '@/styles/components/terminal-window.module.css'

interface TerminalWindowProps {
  children: ReactNode
  title?: string
  className?: string
  size?: 'small' | 'medium' | 'large' | 'full'
  elevated?: boolean
  noPadding?: boolean
  compact?: boolean
  showTrafficLights?: boolean
  footer?: ReactNode
}

export function TerminalWindow({
  children,
  title = 'terminal',
  className = '',
  size = 'full',
  elevated = false,
  noPadding = false,
  compact = false,
  showTrafficLights = true,
  footer,
}: TerminalWindowProps) {
  const windowClasses = [
    styles.terminalWindow,
    styles[size],
    elevated && styles.elevated,
    className,
  ].filter(Boolean).join(' ')

  const contentClasses = [
    styles.content,
    noPadding && styles.noPadding,
    compact && styles.compact,
  ].filter(Boolean).join(' ')

  return (
    <div className={windowClasses}>
      <div className={styles.titleBar}>
        {showTrafficLights && (
          <div className={styles.trafficLights}>
            <div className={`${styles.trafficLight} ${styles.red}`} />
            <div className={`${styles.trafficLight} ${styles.yellow}`} />
            <div className={`${styles.trafficLight} ${styles.green}`} />
          </div>
        )}
        <span className={styles.title}>{title}</span>
      </div>
      <div className={contentClasses}>
        {children}
      </div>
      {footer && (
        <div className={styles.footer}>
          {footer}
        </div>
      )}
    </div>
  )
}

// Sub-components for terminal content
interface PromptLineProps {
  prompt?: string
  command: string
  output?: ReactNode
}

export function PromptLine({ prompt = '$', command, output }: PromptLineProps) {
  return (
    <div>
      <div className={styles.promptLine}>
        <span className={styles.prompt}>{prompt}</span>
        <span className={styles.command}>{command}</span>
      </div>
      {output && <div className={styles.output}>{output}</div>}
    </div>
  )
}

export default TerminalWindow
