
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  CreditCard, 
  Crown, 
  Zap, 
  Star,
  Calendar,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { PLANS } from '@/lib/plans'

interface BillingContentProps {
  data: {
    subscription: any
  }
  session: any
}

export function BillingContent({ data, session }: BillingContentProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const { subscription } = data

  const handlePlanChange = async (planKey: string) => {
    setIsLoading(planKey)
    try {
      const response = await fetch('/api/billing/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey })
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Failed to start checkout process')
    } finally {
      setIsLoading(null)
    }
  }

  const handleManageBilling = async () => {
    setIsLoading('portal')
    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        throw new Error('Failed to create billing portal session')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Portal error:', error)
      toast.error('Failed to access billing portal')
    } finally {
      setIsLoading(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'TRIALING':
        return 'bg-blue-100 text-blue-800'
      case 'PAST_DUE':
        return 'bg-yellow-100 text-yellow-800'
      case 'CANCELED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="w-4 h-4" />
      case 'TRIALING':
        return <Star className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'BASIC':
        return <CreditCard className="w-6 h-6" />
      case 'PROFESSIONAL':
        return <Zap className="w-6 h-6" />
      case 'ENTERPRISE':
        return <Crown className="w-6 h-6" />
      default:
        return <CreditCard className="w-6 h-6" />
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'BASIC':
        return 'text-blue-600'
      case 'PROFESSIONAL':
        return 'text-purple-600'
      case 'ENTERPRISE':
        return 'text-gold-600'
      default:
        return 'text-gray-600'
    }
  }

  // Calculate trial progress
  const trialProgress = subscription?.trialEnd 
    ? Math.max(0, Math.min(100, 
        (1 - (new Date(subscription.trialEnd).getTime() - Date.now()) / (14 * 24 * 60 * 60 * 1000)) * 100
      ))
    : 0

  const trialDaysLeft = subscription?.trialEnd
    ? Math.max(0, Math.ceil((new Date(subscription.trialEnd).getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
    : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-blue-600" />
            Billing & Subscription
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your subscription and billing information
          </p>
        </div>
        {subscription?.stripeCustomerId && (
          <Button onClick={handleManageBilling} disabled={isLoading === 'portal'}>
            {isLoading === 'portal' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="mr-2 h-4 w-4" />
            )}
            Manage Billing
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Current Subscription */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getPlanIcon(subscription?.plan || 'BASIC')}
                Current Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {subscription?.plan || 'FREE TRIAL'}
                </div>
                <Badge 
                  className={`${getStatusColor(subscription?.status || 'TRIALING')} flex items-center gap-1 w-fit mx-auto`}
                >
                  {getStatusIcon(subscription?.status || 'TRIALING')}
                  {subscription?.status || 'TRIALING'}
                </Badge>
              </div>

              {subscription?.status === 'TRIALING' && subscription?.trialEnd && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Trial Progress</span>
                      <span>{trialDaysLeft} days left</span>
                    </div>
                    <Progress value={trialProgress} className="h-2" />
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Your free trial expires on{' '}
                      <span className="font-medium">
                        {format(new Date(subscription.trialEnd), 'MMM dd, yyyy')}
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {subscription?.status === 'ACTIVE' && (
                <div className="space-y-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      Your subscription renews on{' '}
                      <span className="font-medium">
                        {format(new Date(subscription.currentPeriodEnd), 'MMM dd, yyyy')}
                      </span>
                    </p>
                  </div>
                  <div className="text-center text-2xl font-bold text-green-600">
                    ${((PLANS[subscription?.plan as keyof typeof PLANS]?.price || 0) / 100).toFixed(0)}/month
                  </div>
                </div>
              )}

              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-medium text-gray-900">Current Features:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  {(PLANS[subscription?.plan as keyof typeof PLANS]?.features || PLANS.BASIC.features).map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Available Plans */}
        <div className="lg:col-span-2">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Plans</h2>
              <p className="text-gray-600">
                Upgrade or downgrade your subscription at any time
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(PLANS).map(([planKey, plan]) => {
                const isCurrentPlan = subscription?.plan === planKey
                const isProfessional = planKey === 'PROFESSIONAL'

                return (
                  <motion.div
                    key={planKey}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className={`relative ${isProfessional ? 'ring-2 ring-purple-600 shadow-lg' : ''}`}>
                      {isProfessional && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-purple-600 text-white">Most Popular</Badge>
                        </div>
                      )}
                      <CardHeader className="text-center">
                        <div className={`mx-auto mb-4 ${getPlanColor(planKey)}`}>
                          {getPlanIcon(planKey)}
                        </div>
                        <CardTitle className="text-xl">{plan.name}</CardTitle>
                        <div className="text-3xl font-bold text-gray-900">
                          ${(plan.price / 100).toFixed(0)}
                          <span className="text-lg font-normal text-gray-600">/month</span>
                        </div>
                        {!subscription || subscription.status === 'TRIALING' ? (
                          <CardDescription>14-day free trial</CardDescription>
                        ) : null}
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3 mb-6">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        
                        <Button
                          onClick={() => handlePlanChange(planKey)}
                          disabled={isCurrentPlan || isLoading === planKey}
                          variant={isProfessional && !isCurrentPlan ? 'default' : 'outline'}
                          className="w-full"
                        >
                          {isLoading === planKey ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : isCurrentPlan ? (
                            'Current Plan'
                          ) : subscription?.status === 'ACTIVE' ? (
                            'Change Plan'
                          ) : (
                            'Start Free Trial'
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Usage Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Usage Overview
          </CardTitle>
          <CardDescription>
            Current month usage and limits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-2">156</div>
              <div className="text-sm text-gray-600">Food Items Tracked</div>
              <div className="text-xs text-gray-500 mt-1">
                {subscription?.plan === 'BASIC' ? 'of 50 limit' : 'Unlimited'}
              </div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-2">23</div>
              <div className="text-sm text-gray-600">Line Checks Completed</div>
              <div className="text-xs text-gray-500 mt-1">This month</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-2">89</div>
              <div className="text-sm text-gray-600">Labels Generated</div>
              <div className="text-xs text-gray-500 mt-1">This month</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600 mb-2">12</div>
              <div className="text-sm text-gray-600">Reports Generated</div>
              <div className="text-xs text-gray-500 mt-1">This month</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle>Billing FAQs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Can I change my plan at any time?</h4>
              <p className="text-gray-600 text-sm">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, 
                and we'll prorate your billing accordingly.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">What happens if I cancel?</h4>
              <p className="text-gray-600 text-sm">
                You can cancel anytime from the billing portal. You'll retain access until the end of your 
                current billing period, and no future charges will occur.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Do you offer annual discounts?</h4>
              <p className="text-gray-600 text-sm">
                Yes! Contact our support team to learn about annual pricing options and save up to 20%.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
