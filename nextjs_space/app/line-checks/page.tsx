
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { LineChecksContent } from '@/components/line-checks/line-checks-content'

export const dynamic = "force-dynamic"

async function getLineCheckData(tenantId: string) {
  const [templates, recentSubmissions] = await Promise.all([
    // Get all active templates
    prisma.lineCheckTemplate.findMany({
      where: { tenantId, isActive: true },
      include: {
        items: {
          orderBy: { order: 'asc' }
        },
        _count: {
          select: { submissions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),

    // Get recent submissions
    prisma.lineCheckSubmission.findMany({
      where: { tenantId },
      include: {
        template: { select: { name: true } },
        submittedBy: { select: { name: true } },
        responses: {
          include: {
            item: { select: { title: true, checkType: true } }
          }
        }
      },
      orderBy: { submittedAt: 'desc' },
      take: 10
    })
  ])

  return {
    templates,
    recentSubmissions
  }
}

export default async function LineChecksPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.tenantId) {
    return <div>Error: No tenant found</div>
  }

  const lineCheckData = await getLineCheckData(session.user.tenantId)

  return <LineChecksContent data={lineCheckData} session={session} />
}
