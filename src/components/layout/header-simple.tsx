"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { LocaleToggle } from "@/components/ui/locale-toggle"
import { useLocale } from "@/components/providers/locale-provider"
import { useSession } from "next-auth/react"
import { Role } from "@prisma/client"
import { Terminal } from "lucide-react"
import styles from "@/styles/components/header.module.css"

export function HeaderSimple() {
  const pathname = usePathname()
  const { t } = useLocale()
  const { data: session } = useSession()

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo - Terminal prompt style */}
        <Link href="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <Terminal className="w-4 h-4" aria-hidden="true" />
          </div>
          <span className={styles.logoText}>louwill</span>
          <span className={styles.logoCursor}></span>
        </Link>

        {/* Navigation - Tab style */}
        <nav className={styles.nav}>
          <Link
            href="/"
            className={`${styles.navLink} ${isActive('/') && pathname === '/' ? styles.active : ''}`}
          >
            {t.home}
          </Link>
          <Link
            href="/blog"
            className={`${styles.navLink} ${isActive('/blog') ? styles.active : ''}`}
          >
            {t.blog}
          </Link>
        </nav>

        {/* Right actions */}
        <div className={styles.actions}>
          <LocaleToggle />
          <ThemeToggle />

          {/* Admin button - only visible for logged-in admins */}
          {session?.user?.role === Role.ADMIN && (
            <Link href="/admin" className={styles.adminButton}>
              {t.admin}
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
