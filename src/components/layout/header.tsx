"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { LocaleToggle } from "@/components/ui/locale-toggle"
import { useLocale } from "@/components/providers/locale-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Settings, LogOut, Edit } from "lucide-react"
import { Role } from "@prisma/client"

export function Header() {
  const { data: session, status } = useSession()
  const { t } = useLocale()
  
  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Header session status:', status, 'session:', session)
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

        {/* Right side */}
        <div className="flex items-center space-x-4">
          <LocaleToggle />
          <ThemeToggle />
          
          {status === 'loading' ? (
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-xs text-primary-foreground">
                      {session.user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {session.user.name && (
                      <p className="font-medium">{session.user.name}</p>
                    )}
                    {session.user.email && (
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {session.user.email}
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                
                {session.user.role === Role.ADMIN && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>{t.admin} Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/posts/new">
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Write Post</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={(event) => {
                    event.preventDefault()
                    signOut()
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t.signOut}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="default">
              <Link href="/auth/signin">{t.signIn}</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}