import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Check if trying to access admin routes
    if (pathname.startsWith('/admin')) {
      // If no token, redirect to sign in
      if (!token) {
        const signInUrl = new URL('/auth/signin', req.url)
        signInUrl.searchParams.set('callbackUrl', req.url)
        return NextResponse.redirect(signInUrl)
      }
      
      // If not admin role, redirect to home with error
      if (token.role !== 'ADMIN') {
        const homeUrl = new URL('/', req.url)
        homeUrl.searchParams.set('error', 'access-denied')
        return NextResponse.redirect(homeUrl)
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Allow all non-admin routes
        if (!pathname.startsWith('/admin')) {
          return true
        }
        
        // For admin routes, require authentication
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/posts/:path*',
    '/api/categories/:path*',
    '/api/upload/:path*',
    '/api/analytics/:path*'
  ]
}