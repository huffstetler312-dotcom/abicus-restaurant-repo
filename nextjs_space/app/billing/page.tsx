
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { BillingContent } from '@/components/billing/billing-content'

export const dynamic = "force-dynamic"

async function getBillingData(tenantId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { tenantId },
    include: {
      tenant: {
        select: { name: true }
      }
    }
  })

  return { subscription }
}

export default async function BillingPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.tenantId) {
    return <div>Error: No tenant found</div>
  }

  // Only allow ADMIN users to access billing
  if (session.user.role !== 'ADMIN') {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h2>
        <p className="text-gray-600">Only restaurant administrators can access billing information.</p>
      </div>
    )
  }

  const billingData = await getBillingData(session.user.tenantId)

  return <BillingContent data={billingData} session={session} />
}
