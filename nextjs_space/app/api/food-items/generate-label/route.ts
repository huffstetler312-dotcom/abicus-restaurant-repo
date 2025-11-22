
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { generateQRCode, generateFoodLabel } from '@/lib/qr-generator'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      name,
      prepDate,
      expirationDate,
      location,
      notes
    } = await request.json()

    if (!name || !prepDate || !expirationDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate QR code data
    const qrData = JSON.stringify({
      name,
      prepDate,
      expirationDate,
      location,
      tenant: session.user.tenantName,
      timestamp: new Date().toISOString()
    })

    // Generate QR code image
    const qrCode = await generateQRCode(qrData)

    // Generate label preview
    const labelData = {
      name,
      prepDate: new Date(prepDate),
      expirationDate: new Date(expirationDate),
      location: location || undefined,
      qrCode
    }

    const labelPreview = await generateFoodLabel(labelData)

    return NextResponse.json({
      qrCode,
      labelPreview,
      qrData
    })
  } catch (error) {
    console.error('Generate label error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
