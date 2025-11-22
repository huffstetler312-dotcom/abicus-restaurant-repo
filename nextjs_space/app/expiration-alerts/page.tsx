
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ExpirationAlertsContent } from '@/components/expiration-alerts/expiration-alerts-content'
import { getExpirationStatus } from '@/lib/expiration'

export const dynamic = "force-dynamic"

async function getExpirationData(tenantId: string) {
  // Get all active food items
  const foodItems = await prisma.foodItem.findMany({
    where: {
      tenantId,
      isActive: true
    },
    include: {
      createdBy: {
        select: { name: true, role: true }
      }
    },
    orderBy: { expirationDate: 'asc' }
  })

  // Add expiration status to each item
  const itemsWithStatus = foodItems.map(item => ({
    ...item,
    expirationStatus: getExpirationStatus(item.expirationDate)
  }))

  // Group by status
  const groupedItems = {
    expired: itemsWithStatus.filter(item => item.expirationStatus.status === 'expired'),
    critical: itemsWithStatus.filter(item => item.expirationStatus.status === 'critical'),
    warning: itemsWithStatus.filter(item => item.expirationStatus.status === 'warning'),
    safe: itemsWithStatus.filter(item => item.expirationStatus.status === 'safe')
  }

  return {
    allItems: itemsWithStatus,
    groupedItems,
    totalItems: foodItems.length,
    stats: {
      expired: groupedItems.expired.length,
      critical: groupedItems.critical.length,
      warning: groupedItems.warning.length,
      safe: groupedItems.safe.length
    }
  }
}

export default async function ExpirationAlertsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.tenantId) {
    return <div>Error: No tenant found</div>
  }

  const expirationData = await getExpirationData(session.user.tenantId)

  return <ExpirationAlertsContent data={expirationData} session={session} />
}
