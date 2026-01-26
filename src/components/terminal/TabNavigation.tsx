'use client'

import { ReactNode, useState, createContext, useContext } from 'react'
import styles from '@/styles/components/tab-navigation.module.css'

// Tab context for managing state
interface TabContextType {
  activeTab: string
  setActiveTab: (id: string) => void
}

const TabContext = createContext<TabContextType | null>(null)

function useTabContext() {
  const context = useContext(TabContext)
  if (!context) {
    throw new Error('Tab components must be used within a TabNavigation')
  }
  return context
}

// Main container
interface TabNavigationProps {
  defaultTab?: string
  variant?: 'default' | 'pill' | 'underline' | 'vertical'
  className?: string
  children: ReactNode
  onChange?: (tabId: string) => void
}

export function TabNavigation({
  defaultTab,
  variant = 'default',
  className = '',
  children,
  onChange,
}: TabNavigationProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || '')

  const handleSetActiveTab = (id: string) => {
    setActiveTab(id)
    onChange?.(id)
  }

  const containerClasses = [
    styles.tabContainer,
    variant !== 'default' && styles[variant],
    className,
  ].filter(Boolean).join(' ')

  return (
    <TabContext.Provider value={{ activeTab, setActiveTab: handleSetActiveTab }}>
      <div className={containerClasses}>
        {children}
      </div>
    </TabContext.Provider>
  )
}

// Tab list container
interface TabListProps {
  children: ReactNode
  className?: string
  actions?: ReactNode
}

export function TabList({ children, className = '', actions }: TabListProps) {
  return (
    <div className={`${styles.tabList} ${className}`}>
      {children}
      {actions && <div className={styles.tabActions}>{actions}</div>}
    </div>
  )
}

// Individual tab
interface TabProps {
  id: string
  icon?: ReactNode
  children: ReactNode
  fileType?: string
  closable?: boolean
  modified?: boolean
  onClose?: () => void
  className?: string
}

export function Tab({
  id,
  icon,
  children,
  fileType,
  closable = false,
  modified = false,
  onClose,
  className = '',
}: TabProps) {
  const { activeTab, setActiveTab } = useTabContext()
  const isActive = activeTab === id

  const tabClasses = [
    styles.tab,
    isActive && styles.active,
    fileType && styles[fileType],
    className,
  ].filter(Boolean).join(' ')

  const handleClick = () => {
    setActiveTab(id)
  }

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClose?.()
  }

  return (
    <button className={tabClasses} onClick={handleClick}>
      {icon && <span className={styles.tabIcon}>{icon}</span>}
      <span>{children}</span>
      {modified && <span className={styles.tabModified} />}
      {closable && (
        <span className={styles.tabClose} onClick={handleClose}>
          <CloseIcon />
        </span>
      )}
    </button>
  )
}

// Tab panel content
interface TabPanelProps {
  id: string
  children: ReactNode
  className?: string
}

export function TabPanel({ id, children, className = '' }: TabPanelProps) {
  const { activeTab } = useTabContext()
  const isActive = activeTab === id

  const panelClasses = [
    styles.tabPanel,
    isActive && styles.active,
    className,
  ].filter(Boolean).join(' ')

  // Don't render content if not active (for performance)
  if (!isActive) return null

  return (
    <div className={panelClasses}>
      {children}
    </div>
  )
}

// Tab action button
interface TabActionProps {
  icon: ReactNode
  onClick?: () => void
  title?: string
  className?: string
}

export function TabAction({ icon, onClick, title, className = '' }: TabActionProps) {
  return (
    <button
      className={`${styles.tabAction} ${className}`}
      onClick={onClick}
      title={title}
    >
      {icon}
    </button>
  )
}

// Pre-built file tab with icon
interface FileTabProps {
  id: string
  fileName: string
  closable?: boolean
  modified?: boolean
  onClose?: () => void
}

export function FileTab({ id, fileName, closable, modified, onClose }: FileTabProps) {
  const extension = fileName.split('.').pop() || ''
  const icon = getFileIcon(extension)

  return (
    <Tab
      id={id}
      icon={icon}
      fileType={extension}
      closable={closable}
      modified={modified}
      onClose={onClose}
    >
      {fileName}
    </Tab>
  )
}

// File type icons
function getFileIcon(extension: string): ReactNode {
  switch (extension.toLowerCase()) {
    case 'ts':
    case 'tsx':
      return <TypeScriptIcon />
    case 'js':
    case 'jsx':
      return <JavaScriptIcon />
    case 'css':
      return <CSSIcon />
    case 'md':
      return <MarkdownIcon />
    case 'json':
      return <JSONIcon />
    default:
      return <FileIcon />
  }
}

// Simple inline icons
function CloseIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
      <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  )
}

function FileIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M13 4H8.414L7 2.586 6.586 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1z" />
    </svg>
  )
}

function TypeScriptIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <rect x="1" y="1" width="14" height="14" rx="1" fill="#3178c6" />
      <path d="M5 8h4v1H8v4H7V9H5V8zm6.5 0h-2v1h1v1h-1v1h1v1h-1v1h2v-5z" fill="white" />
    </svg>
  )
}

function JavaScriptIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <rect x="1" y="1" width="14" height="14" rx="1" fill="#f7df1e" />
      <path d="M6 11c0 1 .5 1.5 1.25 1.5s1-.5 1-1c0-.75-.5-1-1.25-1.25C6.25 10 5.5 9.5 5.5 8.5c0-1 .75-1.5 1.75-1.5S9 7.5 9 8.5h-1c0-.5-.25-.75-.75-.75s-.75.25-.75.75c0 .5.5.75 1 1 .75.25 1.5.75 1.5 1.75 0 1-.75 1.75-2 1.75S5 12 5 11h1zm4-4h1v4c0 .5.25.75.75.75s.75-.25.75-.75V7h1v4c0 1-.75 1.75-1.75 1.75S10 12 10 11V7z" fill="black" />
    </svg>
  )
}

function CSSIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <rect x="1" y="1" width="14" height="14" rx="1" fill="#264de4" />
      <path d="M4 4l.5 7.5L8 13l3.5-1.5.5-7.5H4zm6 2l-.1 1H6l.1 1h3.7l-.3 3-1.5.5-1.5-.5-.1-1H5.5l.2 2L8 12l2.3-.8.3-3.2H5.9L5.8 6h4.2z" fill="white" />
    </svg>
  )
}

function MarkdownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <rect x="1" y="1" width="14" height="14" rx="1" fill="#083fa1" />
      <path d="M3 5v6h1.5V8l1.5 2 1.5-2v3H9V5H7.5L6 7.5 4.5 5H3zm8 0v4h-1l2 2 2-2h-1V5h-2z" fill="white" />
    </svg>
  )
}

function JSONIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <rect x="1" y="1" width="14" height="14" rx="1" fill="#cbcb41" />
      <path d="M5 5c-.5 0-1 .5-1 1v1c0 .5-.5 1-1 1s.5.5 1 1v1c0 .5.5 1 1 1m6-6c.5 0 1 .5 1 1v1c0 .5.5 1 1 1s-.5.5-1 1v1c0 .5-.5 1-1 1" stroke="#333" strokeWidth="1" fill="none" />
    </svg>
  )
}

export default TabNavigation
