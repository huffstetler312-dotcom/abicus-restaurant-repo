
import QRCode from 'qrcode'
import jsPDF from 'jspdf'

export async function generateQRCode(data: string): Promise<string> {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256
    })
    return qrCodeDataUrl
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw new Error('Failed to generate QR code')
  }
}

export interface FoodLabel {
  name: string
  prepDate: Date
  expirationDate: Date
  location?: string
  qrCode: string
}

export async function generateFoodLabel(labelData: FoodLabel): Promise<string> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [50, 80] // Label size: 50mm x 80mm
  })

  // Add title
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Odin\'s Almanac', 25, 8, { align: 'center' })
  
  // Add food item name
  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'bold')
  const name = labelData.name.length > 20 ? labelData.name.substring(0, 20) + '...' : labelData.name
  pdf.text(name, 25, 16, { align: 'center' })

  // Add prep date
  pdf.setFontSize(8)
  pdf.setFont('helvetica', 'normal')
  pdf.text(`Prep: ${labelData.prepDate.toLocaleDateString()}`, 25, 22, { align: 'center' })
  
  // Add expiration date
  pdf.setFont('helvetica', 'bold')
  pdf.text(`Expires: ${labelData.expirationDate.toLocaleDateString()}`, 25, 27, { align: 'center' })
  
  // Add location if provided
  if (labelData.location) {
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Location: ${labelData.location}`, 25, 32, { align: 'center' })
  }

  // Add QR code
  try {
    const qrCodeImage = labelData.qrCode
    pdf.addImage(qrCodeImage, 'PNG', 10, 40, 30, 30)
  } catch (error) {
    console.error('Error adding QR code to PDF:', error)
  }

  // Add footer
  pdf.setFontSize(6)
  pdf.text('Scan for details', 25, 75, { align: 'center' })

  return pdf.output('datauristring')
}
