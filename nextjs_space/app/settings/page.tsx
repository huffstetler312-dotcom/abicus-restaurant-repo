
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { SettingsContent } from '@/components/settings/settings-content'

export const dynamic = "force-dynamic"

async function getSettingsData(tenantId: string, userId: string) {
  const [tenant, user, teamMembers] = await Promise.all([
    prisma.tenant.findUnique({
      where: { id: tenantId }
    }),
    prisma.user.findUnique({
      where: { id: userId }
    }),
    prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    })
  ])

  return { tenant, user, teamMembers }
}

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.tenantId || !session?.user?.id) {
    return <div>Error: Session not found</div>
  }

  const settingsData = await getSettingsData(session.user.tenantId, session.user.id)

  return <SettingsContent data={settingsData} session={session} />
}
