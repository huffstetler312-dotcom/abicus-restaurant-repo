
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || !session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { templateId, shift, notes, responses } = await req.json()

    if (!templateId || !responses || !Array.isArray(responses)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify template exists and belongs to tenant
    const template = await prisma.lineCheckTemplate.findFirst({
      where: {
        id: templateId,
        tenantId: session.user.tenantId,
      },
      include: {
        items: true,
      }
    })

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Validate all required items are present
    const requiredItemIds = template.items
      .filter(item => item.isRequired)
      .map(item => item.id)
    
    const submittedItemIds = responses.map((r: any) => r.itemId)
    const missingRequired = requiredItemIds.filter(id => !submittedItemIds.includes(id))

    if (missingRequired.length > 0) {
      return NextResponse.json({ 
        error: 'Missing required check items',
        missingItemIds: missingRequired 
      }, { status: 400 })
    }

    // Determine if responses are passing based on check type and expected values
    const processedResponses = responses.map((response: any) => {
      const item = template.items.find(i => i.id === response.itemId)
      if (!item) return { ...response, isPassing: false }

      let isPassing = true

      // Boolean checks
      if (item.checkType === 'BOOLEAN') {
        isPassing = response.value === 'pass'
      }

      // Temperature checks
      if (item.checkType === 'TEMPERATURE' && item.expectedValue) {
        const value = parseFloat(response.value)
        const expected = parseFloat(item.expectedValue)
        
        // Parse tolerance range (e.g., "±2" or "2")
        let tolerance = 0
        if (item.toleranceRange) {
          const match = item.toleranceRange.match(/[\d.]+/)
          if (match) tolerance = parseFloat(match[0])
        }

        isPassing = Math.abs(value - expected) <= tolerance
      }

      return {
        ...response,
        isPassing,
      }
    })

    // Create submission with responses
    const submission = await prisma.lineCheckSubmission.create({
      data: {
        tenantId: session.user.tenantId,
        submittedById: session.user.id,
        templateId,
        shift: shift || null,
        notes: notes || null,
        isComplete: true,
        responses: {
          create: processedResponses.map((r: any) => ({
            itemId: r.itemId,
            value: r.value,
            notes: r.notes || null,
            isPassing: r.isPassing,
          }))
        }
      },
      include: {
        responses: {
          include: {
            item: true,
          }
        }
      }
    })

    // Check if any responses failed and create notification if needed
    const failedResponses = submission.responses.filter(r => !r.isPassing)
    
    if (failedResponses.length > 0) {
      // Create notification for failed checks
      await prisma.notification.create({
        data: {
          tenantId: session.user.tenantId,
          receiverId: session.user.id,
          title: 'Line Check Failed Items',
          message: `${failedResponses.length} item(s) failed in "${template.name}"`,
          type: 'WARNING',
          priority: 'HIGH',
          isRead: false,
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      submission,
      failedCount: failedResponses.length 
    })
  } catch (error) {
    console.error('Line check submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit line check' },
      { status: 500 }
    )
  }
}
