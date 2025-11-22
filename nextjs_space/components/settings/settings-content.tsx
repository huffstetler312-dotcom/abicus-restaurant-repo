
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Settings, 
  User, 
  Users, 
  Bell, 
  Shield,
  Save,
  Plus,
  Trash2,
  Mail,
  Smartphone,
  Building,
  Brain
} from 'lucide-react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface SettingsContentProps {
  data: {
    tenant: any
    user: any
    teamMembers: any[]
  }
  session: any
}

export function SettingsContent({ data, session }: SettingsContentProps) {
  const { tenant, user, teamMembers } = data
  const [activeTab, setActiveTab] = useState('profile')

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  })

  const [restaurantData, setRestaurantData] = useState({
    name: tenant?.name || '',
    address: '',
    phone: '',
    timezone: 'UTC'
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailAlerts: true,
    smsAlerts: false,
    expirationReminders: true,
    lineCheckReminders: true,
    complianceAlerts: true
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleSaveProfile = async () => {
    setIsLoading(true)
    try {
      // API call to update profile
      await new Promise(resolve => setTimeout(resolve, 1000)) // Mock delay
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveRestaurant = async () => {
    setIsLoading(true)
    try {
      // API call to update restaurant settings
      await new Promise(resolve => setTimeout(resolve, 1000)) // Mock delay
      toast.success('Restaurant settings updated successfully')
    } catch (error) {
      toast.error('Failed to update restaurant settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveNotifications = async () => {
    setIsLoading(true)
    try {
      // API call to update notification settings
      await new Promise(resolve => setTimeout(resolve, 1000)) // Mock delay
      toast.success('Notification settings updated successfully')
    } catch (error) {
      toast.error('Failed to update notification settings')
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800'
      case 'MANAGER':
        return 'bg-blue-100 text-blue-800'
      case 'STAFF':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Settings className="w-8 h-8 text-gray-600" />
          Settings
        </h1>
        <p className="text-gray-600 mt-1">
          Manage your account, team, and restaurant preferences
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="restaurant">Restaurant</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="ai">AI Assistant</TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your personal details and account preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium">Current Role</h4>
                  <p className="text-sm text-gray-600">
                    Your access level in {tenant?.name}
                  </p>
                </div>
                <Badge className={getRoleBadgeColor(session.user?.role)}>
                  <Shield className="w-3 h-3 mr-1" />
                  {session.user?.role}
                </Badge>
              </div>

              <div className="pt-4">
                <Button onClick={handleSaveProfile} disabled={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Restaurant Settings */}
        <TabsContent value="restaurant" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Restaurant Information
              </CardTitle>
              <CardDescription>
                Manage your restaurant details and operational settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="restaurantName">Restaurant Name</Label>
                <Input
                  id="restaurantName"
                  value={restaurantData.name}
                  onChange={(e) => setRestaurantData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter restaurant name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={restaurantData.address}
                    onChange={(e) => setRestaurantData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Restaurant address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={restaurantData.phone}
                    onChange={(e) => setRestaurantData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={restaurantData.timezone} onValueChange={(value) => setRestaurantData(prev => ({ ...prev, timezone: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="EST">Eastern Time</SelectItem>
                    <SelectItem value="CST">Central Time</SelectItem>
                    <SelectItem value="MST">Mountain Time</SelectItem>
                    <SelectItem value="PST">Pacific Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4">
                <Button onClick={handleSaveRestaurant} disabled={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Management */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Team Members
                  </CardTitle>
                  <CardDescription>
                    Manage your restaurant team and their access levels
                  </CardDescription>
                </div>
                {session.user?.role === 'ADMIN' && (
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Member
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers?.map((member) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-gray-600">{member.email}</div>
                        <div className="text-xs text-gray-500">
                          Joined {format(new Date(member.createdAt), 'MMM dd, yyyy')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getRoleBadgeColor(member.role)}>
                        {member.role}
                      </Badge>
                      <Badge variant={member.isActive ? 'default' : 'secondary'}>
                        {member.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      {session.user?.role === 'ADMIN' && member.id !== session.user?.id && (
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Configure how you receive alerts and reminders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-medium">Email Alerts</div>
                      <div className="text-sm text-gray-600">Receive notifications via email</div>
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.emailAlerts}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailAlerts: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="font-medium">SMS Alerts</div>
                      <div className="text-sm text-gray-600">Receive critical alerts via SMS</div>
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.smsAlerts}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, smsAlerts: checked }))}
                  />
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-medium mb-4">Alert Types</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Expiration Reminders</div>
                        <div className="text-sm text-gray-600">Get notified about expiring food items</div>
                      </div>
                      <Switch
                        checked={notificationSettings.expirationReminders}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, expirationReminders: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Line Check Reminders</div>
                        <div className="text-sm text-gray-600">Reminders for daily safety checks</div>
                      </div>
                      <Switch
                        checked={notificationSettings.lineCheckReminders}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, lineCheckReminders: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Compliance Alerts</div>
                        <div className="text-sm text-gray-600">Critical food safety compliance issues</div>
                      </div>
                      <Switch
                        checked={notificationSettings.complianceAlerts}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, complianceAlerts: checked }))}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={handleSaveNotifications} disabled={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Preferences'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Assistant Settings */}
        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Allwise Navigator AI Assistant
              </CardTitle>
              <CardDescription>
                Configure your AI-powered restaurant intelligence assistant
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Brain className="w-16 h-16 mx-auto mb-6 text-blue-600 opacity-50" />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  AI Assistant Coming Soon
                </h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  The Allwise Navigator AI assistant will provide intelligent insights, 
                  predictive analytics, and automated recommendations to optimize your 
                  restaurant operations and ensure food safety compliance.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Smart Predictions</h4>
                    <p className="text-sm text-gray-600">
                      Predict expiration risks and optimize inventory rotation
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Compliance Insights</h4>
                    <p className="text-sm text-gray-600">
                      AI-powered analysis of safety patterns and recommendations
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Automated Reports</h4>
                    <p className="text-sm text-gray-600">
                      Generate intelligent summaries and actionable insights
                    </p>
                  </div>
                </div>
                <Badge className="mt-6 bg-blue-100 text-blue-800">
                  Available in Q2 2024
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
