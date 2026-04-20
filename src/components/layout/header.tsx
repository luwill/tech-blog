"use client"

import Link from "next/link"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { LocaleToggle } from "@/components/ui/locale-toggle"
import { useLocale } from "@/components/providers/locale-provider"

export function Header() {
  const { t } = useLocale()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">L</span>
            </div>
            <span className="font-bold text-xl">LouWill</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            {t.home}
          </Link>
          <Link
            href="/blog"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            {t.blog}
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            {t.about}
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          <LocaleToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
