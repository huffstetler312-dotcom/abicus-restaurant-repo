
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createBillingPortalSession } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get subscription
    const subscription = await prisma.subscription.findUnique({
      where: { tenantId: session.user.tenantId }
    })

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    const origin = request.headers.get('origin') || 'http://localhost:3000'

    const portalSession = await createBillingPortalSession(
      subscription.stripeCustomerId,
      `${origin}/billing`
    )

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error('Create portal error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
