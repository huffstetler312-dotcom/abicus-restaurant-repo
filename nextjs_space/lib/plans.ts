
// Subscription plans configuration - safe for client-side use
export const PLANS = {
  BASIC: {
    name: 'Basic Plan',
    price: 2900, // $29.00
    priceId: 'price_basic_monthly',
    features: [
      'Up to 50 food items tracked',
      'Basic expiration alerts',
      'Essential line checks',
      'Email notifications',
      'Basic reports'
    ]
  },
  PROFESSIONAL: {
    name: 'Professional Plan',
    price: 4900, // $49.00
    priceId: 'price_pro_monthly',
    features: [
      'Up to 200 food items tracked',
      'Advanced expiration monitoring',
      'Custom line check templates',
      'Email + SMS notifications',
      'Advanced reports & analytics',
      'Label printing with QR codes',
      'Priority support'
    ]
  },
  ENTERPRISE: {
    name: 'Enterprise Plan',
    price: 9900, // $99.00
    priceId: 'price_enterprise_monthly',
    features: [
      'Unlimited food items',
      'AI-powered insights',
      'Custom integrations',
      'Multi-location support',
      'Advanced compliance tracking',
      'White-label options',
      'Dedicated account manager'
    ]
  }
} as const
