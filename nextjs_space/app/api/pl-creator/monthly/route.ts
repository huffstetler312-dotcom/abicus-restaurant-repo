
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// POST create or update monthly entry
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
      targetId,
      year,
      month,
      actualRevenue,
      actualFoodCost,
      actualLaborCost,
      actualOverhead,
      marketingCost = 0,
      utilitiesCost = 0,
      rentCost = 0,
      otherExpenses = 0,
      notes
    } = body;

    // Calculate actual profit
    const revenue = parseFloat(actualRevenue);
    const totalCosts = 
      parseFloat(actualFoodCost) +
      parseFloat(actualLaborCost) +
      parseFloat(actualOverhead) +
      parseFloat(marketingCost) +
      parseFloat(utilitiesCost) +
      parseFloat(rentCost) +
      parseFloat(otherExpenses);
    
    const actualProfit = revenue - totalCosts;

    // Check if entry already exists
    const existingEntry = await prisma.pLMonthlyEntry.findUnique({
      where: {
        tenantId_year_month: {
          tenantId: user.tenantId,
          year: parseInt(year),
          month: parseInt(month)
        }
      }
    });

    let entry;
    if (existingEntry) {
      // Update existing entry
      entry = await prisma.pLMonthlyEntry.update({
        where: { id: existingEntry.id },
        data: {
          actualRevenue: revenue,
          actualFoodCost: parseFloat(actualFoodCost),
          actualLaborCost: parseFloat(actualLaborCost),
          actualOverhead: parseFloat(actualOverhead),
          actualProfit,
          marketingCost: parseFloat(marketingCost),
          utilitiesCost: parseFloat(utilitiesCost),
          rentCost: parseFloat(rentCost),
          otherExpenses: parseFloat(otherExpenses),
          notes
        }
      });
    } else {
      // Create new entry
      entry = await prisma.pLMonthlyEntry.create({
        data: {
          tenantId: user.tenantId,
          targetId,
          year: parseInt(year),
          month: parseInt(month),
          actualRevenue: revenue,
          actualFoodCost: parseFloat(actualFoodCost),
          actualLaborCost: parseFloat(actualLaborCost),
          actualOverhead: parseFloat(actualOverhead),
          actualProfit,
          marketingCost: parseFloat(marketingCost),
          utilitiesCost: parseFloat(utilitiesCost),
          rentCost: parseFloat(rentCost),
          otherExpenses: parseFloat(otherExpenses),
          notes
        }
      });
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error('Error creating/updating monthly entry:', error);
    return NextResponse.json(
      { error: 'Failed to create/update monthly entry' },
      { status: 500 }
    );
  }
}
