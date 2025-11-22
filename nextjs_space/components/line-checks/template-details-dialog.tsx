
'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calendar, ClipboardCheck, Thermometer, FileText, Hash, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'

interface TemplateDetailsDialogProps {
  template: any
  open: boolean
  onClose: () => void
}

export function TemplateDetailsDialog({ template, open, onClose }: TemplateDetailsDialogProps) {
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">{template.name}</DialogTitle>
              <DialogDescription className="mt-1">
                {template.description || 'No description provided'}
              </DialogDescription>
            </div>
            <Badge variant="outline">
              {template.category || 'General'}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <ClipboardCheck className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Check Items</p>
                <p className="text-2xl font-bold text-blue-600">{template.items?.length || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <Calendar className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{template._count?.submissions || 0}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Check Items */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Check Items</h3>
            {template.items?.length > 0 ? (
              <div className="space-y-3">
                {template.items.map((item: any, index: number) => (
                  <div key={item.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                          <h4 className="font-medium">{item.title}</h4>
                          {item.isRequired && (
                            <Badge variant="destructive" className="text-xs">Required</Badge>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        )}
                      </div>
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

                    {/* Expected Value & Tolerance */}
                    {(item.expectedValue || item.toleranceRange) && (
                      <div className="flex gap-4 text-sm text-gray-600 pt-2 border-t">
                        {item.expectedValue && (
                          <div>
                            <span className="font-medium">Expected: </span>
                            {item.expectedValue}{item.checkType === 'TEMPERATURE' ? '°F' : ''}
                          </div>
                        )}
                        {item.toleranceRange && (
                          <div>
                            <span className="font-medium">Tolerance: </span>
                            {item.toleranceRange}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No check items defined</p>
            )}
          </div>

          {/* Metadata */}
          <Separator />
          <div className="text-sm text-gray-600 space-y-1">
            <p><span className="font-medium">Created:</span> {format(new Date(template.createdAt), 'MMM dd, yyyy h:mm a')}</p>
            <p><span className="font-medium">Last Updated:</span> {format(new Date(template.updatedAt), 'MMM dd, yyyy h:mm a')}</p>
            <p><span className="font-medium">Status:</span> {template.isActive ? 'Active' : 'Inactive'}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
