"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { LocaleToggle } from "@/components/ui/locale-toggle"
import { useLocale } from "@/components/providers/locale-provider"
import { useSession } from "next-auth/react"
import { Role } from "@prisma/client"
import { Search, X } from "lucide-react"

export function HeaderSimple() {
  const router = useRouter()
  const { t } = useLocale()
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setShowSearch(false)
      setSearchQuery("")
    }
  }

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

        {/* Search */}
        {showSearch && (
          <div className="absolute top-full left-0 right-0 bg-background border-b p-4 md:hidden">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="text"
                placeholder={t.search + " articles..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
                autoFocus
              />
              <Button type="submit" size="sm">
                <Search className="h-4 w-4" />
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setShowSearch(false)
                  setSearchQuery("")
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </form>
          </div>
        )}

        {/* Desktop Search */}
        <div className="hidden md:block flex-1 max-w-sm mx-8">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder={t.search + " articles..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
          </form>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Mobile Search Toggle */}
          <Button 
            variant="ghost" 
            size="sm"
            className="md:hidden"
            onClick={() => setShowSearch(!showSearch)}
          >
            <Search className="h-4 w-4" />
          </Button>
          
          <LocaleToggle />
          <ThemeToggle />
          
          {/* Auth buttons */}
          {session?.user?.role === Role.ADMIN ? (
            <Button asChild variant="default" className="hidden sm:inline-flex">
              <Link href="/admin">{t.admin}</Link>
            </Button>
          ) : (
            <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
              <Link href="/auth/signin">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}