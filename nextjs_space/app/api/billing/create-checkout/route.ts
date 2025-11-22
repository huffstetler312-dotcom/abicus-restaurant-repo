
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createCheckoutSession } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { plan } = await request.json()

    if (!plan || !['BASIC', 'PROFESSIONAL', 'ENTERPRISE'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Get subscription
    const subscription = await prisma.subscription.findUnique({
      where: { tenantId: session.user.tenantId }
    })

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    const origin = request.headers.get('origin') || 'http://localhost:3000'

    const checkoutSession = await createCheckoutSession({
      customerId: subscription.stripeCustomerId,
      plan: plan as keyof typeof import('@/lib/stripe').PLANS,
      successUrl: `${origin}/billing?success=true`,
      cancelUrl: `${origin}/billing?canceled=true`,
      tenantId: session.user.tenantId
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Create checkout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
