
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ClipboardCheck, 
  Plus, 
  Play,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Thermometer,
  FileText,
  Hash
} from 'lucide-react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import Link from 'next/link'
import { LineCheckDialog } from './line-check-dialog'
import { TemplateDetailsDialog } from './template-details-dialog'
import { useRouter } from 'next/navigation'

interface LineChecksContentProps {
  data: {
    templates: any[]
    recentSubmissions: any[]
  }
  session: any
}

export function LineChecksContent({ data, session }: LineChecksContentProps) {
  const { templates, recentSubmissions } = data
  const router = useRouter()
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [showCheckDialog, setShowCheckDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  const getCheckTypeIcon = (type: string) => {
    switch (type) {
      case 'TEMPERATURE':
        return <Thermometer className="w-4 h-4" />
      case 'TEXT':
        return <FileText className="w-4 h-4" />
      case 'NUMBER':
        return <Hash className="w-4 h-4" />
      case 'BOOLEAN':
      default:
        return <CheckCircle className="w-4 h-4" />
    }
  }

  const getCheckTypeColor = (type: string) => {
    switch (type) {
      case 'TEMPERATURE':
        return 'bg-red-100 text-red-800'
      case 'TEXT':
        return 'bg-blue-100 text-blue-800'
      case 'NUMBER':
        return 'bg-purple-100 text-purple-800'
      case 'BOOLEAN':
      default:
        return 'bg-green-100 text-green-800'
    }
  }

  const renderTemplate = (template: any) => (
    <motion.div
      key={template.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{template.name}</CardTitle>
              <CardDescription className="mt-1">
                {template.description || 'No description provided'}
              </CardDescription>
            </div>
            <Badge variant="outline">
              {template.category || 'General'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Template Stats */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-blue-600" />
                <span>{template.items?.length || 0} check items</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-green-600" />
                <span>{template._count?.submissions || 0} completed</span>
              </div>
            </div>

            {/* Check Items Preview */}
            {template.items?.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-700">Check Items:</h4>
                <div className="space-y-1">
                  {template.items.slice(0, 3).map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{item.title}</span>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getCheckTypeColor(item.checkType)}`}
                      >
                        <span className="flex items-center gap-1">
                          {getCheckTypeIcon(item.checkType)}
                          {item.checkType}
                        </span>
                      </Badge>
                    </div>
                  ))}
                  {template.items.length > 3 && (
                    <div className="text-xs text-gray-500 text-center py-1">
                      +{template.items.length - 3} more items
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button 
                className="flex-1"
                onClick={() => {
                  setSelectedTemplate(template)
                  setShowCheckDialog(true)
                }}
              >
                <Play className="w-4 h-4 mr-2" />
                Start Check
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setSelectedTemplate(template)
                  setShowDetailsDialog(true)
                }}
              >
                View Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  const renderRecentSubmission = (submission: any) => (
    <motion.div
      key={submission.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium">{submission.template?.name}</h4>
              <div className="text-sm text-gray-600 mt-1 space-y-1">
                <div className="flex items-center gap-2">
                  <User className="w-3 h-3" />
                  {submission.submittedBy?.name}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(submission.submittedAt), 'MMM dd, yyyy h:mm a')}
                </div>
                {submission.shift && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    {submission.shift}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant={submission.isComplete ? "default" : "secondary"}
                className={submission.isComplete ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
              >
                {submission.isComplete ? (
                  <><CheckCircle className="w-3 h-3 mr-1" />Complete</>
                ) : (
                  <><Clock className="w-3 h-3 mr-1" />Pending</>
                )}
              </Badge>
            </div>
          </div>

          {/* Response Summary */}
          {submission.responses?.length > 0 && (
            <div className="mt-3 pt-3 border-t">
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-3 h-3" />
                  {submission.responses.filter((r: any) => r.isPassing).length} Passed
                </div>
                <div className="flex items-center gap-1 text-red-600">
                  <XCircle className="w-3 h-3" />
                  {submission.responses.filter((r: any) => !r.isPassing).length} Failed
                </div>
              </div>
            </div>
          )}
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
            <ClipboardCheck className="w-8 h-8 text-blue-600" />
            Daily Line Checks
          </h1>
          <p className="text-gray-600 mt-1">
            Digital food safety compliance templates and tracking
          </p>
        </div>
        <div className="flex gap-4">
          {session.user?.role !== 'STAFF' && (
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Templates</p>
                <p className="text-2xl font-bold text-blue-600">{templates.length}</p>
              </div>
              <ClipboardCheck className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Checks</p>
                <p className="text-2xl font-bold text-green-600">
                  {recentSubmissions.filter(s => 
                    format(new Date(s.submittedAt), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                  ).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-purple-600">
                  {recentSubmissions.filter(s => {
                    const submissionDate = new Date(s.submittedAt)
                    const weekAgo = new Date()
                    weekAgo.setDate(weekAgo.getDate() - 7)
                    return submissionDate >= weekAgo
                  }).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Compliance</p>
                <p className="text-2xl font-bold text-green-600">98%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates">Check Templates</TabsTrigger>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          {templates.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {templates.map(renderTemplate)}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <ClipboardCheck className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Line Check Templates</h3>
                <p className="text-gray-600 mb-6">
                  Create your first line check template to start tracking daily food safety compliance.
                </p>
                {session.user?.role !== 'STAFF' && (
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Template
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recent" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Submissions</CardTitle>
              <CardDescription>
                Latest line check completions from your team
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentSubmissions.length > 0 ? (
                <div className="space-y-4">
                  {recentSubmissions.map(renderRecentSubmission)}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No Recent Activity</p>
                  <p>Complete your first line check to see activity here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      {selectedTemplate && (
        <>
          <LineCheckDialog
            template={selectedTemplate}
            open={showCheckDialog}
            onClose={() => {
              setShowCheckDialog(false)
              setSelectedTemplate(null)
            }}
            onSubmit={() => {
              router.refresh()
            }}
          />
          <TemplateDetailsDialog
            template={selectedTemplate}
            open={showDetailsDialog}
            onClose={() => {
              setShowDetailsDialog(false)
              setSelectedTemplate(null)
            }}
          />
        </>
      )}
    </div>
  )
}
