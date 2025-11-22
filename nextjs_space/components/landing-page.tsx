
'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertTriangle, QrCode, ClipboardCheck, BarChart, Shield, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { PLANS } from '@/lib/plans'

const features = [
  {
    icon: AlertTriangle,
    title: 'Patent-Pending Expiration System',
    description: 'Color-coded monitoring with automated alerts to prevent food waste and ensure safety',
    color: 'text-red-600'
  },
  {
    icon: QrCode,
    title: 'Smart Label Creator',
    description: 'Generate professional food labels with QR codes for instant tracking and compliance',
    color: 'text-blue-600'
  },
  {
    icon: ClipboardCheck,
    title: 'Digital Line Checks',
    description: 'Streamlined daily safety checks with customizable templates and real-time monitoring',
    color: 'text-green-600'
  },
  {
    icon: BarChart,
    title: 'Advanced Analytics',
    description: 'Comprehensive reports and insights to optimize operations and maintain compliance',
    color: 'text-purple-600'
  },
  {
    icon: Shield,
    title: 'Food Safety Compliance',
    description: 'Stay ahead of health department requirements with automated compliance tracking',
    color: 'text-orange-600'
  }
]

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Head Chef, Coastal Bistro',
    content: 'Odin\'s Almanac has revolutionized our kitchen operations. We\'ve reduced food waste by 40% and passed our health inspections with flying colors.',
    rating: 5
  },
  {
    name: 'Mike Rodriguez',
    role: 'Restaurant Manager, Urban Kitchen',
    content: 'The expiration alert system is a game-changer. No more surprises during service, and our staff loves how easy it is to use.',
    rating: 5
  },
  {
    name: 'Emily Chen',
    role: 'Owner, Dragon House',
    content: 'From day one, this platform saved us time and money. The compliance tracking gives us peace of mind during inspections.',
    rating: 5
  }
]

export function LandingPage() {
  const [selectedPlan, setSelectedPlan] = useState('PROFESSIONAL')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="relative w-8 h-8">
                <Image
                  src="/logo.png"
                  alt="Odin's Almanac"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-bold text-xl text-blue-900">Odin's Almanac</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/signin">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-4 bg-blue-100 text-blue-900 hover:bg-blue-200">
              Patent-Pending Technology
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Restaurant Intelligence
              <span className="text-blue-600 block">Powered by Norse Wisdom</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform your restaurant operations with our comprehensive food safety and inventory management platform. 
              Reduce waste, ensure compliance, and boost profitability.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Start Free Trial
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                Watch Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything Your Restaurant Needs
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools designed specifically for food service operations
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <feature.icon className={`w-12 h-12 ${feature.color} mb-4`} />
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start with a 14-day free trial, no credit card required
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {Object.entries(PLANS).map(([planKey, plan]) => (
              <motion.div
                key={planKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className={`h-full relative ${selectedPlan === planKey ? 'ring-2 ring-blue-600 shadow-lg' : ''}`}>
                  {planKey === 'PROFESSIONAL' && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-600 text-white">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <div className="text-4xl font-bold text-gray-900">
                      ${(plan.price / 100).toFixed(0)}
                      <span className="text-lg font-normal text-gray-600">/month</span>
                    </div>
                    <CardDescription>14-day free trial</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" />
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-8">
                      <Link href="/auth/signup">
                        <Button 
                          className={`w-full ${planKey === 'PROFESSIONAL' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                          variant={planKey === 'PROFESSIONAL' ? 'default' : 'outline'}
                        >
                          Start Free Trial
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Restaurants Nationwide
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers are saying
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="pt-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <blockquote className="text-gray-600 mb-4">
                      "{testimonial.content}"
                    </blockquote>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Restaurant?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of restaurants already using Odin's Almanac to improve operations and ensure food safety.
            </p>
            <Link href="/auth/signup">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                Start Your Free Trial Today
              </Button>
            </Link>
            <p className="text-sm text-blue-100 mt-4">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="relative w-8 h-8">
              <Image
                src="/logo.png"
                alt="Odin's Almanac Footer Logo"
                fill
                className="object-contain filter invert"
              />
            </div>
            <span className="font-bold text-xl">Odin's Almanac</span>
          </div>
          <p className="text-gray-400 mb-6">
            Restaurant Intelligence Platform • Food Safety • Inventory Management
          </p>
          <div className="flex justify-center space-x-8 text-sm text-gray-400">
            <Link href="#" className="hover:text-white">About</Link>
            <Link href="#" className="hover:text-white">Contact</Link>
            <Link href="#" className="hover:text-white">Support</Link>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-sm text-gray-400">
            <p>&copy; 2024 Odin's Almanac. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
