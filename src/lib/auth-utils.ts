import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { db } from "./db"
import { Role } from "@prisma/client"

// Get current user from session
export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return null
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    }
  })

  return user
}

// Get current user ID
export async function getCurrentUserId(): Promise<string> {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error("User not authenticated")
  }
  
  return user.id
}

// Check if current user is admin
export async function isCurrentUserAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === Role.ADMIN
}

// Require admin access
export async function requireAdminAccess() {
  const isAdmin = await isCurrentUserAdmin()
  
  if (!isAdmin) {
    throw new Error("Admin access required")
  }
}

// Get the admin user (for initial setup)
export async function getAdminUser() {
  const adminUser = await db.user.findFirst({
    where: {
      role: "ADMIN"
    }
  })

  if (!adminUser) {
    throw new Error("No admin user found. Please create an admin user first.")
  }

  return adminUser
}