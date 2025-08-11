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
    async session({ session, user }) {
      if (session?.user && user) {
        session.user.id = user.id
        session.user.role = (user as { role: Role }).role
      }
      return session
    },
    async signIn({ user }) {
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
  events: {
    async signIn({ user }) {
      // Only update role after user is created
      if (user.email === process.env.ADMIN_EMAIL && user.id) {
        try {
          await db.user.update({
            where: { id: user.id },
            data: { role: Role.ADMIN }
          })
          console.log('Admin role assigned to user:', user.email)
        } catch (error) {
          console.error('Failed to update user role:', error)
        }
      }
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: "database",
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