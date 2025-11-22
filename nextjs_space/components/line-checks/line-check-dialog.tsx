
'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Thermometer, FileText, Hash, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

interface LineCheckDialogProps {
  template: any
  open: boolean
  onClose: () => void
  onSubmit: () => void
}

export function LineCheckDialog({ template, open, onClose, onSubmit }: LineCheckDialogProps) {
  const [shift, setShift] = useState('morning')
  const [notes, setNotes] = useState('')
  const [responses, setResponses] = useState<Record<string, { value: string; notes?: string }>>({})
  const [submitting, setSubmitting] = useState(false)

  const updateResponse = (itemId: string, value: string, notes?: string) => {
    setResponses(prev => ({
      ...prev,
      [itemId]: { value, notes }
    }))
  }

  const handleSubmit = async () => {
    // Validate all required items are filled
    const requiredItems = template.items.filter((item: any) => item.isRequired)
    const missingItems = requiredItems.filter((item: any) => !responses[item.id]?.value)

    if (missingItems.length > 0) {
      toast.error(`Please complete all required items (${missingItems.length} remaining)`)
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/line-checks/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: template.id,
          shift,
          notes,
          responses: Object.entries(responses).map(([itemId, data]) => ({
            itemId,
            value: data.value,
            notes: data.notes,
          }))
        })
      })

      if (!response.ok) throw new Error('Failed to submit')

      toast.success('Line check submitted successfully!')
      onSubmit()
      onClose()
      
      // Reset form
      setResponses({})
      setNotes('')
      setShift('morning')
    } catch (error) {
      toast.error('Failed to submit line check')
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  const renderCheckInput = (item: any) => {
    const value = responses[item.id]?.value || ''

    switch (item.checkType) {
      case 'BOOLEAN':
        return (
          <RadioGroup 
            value={value} 
            onValueChange={(val) => updateResponse(item.id, val)}
          >
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pass" id={`${item.id}-pass`} />
                <Label htmlFor={`${item.id}-pass`} className="flex items-center gap-2 cursor-pointer">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Pass
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fail" id={`${item.id}-fail`} />
                <Label htmlFor={`${item.id}-fail`} className="flex items-center gap-2 cursor-pointer">
                  <XCircle className="w-4 h-4 text-red-600" />
                  Fail
                </Label>
              </div>
            </div>
          </RadioGroup>
        )

      case 'TEMPERATURE':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                step="0.1"
                placeholder="Temperature"
                value={value}
                onChange={(e) => updateResponse(item.id, e.target.value)}
                className="w-32"
              />
              <span className="text-sm text-gray-600">°F</span>
              {item.expectedValue && (
                <Badge variant="outline" className="text-xs">
                  Target: {item.expectedValue}°F
                  {item.toleranceRange && ` (${item.toleranceRange})`}
                </Badge>
              )}
            </div>
          </div>
        )

      case 'NUMBER':
        return (
          <Input
            type="number"
            placeholder="Enter value"
            value={value}
            onChange={(e) => updateResponse(item.id, e.target.value)}
            className="w-48"
          />
        )

      case 'TEXT':
        return (
          <Input
            type="text"
            placeholder="Enter text"
            value={value}
            onChange={(e) => updateResponse(item.id, e.target.value)}
            className="w-full"
          />
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{template.name}</DialogTitle>
          <DialogDescription>
            {template.description || 'Complete all required items to submit this line check'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Shift Selection */}
          <div className="space-y-2">
            <Label>Shift *</Label>
            <Select value={shift} onValueChange={setShift}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">Morning</SelectItem>
                <SelectItem value="afternoon">Afternoon</SelectItem>
                <SelectItem value="evening">Evening</SelectItem>
                <SelectItem value="overnight">Overnight</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Check Items */}
          <div className="space-y-6">
            <h3 className="font-semibold text-lg">Check Items</h3>
            {template.items?.map((item: any) => (
              <div key={item.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{item.title}</h4>
                      {item.isRequired && (
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {item.checkType}
                  </Badge>
                </div>

                {renderCheckInput(item)}

                {/* Item Notes */}
                <div className="pt-2">
                  <Label className="text-xs text-gray-600">Notes (optional)</Label>
                  <Textarea
                    placeholder="Add any observations or comments..."
                    value={responses[item.id]?.notes || ''}
                    onChange={(e) => updateResponse(item.id, responses[item.id]?.value || '', e.target.value)}
                    className="mt-1 h-20 resize-none"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Overall Notes */}
          <div className="space-y-2">
            <Label>Overall Notes</Label>
            <Textarea
              placeholder="Add any general comments about this line check..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-24 resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center gap-4 pt-4 border-t">
          <div className="text-sm text-gray-600">
            {Object.keys(responses).length} of {template.items?.filter((i: any) => i.isRequired).length || 0} required items completed
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Line Check'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
