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
      
      // Check if this is the admin user
      const isAdmin = user.email === process.env.ADMIN_EMAIL
      
      // Update user role if they are the admin
      if (isAdmin && user.id) {
        await db.user.update({
          where: { id: user.id },
          data: { role: Role.ADMIN }
        })
      }
      
      return true
    },
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