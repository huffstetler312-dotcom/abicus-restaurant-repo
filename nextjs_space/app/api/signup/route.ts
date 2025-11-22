
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { createStripeCustomer } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, companyName, role = 'ADMIN' } = await request.json()

    // Validate required fields
    if (!email || !password || !fullName || !companyName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Create tenant slug with random suffix to ensure uniqueness
    const baseSlug = companyName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    
    // Add random suffix to ensure uniqueness
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    const slug = `${baseSlug}-${randomSuffix}`

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create tenant and user in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          name: companyName,
          slug
        }
      })

      // Create user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name: fullName,
          role: role.toUpperCase() as any,
          tenantId: tenant.id
        }
      })

      return { tenant, user }
    })

    // Create Stripe customer
    try {
      const stripeCustomer = await createStripeCustomer(
        email,
        fullName,
        companyName
      )

      // Create subscription record (initially in trial)
      await prisma.subscription.create({
        data: {
          stripeCustomerId: stripeCustomer.id,
          stripeSubscriptionId: null, // Will be set when they subscribe
          status: 'TRIALING',
          plan: 'BASIC',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
          trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          tenantId: result.tenant.id
        }
      })
    } catch (stripeError) {
      console.error('Failed to create Stripe customer:', stripeError)
      // Continue without failing the signup
    }

    return NextResponse.json({
      message: 'Account created successfully',
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        tenantId: result.tenant.id
      }
    })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
