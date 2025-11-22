
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seed...')

  // Create demo tenant
  const demoTenant = await prisma.tenant.upsert({
    where: { slug: 'demo-restaurant' },
    update: {},
    create: {
      name: 'Demo Restaurant',
      slug: 'demo-restaurant',
    }
  })

  console.log('Created demo tenant:', demoTenant.name)

  // Create default admin user
  const hashedPassword = await bcrypt.hash('johndoe123', 12)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      password: hashedPassword,
      name: 'John Doe',
      role: 'ADMIN',
      tenantId: demoTenant.id,
    }
  })

  console.log('Created admin user:', adminUser.email)

  // Create additional demo users
  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@restaurant.com' },
    update: {},
    create: {
      email: 'manager@restaurant.com',
      password: await bcrypt.hash('manager123', 12),
      name: 'Restaurant Manager',
      role: 'MANAGER',
      tenantId: demoTenant.id,
    }
  })

  const staffUser = await prisma.user.upsert({
    where: { email: 'staff@restaurant.com' },
    update: {},
    create: {
      email: 'staff@restaurant.com',
      password: await bcrypt.hash('staff123', 12),
      name: 'Kitchen Staff',
      role: 'STAFF',
      tenantId: demoTenant.id,
    }
  })

  console.log('Created additional users')

  // Create demo subscription
  const subscription = await prisma.subscription.upsert({
    where: { tenantId: demoTenant.id },
    update: {},
    create: {
      stripeCustomerId: 'cus_demo_customer',
      stripeSubscriptionId: '',
      status: 'TRIALING',
      plan: 'PROFESSIONAL',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      tenantId: demoTenant.id,
    }
  })

  console.log('Created demo subscription')

  // Create sample food items
  const sampleFoodItems = [
    {
      name: 'Chicken Breast',
      category: 'Proteins',
      prepDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      quantity: 5.5,
      unit: 'lbs',
      location: 'Walk-in Cooler',
      notes: 'Fresh delivery from supplier',
      createdById: adminUser.id,
      tenantId: demoTenant.id,
    },
    {
      name: 'Caesar Dressing',
      category: 'Condiments',
      prepDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      expirationDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
      quantity: 2,
      unit: 'gallons',
      location: 'Reach-in Cooler',
      notes: 'House-made dressing',
      createdById: managerUser.id,
      tenantId: demoTenant.id,
    },
    {
      name: 'Mixed Greens',
      category: 'Produce',
      prepDate: new Date(),
      expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
      quantity: 10,
      unit: 'lbs',
      location: 'Walk-in Cooler',
      notes: 'Organic mixed greens',
      createdById: staffUser.id,
      tenantId: demoTenant.id,
    },
    {
      name: 'Tomato Sauce',
      category: 'Prepared Foods',
      prepDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      expirationDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Expired 1 day ago
      quantity: 3,
      unit: 'quarts',
      location: 'Prep Area',
      notes: 'Needs to be disposed of',
      createdById: adminUser.id,
      tenantId: demoTenant.id,
    }
  ]

  for (const item of sampleFoodItems) {
    await prisma.foodItem.upsert({
      where: { id: `demo-${item.name.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: {
        ...item,
        id: `demo-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
      }
    })
  }

  console.log('Created sample food items')

  // Create sample line check template
  const lineCheckTemplate = await prisma.lineCheckTemplate.upsert({
    where: { id: 'demo-opening-checklist' },
    update: {},
    create: {
      id: 'demo-opening-checklist',
      name: 'Opening Line Check',
      description: 'Daily opening safety and quality checks',
      category: 'Opening',
      tenantId: demoTenant.id,
    }
  })

  // Create line check items
  const checkItems = [
    {
      title: 'Walk-in Cooler Temperature',
      description: 'Check and record walk-in cooler temperature',
      checkType: 'TEMPERATURE' as const,
      expectedValue: '38°F',
      toleranceRange: '±2°F',
      order: 1,
    },
    {
      title: 'Freezer Temperature',
      description: 'Check and record freezer temperature',
      checkType: 'TEMPERATURE' as const,
      expectedValue: '0°F',
      toleranceRange: '±5°F',
      order: 2,
    },
    {
      title: 'Hand Washing Stations',
      description: 'Verify all hand washing stations are stocked and functional',
      checkType: 'BOOLEAN' as const,
      order: 3,
    },
    {
      title: 'Sanitizer Solution PPM',
      description: 'Test and record sanitizer solution concentration',
      checkType: 'NUMBER' as const,
      expectedValue: '200',
      toleranceRange: '150-400 PPM',
      order: 4,
    }
  ]

  for (const item of checkItems) {
    await prisma.lineCheckItem.upsert({
      where: { id: `demo-item-${item.order}` },
      update: {},
      create: {
        ...item,
        id: `demo-item-${item.order}`,
        templateId: lineCheckTemplate.id,
      }
    })
  }

  console.log('Created line check template and items')

  // Create sample notifications
  const notifications = [
    {
      title: 'Critical Expiration Alert',
      message: 'Mixed Greens expires today. Please use or dispose of immediately.',
      type: 'EXPIRATION_ALERT' as const,
      priority: 'CRITICAL' as const,
      tenantId: demoTenant.id,
      receiverId: adminUser.id,
    },
    {
      title: 'Item Expired',
      message: 'Tomato Sauce has expired and should be disposed of immediately.',
      type: 'EXPIRATION_ALERT' as const,
      priority: 'CRITICAL' as const,
      tenantId: demoTenant.id,
      receiverId: managerUser.id,
    },
    {
      title: 'Line Check Due',
      message: 'Opening Line Check needs to be completed for today.',
      type: 'LINE_CHECK_DUE' as const,
      priority: 'NORMAL' as const,
      tenantId: demoTenant.id,
      receiverId: staffUser.id,
    }
  ]

  for (const notification of notifications) {
    await prisma.notification.create({
      data: {
        ...notification,
        id: `demo-notification-${Date.now()}-${Math.random()}`
      }
    })
  }

  console.log('Created sample notifications')

  console.log('Database seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
