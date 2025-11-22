
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { tenantId: true, tenant: { select: { name: true } } }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const targetId = searchParams.get('targetId');
    const format = searchParams.get('format') || 'csv';

    if (!targetId) {
      return NextResponse.json({ error: 'Target ID required' }, { status: 400 });
    }

    const target = await prisma.pLTarget.findUnique({
      where: { id: targetId },
      include: {
        monthlyEntries: {
          orderBy: [{ year: 'asc' }, { month: 'asc' }]
        }
      }
    });

    if (!target || target.tenantId !== user.tenantId) {
      return NextResponse.json({ error: 'Target not found' }, { status: 404 });
    }

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    if (format === 'csv') {
      // Generate CSV content
      let csv = 'Restaurant P&L Statement\n';
      csv += `${user.tenant?.name || 'Restaurant'} - Fiscal Year ${target.year}\n\n`;
      
      csv += 'Month,Revenue,Food Cost,Food Cost %,Labor Cost,Labor Cost %,Overhead,Overhead %,';
      csv += 'Marketing,Utilities,Rent,Other Expenses,Total Expenses,Profit,Profit %\n';

      target.monthlyEntries.forEach((entry: {
        month: number;
        year: number;
        actualRevenue: number;
        actualFoodCost: number;
        actualLaborCost: number;
        actualOverhead: number;
        marketingCost: number;
        utilitiesCost: number;
        rentCost: number;
        otherExpenses: number;
        actualProfit: number;
      }) => {
        const monthName = monthNames[entry.month - 1];
        const foodCostPct = ((entry.actualFoodCost / entry.actualRevenue) * 100).toFixed(2);
        const laborCostPct = ((entry.actualLaborCost / entry.actualRevenue) * 100).toFixed(2);
        const overheadPct = ((entry.actualOverhead / entry.actualRevenue) * 100).toFixed(2);
        const totalExpenses = entry.actualFoodCost + entry.actualLaborCost + entry.actualOverhead +
          entry.marketingCost + entry.utilitiesCost + entry.rentCost + entry.otherExpenses;
        const profitPct = ((entry.actualProfit / entry.actualRevenue) * 100).toFixed(2);

        csv += `${monthName} ${entry.year},`;
        csv += `${entry.actualRevenue},`;
        csv += `${entry.actualFoodCost},${foodCostPct}%,`;
        csv += `${entry.actualLaborCost},${laborCostPct}%,`;
        csv += `${entry.actualOverhead},${overheadPct}%,`;
        csv += `${entry.marketingCost},${entry.utilitiesCost},${entry.rentCost},${entry.otherExpenses},`;
        csv += `${totalExpenses},${entry.actualProfit},${profitPct}%\n`;
      });

      // Add target benchmarks
      csv += '\n\nTarget Benchmarks\n';
      csv += `Monthly Revenue Target,${target.targetRevenue}\n`;
      csv += `Food Cost Target,${target.foodCostPercent}%\n`;
      csv += `Labor Cost Target,${target.laborCostPercent}%\n`;
      csv += `Overhead Target,${target.overheadPercent}%\n`;
      if (target.targetProfit) {
        csv += `Profit Target,${target.targetProfit}\n`;
      }

      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="P&L_${target.year}.csv"`
        }
      });
    }

    return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
  } catch (error) {
    console.error('Error exporting P&L:', error);
    return NextResponse.json(
      { error: 'Failed to export P&L' },
      { status: 500 }
    );
  }
}
