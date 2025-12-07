// ============================================
// PHASE 32D - Profit Engine
// ============================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

function successResponse(data: any, message: string = "Success", status: number = 200) {
  return Response.json({ success: true, data, message }, { status });
}

function errorResponse(message: string, status: number = 400) {
  return Response.json({ success: false, error: message }, { status });
}

// POST /api/financial/profit/calculate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      periodStart,
      periodEnd,
      periodType = "MONTHLY",
      branchId,
      partnerId,
    } = body;

    if (!periodStart || !periodEnd) {
      return errorResponse("Period start and end dates are required", 400);
    }

    const startDate = new Date(periodStart);
    const endDate = new Date(periodEnd);

    // Get revenue
    const revenueRecords = await prisma.revenue.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        ...(branchId ? { branchId } : {}),
        ...(partnerId ? { partnerId } : {}),
      },
    });

    const totalRevenue = revenueRecords.reduce((sum, r) => sum + r.amount, 0);

    // Get COGS
    const cogsRecords = await prisma.cOGSCalculation.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        ...(branchId ? { branchId } : {}),
      },
    });

    const totalCOGS = cogsRecords.reduce((sum, c) => sum + c.totalCOGS, 0);

    // Get operating expenses
    const expenseRecords = await prisma.expense.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: "APPROVED",
        ...(branchId ? { branchId } : {}),
        ...(partnerId ? { partnerId } : {}),
      },
    });

    const operatingExpenses = expenseRecords.reduce((sum, e) => sum + e.amount, 0);

    // Calculate profits
    const grossProfit = totalRevenue - totalCOGS;
    const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    const operatingProfit = grossProfit - operatingExpenses;
    const operatingMargin = totalRevenue > 0 ? (operatingProfit / totalRevenue) * 100 : 0;

    // Net profit (simplified - would subtract taxes, depreciation in production)
    const netProfit = operatingProfit; // Simplified
    const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Expense breakdown
    const expenseBreakdown: Record<string, number> = {};
    expenseRecords.forEach(e => {
      expenseBreakdown[e.category] = (expenseBreakdown[e.category] || 0) + e.amount;
    });

    // Revenue breakdown
    const revenueBreakdown: Record<string, number> = {};
    revenueRecords.forEach(r => {
      revenueBreakdown[r.source] = (revenueBreakdown[r.source] || 0) + r.amount;
    });

    // Check if calculation exists
    const existing = await prisma.profitCalculation.findFirst({
      where: {
        periodStart: startDate,
        periodType,
        branchId: branchId || null,
        partnerId: partnerId || null,
      },
    });

    let profit;
    if (existing) {
      profit = await prisma.profitCalculation.update({
        where: { id: existing.id },
      update: {
        periodEnd: endDate,
        totalRevenue,
        totalCOGS,
        operatingExpenses,
        grossProfit,
        grossMargin,
        operatingProfit,
        operatingMargin,
        netProfit,
        netMargin,
        expenseBreakdown,
        revenueBreakdown,
      },
      create: {
        periodStart: startDate,
        periodEnd: endDate,
        periodType,
        branchId: branchId || null,
        partnerId: partnerId || null,
        totalRevenue,
        totalCOGS,
        operatingExpenses,
        grossProfit,
        grossMargin,
        operatingProfit,
        operatingMargin,
        netProfit,
        netMargin,
        expenseBreakdown,
        revenueBreakdown,
      },
      });
    } else {
      profit = await prisma.profitCalculation.create({
        data: {
          periodStart: startDate,
          periodEnd: endDate,
          periodType,
          branchId: branchId || null,
          partnerId: partnerId || null,
          totalRevenue,
          totalCOGS,
          operatingExpenses,
          grossProfit,
          grossMargin,
          operatingProfit,
          operatingMargin,
          netProfit,
          netMargin,
          expenseBreakdown,
          revenueBreakdown,
        },
      });
    }

    return successResponse(profit);
  } catch (error: any) {
    console.error("Error calculating profit:", error);
    return errorResponse(error.message || "Failed to calculate profit", 500);
  }
}

// GET /api/financial/profit
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const periodStart = searchParams.get("periodStart");
    const periodEnd = searchParams.get("periodEnd");
    const periodType = searchParams.get("periodType") || "MONTHLY";
    const branchId = searchParams.get("branchId");

    const where: any = {};
    if (periodStart) where.periodStart = { gte: new Date(periodStart) };
    if (periodEnd) where.periodEnd = { lte: new Date(periodEnd) };
    if (periodType) where.periodType = periodType;
    if (branchId) where.branchId = branchId;

    const profits = await prisma.profitCalculation.findMany({
      where,
      orderBy: { periodStart: "desc" },
    });

    return successResponse(profits);
  } catch (error: any) {
    console.error("Error fetching profits:", error);
    return errorResponse(error.message || "Failed to fetch profits", 500);
  }
}

