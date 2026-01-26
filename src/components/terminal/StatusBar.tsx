'use client'

import { ReactNode } from 'react'
import styles from '@/styles/components/status-bar.module.css'

interface StatusBarProps {
  variant?: 'primary' | 'dark'
  sticky?: boolean
  minimal?: boolean
  className?: string
  children?: ReactNode
}

export function StatusBar({
  variant = 'primary',
  sticky = false,
  minimal = false,
  className = '',
  children,
}: StatusBarProps) {
  const barClasses = [
    styles.statusBar,
    variant === 'dark' && styles.dark,
    sticky && styles.sticky,
    minimal && styles.minimal,
    className,
  ].filter(Boolean).join(' ')

  return (
    <div className={barClasses}>
      {children}
    </div>
  )
}

// Status bar sections
interface SectionProps {
  children: ReactNode
  className?: string
}

export function StatusBarLeft({ children, className = '' }: SectionProps) {
  return (
    <div className={`${styles.leftSection} ${className}`}>
      {children}
    </div>
  )
}

export function StatusBarRight({ children, className = '' }: SectionProps) {
  return (
    <div className={`${styles.rightSection} ${className}`}>
      {children}
    </div>
  )
}

// Status bar item
interface StatusItemProps {
  icon?: ReactNode
  children: ReactNode
  onClick?: () => void
  hideOnMobile?: boolean
  className?: string
}

export function StatusItem({
  icon,
  children,
  onClick,
  hideOnMobile = false,
  className = '',
}: StatusItemProps) {
  const itemClasses = [
    styles.statusItem,
    onClick && styles.clickable,
    hideOnMobile && styles.hideOnMobile,
    className,
  ].filter(Boolean).join(' ')

  return (
    <div className={itemClasses} onClick={onClick}>
      {icon && <span className={styles.statusIcon}>{icon}</span>}
      <span className={styles.statusText}>{children}</span>
    </div>
  )
}

// Separator
export function StatusSeparator() {
  return <div className={styles.separator} />
}

// Status indicator
interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'warning'
  label?: string
  className?: string
}

export function StatusIndicator({ status, label, className = '' }: StatusIndicatorProps) {
  return (
    <div className={`${styles.statusItem} ${className}`}>
      <span className={`${styles.statusIndicator} ${styles[status]}`} />
      {label && <span className={styles.statusText}>{label}</span>}
    </div>
  )
}

// Pre-built status items
export function BranchStatus({ branch = 'main' }: { branch?: string }) {
  return (
    <StatusItem icon={<GitBranchIcon />}>
      {branch}
    </StatusItem>
  )
}

export function SyncStatus({ synced = true }: { synced?: boolean }) {
  return (
    <StatusItem icon={synced ? <CheckIcon /> : <SyncIcon />}>
      {synced ? 'Synced' : 'Syncing...'}
    </StatusItem>
  )
}

export function EncodingStatus({ encoding = 'UTF-8' }: { encoding?: string }) {
  return (
    <StatusItem hideOnMobile>
      {encoding}
    </StatusItem>
  )
}

export function LineEndingStatus({ ending = 'LF' }: { ending?: 'LF' | 'CRLF' }) {
  return (
    <StatusItem hideOnMobile>
      {ending}
    </StatusItem>
  )
}

export function LanguageStatus({ language = 'TypeScript' }: { language?: string }) {
  return (
    <StatusItem icon={<CodeIcon />} hideOnMobile>
      {language}
    </StatusItem>
  )
}

// Simple inline icons
function GitBranchIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
      <path fillRule="evenodd" d="M11.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122V6A2.5 2.5 0 0110 8.5H6a1 1 0 00-1 1v1.128a2.251 2.251 0 11-1.5 0V5.372a2.25 2.25 0 111.5 0v1.836A2.492 2.492 0 016 7h4a1 1 0 001-1v-.628A2.25 2.25 0 019.5 3.25zM4.25 12a.75.75 0 100 1.5.75.75 0 000-1.5zM3.5 3.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0z" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
      <path fillRule="evenodd" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
    </svg>
  )
}

function SyncIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
      <path fillRule="evenodd" d="M8 2.5a5.487 5.487 0 00-4.131 1.869l1.204 1.204A.25.25 0 014.896 6H1.25A.25.25 0 011 5.75V2.104a.25.25 0 01.427-.177l1.38 1.38A7.001 7.001 0 0114.95 7.16a.75.75 0 11-1.49.178A5.501 5.501 0 008 2.5zM1.705 8.005a.75.75 0 01.834.656 5.501 5.501 0 009.592 2.97l-1.204-1.204a.25.25 0 01.177-.427h3.646a.25.25 0 01.25.25v3.646a.25.25 0 01-.427.177l-1.38-1.38A7.001 7.001 0 011.05 8.84a.75.75 0 01.656-.834z" />
    </svg>
  )
}

function CodeIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
      <path fillRule="evenodd" d="M4.72 3.22a.75.75 0 011.06 1.06L2.06 8l3.72 3.72a.75.75 0 11-1.06 1.06L.47 8.53a.75.75 0 010-1.06l4.25-4.25zm6.56 0a.75.75 0 10-1.06 1.06L13.94 8l-3.72 3.72a.75.75 0 101.06 1.06l4.25-4.25a.75.75 0 000-1.06l-4.25-4.25z" />
    </svg>
  )
}

// Export all
export default StatusBar
