
import Stripe from 'stripe'
import { PLANS } from './plans'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
})

export { PLANS }

export async function createStripeCustomer(email: string, name: string, tenantName: string) {
  return await stripe.customers.create({
    email,
    name: `${name} (${tenantName})`,
    metadata: {
      tenantName
    }
  })
}

export async function createCheckoutSession({
  customerId,
  plan,
  successUrl,
  cancelUrl,
  tenantId
}: {
  customerId: string
  plan: keyof typeof PLANS
  successUrl: string
  cancelUrl: string
  tenantId: string
}) {
  const planData = PLANS[plan]
  
  return await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: planData.name,
            description: planData.features.join(', ')
          },
          unit_amount: planData.price,
          recurring: {
            interval: 'month'
          }
        },
        quantity: 1
      }
    ],
    metadata: {
      tenantId,
      plan
    },
    subscription_data: {
      trial_period_days: 14,
      metadata: {
        tenantId,
        plan
      }
    },
    success_url: successUrl,
    cancel_url: cancelUrl
  })
}

export async function createBillingPortalSession(customerId: string, returnUrl: string) {
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl
  })
}

export { stripe }
