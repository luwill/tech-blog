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
  callbacks: {
    async session({ session, user }) {
      if (session?.user) {
        session.user.id = user.id
        session.user.role = (user as { role: Role }).role
      }
      return session
    },
    async signIn({ user }) {
      if (!user.email) return false
      return true
    },
  },
  events: {
    async signIn({ user, isNewUser }) {
      // Only update role after user is created
      if (user.email && user.id) {
        const isAdmin = user.email === process.env.ADMIN_EMAIL
        
        if (isAdmin) {
          try {
            // Use upsert to handle both new and existing users
            await db.user.upsert({
              where: { id: user.id },
              update: { role: Role.ADMIN },
              create: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: Role.ADMIN
              }
            })
          } catch (error) {
            console.error('Failed to update user role:', error)
          }
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