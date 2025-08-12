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
    async jwt({ token, user, trigger }) {
      // Initial sign in
      if (user) {
        token.role = user.role
      }
      
      // Handle session update
      if (trigger === "update") {
        const updatedUser = await db.user.findUnique({
          where: { id: token.sub! },
          select: { role: true }
        })
        if (updatedUser) {
          token.role = updatedUser.role
        }
      }
      
      return token
    },
    async signIn({ user, account }) {
      if (!user.email) return false
      
      // Only update role after user record exists
      if (account?.provider === 'google' && user.email === process.env.ADMIN_EMAIL) {
        // Give some time for the user to be created by the adapter
        setTimeout(async () => {
          try {
            await db.user.update({
              where: { email: user.email! },
              data: { role: Role.ADMIN }
            })
            console.log('Admin role assigned to user:', user.email)
          } catch (error) {
            console.error('Failed to update user role:', error)
          }
        }, 1000)
      }
      
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