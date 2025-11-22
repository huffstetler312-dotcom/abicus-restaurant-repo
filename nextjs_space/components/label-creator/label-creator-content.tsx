
'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  QrCode, 
  Printer, 
  Download, 
  Calendar as CalendarIcon,
  Package,
  MapPin,
  Clock,
  Plus,
  Loader2,
  CheckCircle
} from 'lucide-react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const FOOD_CATEGORIES = [
  'Proteins',
  'Dairy',
  'Produce',
  'Pantry',
  'Frozen',
  'Beverages',
  'Condiments',
  'Prepared Foods',
  'Other'
]

const STORAGE_LOCATIONS = [
  'Walk-in Cooler',
  'Reach-in Cooler',
  'Freezer',
  'Dry Storage',
  'Prep Area',
  'Line Cooler',
  'Other'
]

const COMMON_UNITS = [
  'lbs',
  'oz',
  'cups',
  'gallons',
  'liters',
  'pieces',
  'packages',
  'cases',
  'portions'
]

export function LabelCreatorContent() {
  const { data: session } = useSession() || {}
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    prepDate: new Date(),
    expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    quantity: '',
    unit: '',
    location: '',
    notes: ''
  })
  const [qrCodePreview, setQrCodePreview] = useState('')
  const [labelPreview, setLabelPreview] = useState('')
  const [step, setStep] = useState(1)

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const generatePreview = async () => {
    if (!formData.name) {
      toast.error('Please enter a food item name')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/food-items/generate-label', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to generate preview')
      }

      const data = await response.json()
      setQrCodePreview(data.qrCode)
      setLabelPreview(data.labelPreview)
      setStep(2)
    } catch (error) {
      console.error('Preview generation error:', error)
      toast.error('Failed to generate label preview')
    } finally {
      setIsLoading(false)
    }
  }

  const saveAndPrint = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/food-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          qrCode: qrCodePreview
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save food item')
      }

      const data = await response.json()
      toast.success('Food item saved successfully!')
      
      // Print label
      if (labelPreview) {
        const printWindow = window.open('', '_blank')
        printWindow?.document.write(`
          <html>
            <head>
              <title>Food Label - ${formData.name}</title>
              <style>
                body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                .label { width: 50mm; height: 80mm; border: 1px solid #ccc; padding: 5mm; }
                @media print { 
                  body { margin: 0; padding: 0; } 
                  .label { border: none; }
                }
              </style>
            </head>
            <body>
              <div class="label">
                <img src="${labelPreview}" style="width: 100%; height: auto;" />
              </div>
              <script>window.print(); window.close();</script>
            </body>
          </html>
        `)
      }

      // Reset form
      setFormData({
        name: '',
        category: '',
        prepDate: new Date(),
        expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        quantity: '',
        unit: '',
        location: '',
        notes: ''
      })
      setQrCodePreview('')
      setLabelPreview('')
      setStep(1)
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save food item')
    } finally {
      setIsLoading(false)
    }
  }

  const downloadLabel = () => {
    if (!labelPreview) return
    
    const link = document.createElement('a')
    link.href = labelPreview
    link.download = `${formData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_label.png`
    link.click()
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <QrCode className="w-8 h-8 text-blue-600" />
          Smart Label Creator
        </h1>
        <p className="text-gray-600 mt-1">
          Generate professional food labels with QR codes for instant tracking
        </p>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className={cn("flex items-center", step >= 1 ? "text-blue-600" : "text-gray-400")}>
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200"
              )}>
                1
              </div>
              <span className="ml-2">Enter Details</span>
            </div>
            <div className={cn("w-8 h-1", step >= 2 ? "bg-blue-600" : "bg-gray-200")}></div>
            <div className={cn("flex items-center", step >= 2 ? "text-blue-600" : "text-gray-400")}>
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200"
              )}>
                2
              </div>
              <span className="ml-2">Preview & Print</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Food Item Details
            </CardTitle>
            <CardDescription>
              Enter the information for your food item
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Food Item Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Chicken Breast, Caesar Dressing"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {FOOD_CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Unit</Label>
                  <Select value={formData.unit} onValueChange={(value) => handleInputChange('unit', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_UNITS.map(unit => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-4">
              <div>
                <Label>Prep Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal mt-1">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.prepDate ? format(formData.prepDate, 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.prepDate}
                      onSelect={(date) => date && handleInputChange('prepDate', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>Expiration Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal mt-1">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.expirationDate ? format(formData.expirationDate, 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.expirationDate}
                      onSelect={(date) => date && handleInputChange('expirationDate', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="location">Storage Location</Label>
              <Select value={formData.location} onValueChange={(value) => handleInputChange('location', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {STORAGE_LOCATIONS.map(location => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Additional information, special handling instructions..."
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>

            {step === 1 && (
              <Button onClick={generatePreview} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Preview...
                  </>
                ) : (
                  <>
                    <QrCode className="mr-2 h-4 w-4" />
                    Generate Preview
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Preview Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Printer className="w-5 h-5" />
              Label Preview
            </CardTitle>
            <CardDescription>
              Preview your label before printing
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 2 && qrCodePreview ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Label Preview */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-white">
                  <div className="text-center space-y-4">
                    <div className="font-bold text-sm text-blue-900">Odin's Almanac</div>
                    <div className="font-bold text-lg">{formData.name}</div>
                    <div className="text-sm space-y-1">
                      <div>Prep: {format(formData.prepDate, 'MM/dd/yyyy')}</div>
                      <div className="font-bold">Expires: {format(formData.expirationDate, 'MM/dd/yyyy')}</div>
                      {formData.location && <div>Location: {formData.location}</div>}
                    </div>
                    <div className="flex justify-center">
                      <img src={qrCodePreview} alt="QR Code" className="w-24 h-24" />
                    </div>
                    <div className="text-xs text-gray-600">Scan for details</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button onClick={saveAndPrint} disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving & Printing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Save & Print Label
                      </>
                    )}
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={downloadLabel} className="flex-1">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                      Edit Details
                    </Button>
                  </div>
                </div>

                {/* QR Code Info */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">QR Code Features:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Instant access to item details</li>
                    <li>• Real-time expiration status</li>
                    <li>• Compliance tracking</li>
                    <li>• Integration with inventory system</li>
                  </ul>
                </div>
              </motion.div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <QrCode className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Label Preview</p>
                <p>Fill in the details and generate preview to see your label</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
