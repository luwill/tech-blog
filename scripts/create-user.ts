import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('👤 Creating admin user...')

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@louwill.com' },
    update: {
      role: Role.ADMIN,
    },
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@louwill.com',
      name: 'LouWill',
      role: Role.ADMIN,
    }
  })

  console.log(`✅ Admin user created: ${adminUser.name} (${adminUser.email})`)
  console.log(`📝 User ID: ${adminUser.id}`)
  
  return adminUser
}

main()
  .then((user) => {
    console.log('🎉 Admin user setup completed!')
    console.log(`Please update your API routes to use this user ID: ${user.id}`)
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })