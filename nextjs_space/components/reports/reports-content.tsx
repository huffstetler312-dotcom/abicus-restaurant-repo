
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  BarChart, 
  PieChart, 
  LineChart,
  Download,
  Calendar as CalendarIcon,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Package
} from 'lucide-react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

// Charts will be implemented in future versions

interface ReportsContentProps {
  data: {
    stats: {
      totalFoodItems: number
      activeFoodItems: number
      totalLineChecks: number
      recentLineChecks: number
      complianceRate: number
    }
    charts: {
      categoryData: Array<{ name: string; value: number }>
      expirationData: Array<{ name: string; value: number; color: string }>
      complianceData: Array<{ name: string; value: number; color: string }>
      activityTrend: Array<{ date: string; items: number; checks: number }>
    }
  }
  session: any
}

export function ReportsContent({ data, session }: ReportsContentProps) {
  const [dateRange, setDateRange] = useState('30d')
  const [reportType, setReportType] = useState('overview')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  const { stats, charts } = data

  const exportReport = () => {
    // In a real implementation, this would generate and download a PDF report
    const reportData = {
      restaurant: session.user?.tenantName,
      generatedBy: session.user?.name,
      date: new Date().toISOString(),
      stats,
      charts
    }
    
    const dataStr = JSON.stringify(reportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `restaurant-report-${format(new Date(), 'yyyy-MM-dd')}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart className="w-8 h-8 text-purple-600" />
            Reports & Analytics
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive insights into your restaurant operations
          </p>
        </div>
        <div className="flex gap-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Items</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalFoodItems}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {stats.activeFoodItems} currently active
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Line Checks</p>
                  <p className="text-2xl font-bold text-green-600">{stats.totalLineChecks}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {stats.recentLineChecks} in last 30 days
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Compliance</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.complianceRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Safety compliance rate
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Food Waste</p>
                  <p className="text-2xl font-bold text-orange-600">↓12%</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Reduction vs last period
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Efficiency</p>
                  <p className="text-2xl font-bold text-green-600">↑8%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Operations improvement
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Food Items by Category */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Food Items by Category
              </CardTitle>
              <CardDescription>
                Distribution of your current inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ width: '100%', height: 300 }}>
                {typeof window !== 'undefined' && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-gray-500">
                      Chart will load here (Category Distribution)
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Expiration Status */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Expiration Status
              </CardTitle>
              <CardDescription>
                Current safety status of your inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ width: '100%', height: 300 }}>
                {typeof window !== 'undefined' && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-gray-500">
                      Chart will load here (Expiration Status Bar Chart)
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Activity Trend */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="w-5 h-5" />
                Activity Trend
              </CardTitle>
              <CardDescription>
                Daily activity over the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ width: '100%', height: 300 }}>
                {typeof window !== 'undefined' && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-gray-500">
                      Chart will load here (Activity Trend Line Chart)
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Compliance Overview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Compliance Overview
              </CardTitle>
              <CardDescription>
                Line check completion rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ width: '100%', height: 300 }}>
                {typeof window !== 'undefined' && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-gray-500">
                      Chart will load here (Compliance Overview Pie Chart)
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Insights & Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              AI Insights & Recommendations
            </CardTitle>
            <CardDescription>
              Powered by Allwise Navigator (Coming Soon)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-800">Great Performance</span>
                </div>
                <p className="text-sm text-green-700">
                  Your compliance rate is above industry average. Keep up the excellent work!
                </p>
              </div>
              
              <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Optimization Opportunity</span>
                </div>
                <p className="text-sm text-yellow-700">
                  Consider adjusting prep schedules for produce items to reduce waste by an estimated 15%.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Trend Analysis</span>
                </div>
                <p className="text-sm text-blue-700">
                  Line check completion is trending upward. Your team is becoming more efficient.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
