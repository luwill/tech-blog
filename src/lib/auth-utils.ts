import { db } from "./db"

// Get the admin user (for now, we'll use the first admin user)
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

// TODO: Replace this with actual session-based user retrieval
export async function getCurrentUserId(): Promise<string> {
  const adminUser = await getAdminUser()
  return adminUser.id
}