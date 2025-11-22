
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET all targets for the user's tenant
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { tenantId: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const targets = await prisma.pLTarget.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { year: 'desc' },
      include: {
        monthlyEntries: {
          orderBy: [{ year: 'desc' }, { month: 'desc' }]
        }
      }
    });

    return NextResponse.json(targets);
  } catch (error) {
    console.error('Error fetching P&L targets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch P&L targets' },
      { status: 500 }
    );
  }
}

// POST create or update target
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { tenantId: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      year,
      targetRevenue,
      foodCostPercent,
      laborCostPercent,
      overheadPercent,
      targetProfit,
      notes
    } = body;

    // Check if target already exists for this year
    const existingTarget = await prisma.pLTarget.findUnique({
      where: {
        tenantId_year: {
          tenantId: user.tenantId,
          year: parseInt(year)
        }
      }
    });

    let target;
    if (existingTarget) {
      // Update existing target
      target = await prisma.pLTarget.update({
        where: { id: existingTarget.id },
        data: {
          targetRevenue: parseFloat(targetRevenue),
          foodCostPercent: parseFloat(foodCostPercent),
          laborCostPercent: parseFloat(laborCostPercent),
          overheadPercent: parseFloat(overheadPercent),
          targetProfit: targetProfit ? parseFloat(targetProfit) : null,
          notes
        }
      });
    } else {
      // Create new target
      target = await prisma.pLTarget.create({
        data: {
          tenantId: user.tenantId,
          year: parseInt(year),
          targetRevenue: parseFloat(targetRevenue),
          foodCostPercent: parseFloat(foodCostPercent),
          laborCostPercent: parseFloat(laborCostPercent),
          overheadPercent: parseFloat(overheadPercent),
          targetProfit: targetProfit ? parseFloat(targetProfit) : null,
          notes
        }
      });
    }

    return NextResponse.json(target);
  } catch (error) {
    console.error('Error creating/updating P&L target:', error);
    return NextResponse.json(
      { error: 'Failed to create/update P&L target' },
      { status: 500 }
    );
  }
}
