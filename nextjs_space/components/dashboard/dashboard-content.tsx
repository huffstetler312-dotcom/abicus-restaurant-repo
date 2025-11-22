
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  AlertTriangle, 
  Package, 
  ClipboardCheck, 
  Bell, 
  Plus,
  Clock,
  User,
  Calendar,
  TrendingUp,
  Shield
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { format } from 'date-fns'

interface DashboardContentProps {
  data: {
    stats: {
      totalFoodItems: number
      activeLineChecks: number
      unreadNotifications: number
      criticalItems: number
      warningItems: number
    }
    recentFoodItems: any[]
    expiringItems: any[]
    lineCheckSubmissions: any[]
  }
  session: any
}

export function DashboardContent({ data, session }: DashboardContentProps) {
  const { stats, recentFoodItems, expiringItems, lineCheckSubmissions } = data

  const getExpirationColor = (status: string) => {
    switch (status) {
      case 'expired':
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-green-100 text-green-800 border-green-200'
    }
  }

  const getExpirationIcon = (status: string) => {
    switch (status) {
      case 'expired':
      case 'critical':
        return <AlertTriangle className="w-4 h-4" />
      case 'warning':
        return <Clock className="w-4 h-4" />
      default:
        return <Shield className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {session.user?.name}
          </h1>
          <p className="text-gray-600 mt-1">
            {session.user?.tenantName} • {session.user?.role}
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/expiration-alerts">
            <Button variant="outline">
              <AlertTriangle className="w-4 h-4 mr-2" />
              View Alerts
            </Button>
          </Link>
          <Link href="/label-creator">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFoodItems}</div>
              <p className="text-xs text-muted-foreground">Food items tracked</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.criticalItems}</div>
              <p className="text-xs text-muted-foreground">Items need attention</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Warnings</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.warningItems}</div>
              <p className="text-xs text-muted-foreground">Expiring soon</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Line Checks</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeLineChecks}</div>
              <p className="text-xs text-muted-foreground">Active templates</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notifications</CardTitle>
              <Bell className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.unreadNotifications}</div>
              <p className="text-xs text-muted-foreground">Unread messages</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Expiring Items */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
                Expiration Alerts
              </CardTitle>
              <CardDescription>Items requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              {expiringItems?.length ? (
                <div className="space-y-3">
                  {expiringItems.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-600">
                          {item.location && `${item.location} • `}
                          Expires: {format(new Date(item.expirationDate), 'MMM dd, yyyy')}
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`${getExpirationColor(item.expirationStatus.status)} flex items-center gap-1`}
                      >
                        {getExpirationIcon(item.expirationStatus.status)}
                        {item.expirationStatus.days === 0 
                          ? 'Today' 
                          : item.expirationStatus.days < 0 
                            ? `${Math.abs(item.expirationStatus.days)}d ago`
                            : `${item.expirationStatus.days}d left`
                        }
                      </Badge>
                    </div>
                  ))}
                  {expiringItems.length > 5 && (
                    <Link href="/expiration-alerts">
                      <Button variant="outline" className="w-full mt-4">
                        View All {expiringItems.length} Items
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No expiring items - you're all set!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest updates from your team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Recent Food Items */}
                {recentFoodItems?.slice(0, 3).map((item) => (
                  <div key={`food-${item.id}`} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{item.createdBy?.name}</span> added{' '}
                        <span className="font-medium">{item.name}</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(item.createdAt), 'MMM dd, h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Recent Line Check Submissions */}
                {lineCheckSubmissions?.slice(0, 2).map((submission) => (
                  <div key={`check-${submission.id}`} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{submission.submittedBy?.name}</span> completed{' '}
                        <span className="font-medium">{submission.template?.name}</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(submission.submittedAt), 'MMM dd, h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}

                {(!recentFoodItems?.length && !lineCheckSubmissions?.length) && (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to keep your restaurant running smoothly</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/label-creator">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                  <Plus className="w-6 h-6" />
                  <span>Add Food Item</span>
                </Button>
              </Link>
              <Link href="/line-checks">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                  <ClipboardCheck className="w-6 h-6" />
                  <span>Daily Checks</span>
                </Button>
              </Link>
              <Link href="/reports">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                  <TrendingUp className="w-6 h-6" />
                  <span>View Reports</span>
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                  <User className="w-6 h-6" />
                  <span>Manage Team</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
