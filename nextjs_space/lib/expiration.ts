
import { prisma } from './db'
import { createNotification } from './notifications'
import { NotificationType, NotificationPriority } from '@prisma/client'

export function getExpirationStatus(expirationDate: Date) {
  const now = new Date()
  const timeDiff = expirationDate.getTime() - now.getTime()
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))

  if (daysDiff < 0) {
    return { status: 'expired', color: 'red', days: Math.abs(daysDiff) }
  } else if (daysDiff <= 1) {
    return { status: 'critical', color: 'red', days: daysDiff }
  } else if (daysDiff <= 3) {
    return { status: 'warning', color: 'yellow', days: daysDiff }
  } else {
    return { status: 'safe', color: 'green', days: daysDiff }
  }
}

export async function checkExpirationAlerts() {
  const now = new Date()
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
  
  const expiringItems = await prisma.foodItem.findMany({
    where: {
      expirationDate: {
        lte: threeDaysFromNow
      },
      isActive: true
    },
    include: {
      tenant: true,
      createdBy: true
    }
  })

  for (const item of expiringItems) {
    const status = getExpirationStatus(item.expirationDate)
    
    if (status.status === 'critical' || status.status === 'expired') {
      // Get all admins and managers for the tenant
      const recipients = await prisma.user.findMany({
        where: {
          tenantId: item.tenantId,
          role: { in: ['ADMIN', 'MANAGER'] },
          isActive: true
        }
      })

      for (const recipient of recipients) {
        await createNotification({
          title: status.status === 'expired' ? 'Food Item Expired' : 'Critical Expiration Alert',
          message: `${item.name} ${status.status === 'expired' ? 'expired' : 'expires'} ${status.days === 0 ? 'today' : `${status.days} day(s) ago/in`}. Location: ${item.location || 'Not specified'}`,
          type: NotificationType.EXPIRATION_ALERT,
          priority: NotificationPriority.CRITICAL,
          tenantId: item.tenantId,
          receiverId: recipient.id,
          sendEmail: true,
          sendSMS: true
        })
      }
    }
  }
}
