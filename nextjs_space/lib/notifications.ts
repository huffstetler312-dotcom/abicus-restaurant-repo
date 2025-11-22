
import { prisma } from './db'
import { NotificationType, NotificationPriority } from '@prisma/client'
import twilio from 'twilio'
import sgMail from '@sendgrid/mail'

// Initialize services
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!)
sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

export async function createNotification({
  title,
  message,
  type = NotificationType.INFO,
  priority = NotificationPriority.NORMAL,
  tenantId,
  receiverId,
  senderId,
  sendEmail = false,
  sendSMS = false
}: {
  title: string
  message: string
  type?: NotificationType
  priority?: NotificationPriority
  tenantId: string
  receiverId: string
  senderId?: string
  sendEmail?: boolean
  sendSMS?: boolean
}) {
  const notification = await prisma.notification.create({
    data: {
      title,
      message,
      type,
      priority,
      tenantId,
      receiverId,
      senderId,
    },
    include: {
      receiver: true,
      tenant: true
    }
  })

  // Send email notification if requested
  if (sendEmail && notification.receiver.email) {
    try {
      await sgMail.send({
        to: notification.receiver.email,
        from: 'notifications@odinsalmanac.com',
        subject: notification.title,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <h2 style="color: #1e40af;">${notification.title}</h2>
            <p>${notification.message}</p>
            <p><strong>Restaurant:</strong> ${notification.tenant.name}</p>
            <p><em>This is an automated message from Odin's Almanac.</em></p>
          </div>
        `
      })
      
      await prisma.notification.update({
        where: { id: notification.id },
        data: { emailSent: true, emailSentAt: new Date() }
      })
    } catch (error) {
      console.error('Failed to send email notification:', error)
    }
  }

  // Send SMS notification if requested and critical priority
  if (sendSMS && notification.receiver.email && priority === NotificationPriority.CRITICAL) {
    try {
      // For demo purposes, we'll use email as phone approximation
      // In production, you'd have actual phone numbers in user model
      const phoneNumber = process.env.TWILIO_PHONE_NUMBER!
      
      await twilioClient.messages.create({
        body: `${title}: ${message}`,
        from: phoneNumber,
        to: phoneNumber // In production: user's phone number
      })
      
      await prisma.notification.update({
        where: { id: notification.id },
        data: { smsSent: true, smsSentAt: new Date() }
      })
    } catch (error) {
      console.error('Failed to send SMS notification:', error)
    }
  }

  return notification
}

export async function markNotificationAsRead(notificationId: string) {
  return await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true, readAt: new Date() }
  })
}

export async function getUnreadNotifications(userId: string) {
  return await prisma.notification.findMany({
    where: {
      receiverId: userId,
      isRead: false
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  })
}
