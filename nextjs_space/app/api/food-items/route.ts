
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generateQRCode } from '@/lib/qr-generator'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const foodItems = await prisma.foodItem.findMany({
      where: {
        tenantId: session.user.tenantId,
        isActive: true
      },
      include: {
        createdBy: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(foodItems)
  } catch (error) {
    console.error('Get food items error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId || !session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      name,
      category,
      prepDate,
      expirationDate,
      quantity,
      unit,
      location,
      notes,
      qrCode
    } = await request.json()

    // Validate required fields
    if (!name || !prepDate || !expirationDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create food item
    const foodItem = await prisma.foodItem.create({
      data: {
        name,
        category: category || null,
        prepDate: new Date(prepDate),
        expirationDate: new Date(expirationDate),
        quantity: quantity ? parseFloat(quantity) : null,
        unit: unit || null,
        location: location || null,
        notes: notes || null,
        qrCode: qrCode || null,
        tenantId: session.user.tenantId,
        createdById: session.user.id
      },
      include: {
        createdBy: {
          select: { name: true }
        }
      }
    })

    return NextResponse.json(foodItem)
  } catch (error) {
    console.error('Create food item error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
