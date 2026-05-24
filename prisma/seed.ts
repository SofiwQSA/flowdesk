import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash('admin123', 12)
  
  const user = await prisma.user.upsert({
    where: { email: 'admin@flowdesk.com' },
    update: {},
    create: {
      email: 'admin@flowdesk.com',
      name: 'Admin',
      password,
      role: 'ADMIN',
      plan: 'ENTERPRISE',
    },
  })
  
  console.log('✅ Админ создан:', user.email)
  console.log('   Пароль: admin123')
}

main().catch(console.error).finally(() => prisma.$disconnect())
