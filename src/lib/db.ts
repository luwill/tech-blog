import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Only log errors - disable verbose query logging to reduce noise
    log: process.env.NODE_ENV === 'development' ? ['error'] : [],
    // Connection pool settings for serverless environments (Vercel + Supabase)
    datasourceUrl: process.env.DATABASE_URL,
  })

// Cache the client in development to prevent too many connections
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Re-export as prisma for backward compatibility
export const prisma = db