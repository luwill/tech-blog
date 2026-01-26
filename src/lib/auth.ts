import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import { db } from "@/lib/db"
import { Role } from "@prisma/client"

export const authOptions: NextAuthOptions = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(db) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  debug: process.env.NODE_ENV === 'development',
  callbacks: {
    async session({ session, token }) {
      if (session?.user && token) {
        session.user.id = token.sub!
        session.user.role = token.role as Role
      }
      return session
    },
    async jwt({ token, user, trigger, account }) {
      // Initial sign in - user object is available
      if (user) {
        token.role = user.role

        // Check if this is the admin email and assign admin role
        if (account?.provider === 'google' && user.email === process.env.ADMIN_EMAIL) {
          // Update user role in database (user should exist at this point)
          try {
            await db.user.update({
              where: { id: user.id },
              data: { role: Role.ADMIN }
            })
            token.role = Role.ADMIN
            console.log('Admin role assigned to user:', user.email)
          } catch (error) {
            console.error('Failed to update user role:', error)
          }
        }
      }

      // Handle session update or refresh - always fetch latest role from DB
      if (trigger === "update" || !token.role) {
        const dbUser = await db.user.findUnique({
          where: { id: token.sub! },
          select: { role: true }
        })
        if (dbUser) {
          token.role = dbUser.role
        }
      }

      return token
    },
    async signIn({ user }) {
      // Only allow sign in if user has email
      if (!user.email) return false
      return true
    },
    async redirect({ url, baseUrl }) {
      // Redirect to the original URL after sign in
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: Role
    }
  }
  
  interface User {
    role: Role
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role
  }
}