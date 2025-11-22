
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { DashboardContent } from '@/components/dashboard/dashboard-content'
import { getExpirationStatus } from '@/lib/expiration'

export const dynamic = "force-dynamic"

async function getDashboardData(tenantId: string) {
  const [
    totalFoodItems,
    activeLineChecks,
    unreadNotifications,
    recentFoodItems,
    expiringItems,
    lineCheckSubmissions
  ] = await Promise.all([
    // Total food items
    prisma.foodItem.count({
      where: { tenantId, isActive: true }
    }),

    // Active line check templates
    prisma.lineCheckTemplate.count({
      where: { tenantId, isActive: true }
    }),

    // Unread notifications
    prisma.notification.count({
      where: { tenantId, isRead: false }
    }),

    // Recent food items
    prisma.foodItem.findMany({
      where: { tenantId, isActive: true },
      include: { createdBy: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5
    }),

    // Items expiring soon
    prisma.foodItem.findMany({
      where: {
        tenantId,
        isActive: true,
        expirationDate: {
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        }
      },
      orderBy: { expirationDate: 'asc' },
      take: 10
    }),

    // Recent line check submissions
    prisma.lineCheckSubmission.findMany({
      where: { tenantId },
      include: {
        template: { select: { name: true } },
        submittedBy: { select: { name: true } }
      },
      orderBy: { submittedAt: 'desc' },
      take: 5
    })
  ])

  // Add expiration status to expiring items
  const expiringItemsWithStatus = expiringItems.map(item => ({
    ...item,
    expirationStatus: getExpirationStatus(item.expirationDate)
  }))

  // Calculate stats
  const criticalItems = expiringItemsWithStatus.filter(item => 
    item.expirationStatus.status === 'critical' || item.expirationStatus.status === 'expired'
  ).length

  const warningItems = expiringItemsWithStatus.filter(item => 
    item.expirationStatus.status === 'warning'
  ).length

  return {
    stats: {
      totalFoodItems,
      activeLineChecks,
      unreadNotifications,
      criticalItems,
      warningItems
    },
    recentFoodItems,
    expiringItems: expiringItemsWithStatus,
    lineCheckSubmissions
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.tenantId) {
    return <div>Error: No tenant found</div>
  }

  const dashboardData = await getDashboardData(session.user.tenantId)

  return <DashboardContent data={dashboardData} session={session} />
}
