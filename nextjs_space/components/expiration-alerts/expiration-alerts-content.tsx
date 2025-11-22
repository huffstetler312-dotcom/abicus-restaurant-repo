
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  AlertTriangle, 
  Clock, 
  Shield, 
  Search,
  Filter,
  Package,
  Calendar,
  User,
  MapPin
} from 'lucide-react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import Link from 'next/link'

interface ExpirationAlertsContentProps {
  data: {
    allItems: any[]
    groupedItems: {
      expired: any[]
      critical: any[]
      warning: any[]
      safe: any[]
    }
    totalItems: number
    stats: {
      expired: number
      critical: number
      warning: number
      safe: number
    }
  }
  session: any
}

export function ExpirationAlertsContent({ data, session }: ExpirationAlertsContentProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [locationFilter, setLocationFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selectedTab, setSelectedTab] = useState('critical')

  const { groupedItems, stats, allItems } = data

  // Get unique locations and categories for filters
  const locations = Array.from(new Set(allItems.map(item => item.location).filter(Boolean)))
  const categories = Array.from(new Set(allItems.map(item => item.category).filter(Boolean)))

  // Filter items based on search and filters
  const filterItems = (items: any[]) => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesLocation = locationFilter === 'all' || item.location === locationFilter
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
      return matchesSearch && matchesLocation && matchesCategory
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'safe':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'expired':
      case 'critical':
        return <AlertTriangle className="w-4 h-4" />
      case 'warning':
        return <Clock className="w-4 h-4" />
      case 'safe':
        return <Shield className="w-4 h-4" />
      default:
        return <Package className="w-4 h-4" />
    }
  }

  const getStatusText = (item: any) => {
    const { status, days } = item.expirationStatus
    
    if (status === 'expired') {
      return `Expired ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} ago`
    } else if (days === 0) {
      return 'Expires today'
    } else if (days === 1) {
      return 'Expires tomorrow'
    } else {
      return `Expires in ${days} day${days !== 1 ? 's' : ''}`
    }
  }

  const renderItemCard = (item: any) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg">{item.name}</h3>
                <Badge 
                  variant="outline" 
                  className={`${getStatusColor(item.expirationStatus.status)} flex items-center gap-1`}
                >
                  {getStatusIcon(item.expirationStatus.status)}
                  {getStatusText(item)}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Prep: {format(new Date(item.prepDate), 'MMM dd, yyyy')}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Expires: {format(new Date(item.expirationDate), 'MMM dd, yyyy')}
                </div>
                {item.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {item.location}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  Added by {item.createdBy?.name}
                </div>
              </div>

              {item.quantity && (
                <div className="text-sm text-gray-600 mb-2">
                  Quantity: {item.quantity} {item.unit || 'units'}
                </div>
              )}

              {item.notes && (
                <div className="text-sm text-gray-600 mb-4">
                  Notes: {item.notes}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm">
              Edit Item
            </Button>
            <Button variant="outline" size="sm">
              Print Label
            </Button>
            {(item.expirationStatus.status === 'expired' || item.expirationStatus.status === 'critical') && (
              <Button variant="destructive" size="sm">
                Mark as Used/Disposed
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-orange-600" />
            Expiration Alert System
          </h1>
          <p className="text-gray-600 mt-1">
            Patent-pending color-coded monitoring for food safety compliance
          </p>
        </div>
        <Link href="/label-creator">
          <Button>
            <Package className="w-4 h-4 mr-2" />
            Add New Item
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Expired</p>
                <p className="text-2xl font-bold text-red-700">{stats.expired}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Critical</p>
                <p className="text-2xl font-bold text-red-700">{stats.critical}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Warning</p>
                <p className="text-2xl font-bold text-yellow-700">{stats.warning}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Safe</p>
                <p className="text-2xl font-bold text-green-700">{stats.safe}</p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search food items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map(location => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items by Status */}
      <Card>
        <CardContent className="p-6">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="critical" className="data-[state=active]:bg-red-100">
                Critical ({stats.expired + stats.critical})
              </TabsTrigger>
              <TabsTrigger value="warning" className="data-[state=active]:bg-yellow-100">
                Warning ({stats.warning})
              </TabsTrigger>
              <TabsTrigger value="safe" className="data-[state=active]:bg-green-100">
                Safe ({stats.safe})
              </TabsTrigger>
              <TabsTrigger value="all">
                All Items ({data.totalItems})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="critical" className="mt-6">
              <div className="space-y-4">
                {filterItems([...groupedItems.expired, ...groupedItems.critical]).length > 0 ? (
                  filterItems([...groupedItems.expired, ...groupedItems.critical]).map(renderItemCard)
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No critical items found</p>
                    <p>Your food inventory is safe!</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="warning" className="mt-6">
              <div className="space-y-4">
                {filterItems(groupedItems.warning).length > 0 ? (
                  filterItems(groupedItems.warning).map(renderItemCard)
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No warning items found</p>
                    <p>No items expiring in the next 3 days.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="safe" className="mt-6">
              <div className="space-y-4">
                {filterItems(groupedItems.safe).length > 0 ? (
                  filterItems(groupedItems.safe).map(renderItemCard)
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No safe items found</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="all" className="mt-6">
              <div className="space-y-4">
                {filterItems(allItems).length > 0 ? (
                  filterItems(allItems).map(renderItemCard)
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No items found</p>
                    <p>Try adjusting your filters or add some food items.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
