// ============================================
// PHASE 32E - Cashflow Tracking
// ============================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

function successResponse(data: any, message: string = "Success", status: number = 200) {
  return Response.json({ success: true, data, message }, { status });
}

function errorResponse(message: string, status: number = 400) {
  return Response.json({ success: false, error: message }, { status });
}

// POST /api/financial/cashflow/calculate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, branchId, partnerId } = body;

    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    // Get revenue for the day (inflow)
    const revenues = await prisma.revenue.findMany({
      where: {
        date: {
          gte: targetDate,
          lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000),
        },
        ...(branchId ? { branchId } : {}),
        ...(partnerId ? { partnerId } : {}),
      },
    });

    const totalInflow = revenues.reduce((sum, r) => sum + r.amount, 0);

    // Inflow breakdown by source
    const inflowBreakdown: Record<string, number> = {};
    revenues.forEach(r => {
      inflowBreakdown[r.source] = (inflowBreakdown[r.source] || 0) + r.amount;
    });

    // Inflow breakdown by payment method
    const cashAmount = revenues.filter(r => r.paymentMethod === "CASH").reduce((sum, r) => sum + r.amount, 0);
    const cardAmount = revenues.filter(r => r.paymentMethod === "CARD").reduce((sum, r) => sum + r.amount, 0);
    const transferAmount = revenues.filter(r => r.paymentMethod === "BANK_TRANSFER").reduce((sum, r) => sum + r.amount, 0);
    const eWalletAmount = revenues.filter(r => r.paymentMethod === "E_WALLET").reduce((sum, r) => sum + r.amount, 0);

    // Get expenses for the day (outflow)
    const expenses = await prisma.expense.findMany({
      where: {
        date: {
          gte: targetDate,
          lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000),
        },
        status: "APPROVED",
        ...(branchId ? { branchId } : {}),
        ...(partnerId ? { partnerId } : {}),
      },
    });

    const totalOutflow = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Outflow breakdown by category
    const outflowBreakdown: Record<string, number> = {};
    expenses.forEach(e => {
      outflowBreakdown[e.category] = (outflowBreakdown[e.category] || 0) + e.amount;
    });

    const netCashflow = totalInflow - totalOutflow;

    // Get previous day's closing balance
    const previousDay = new Date(targetDate);
    previousDay.setDate(previousDay.getDate() - 1);

    const previousCashflow = await prisma.cashflow.findFirst({
      where: {
        date: previousDay,
        ...(branchId ? { branchId } : {}),
        ...(partnerId ? { partnerId } : {}),
      },
      orderBy: { date: "desc" },
    });

    const openingBalance = previousCashflow?.closingBalance || 0;
    const closingBalance = openingBalance + netCashflow;

    // Create or update cashflow
    const existing = await prisma.cashflow.findFirst({
      where: {
        date: targetDate,
        ...(branchId ? { branchId: branchId || null } : {}),
        ...(partnerId ? { partnerId: partnerId || null } : {}),
      },
    });

    let cashflow;
    if (existing) {
      cashflow = await prisma.cashflow.update({
        where: { id: existing.id },
        data: {
          totalInflow,
          inflowBreakdown,
          totalOutflow,
          outflowBreakdown,
          netCashflow,
          openingBalance,
          closingBalance,
          cashAmount,
          cardAmount,
          transferAmount,
          eWalletAmount,
        },
      });
    } else {
      cashflow = await prisma.cashflow.create({
        data: {
          date: targetDate,
          branchId: branchId || null,
          partnerId: partnerId || null,
          totalInflow,
          inflowBreakdown,
          totalOutflow,
          outflowBreakdown,
          netCashflow,
          openingBalance,
          closingBalance,
          cashAmount,
          cardAmount,
          transferAmount,
          eWalletAmount,
        },
      });
    }

    return successResponse(cashflow);
  } catch (error: any) {
    console.error("Error calculating cashflow:", error);
    return errorResponse(error.message || "Failed to calculate cashflow", 500);
  }
}

// GET /api/financial/cashflow
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const branchId = searchParams.get("branchId");
    const partnerId = searchParams.get("partnerId");

    const where: any = {};
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    if (branchId) where.branchId = branchId;
    if (partnerId) where.partnerId = partnerId;

    const cashflows = await prisma.cashflow.findMany({
      where,
      orderBy: { date: "desc" },
    });

    const totalInflow = cashflows.reduce((sum, c) => sum + c.totalInflow, 0);
    const totalOutflow = cashflows.reduce((sum, c) => sum + c.totalOutflow, 0);
    const totalNetCashflow = totalInflow - totalOutflow;

    return successResponse({
      cashflows,
      summary: {
        totalInflow,
        totalOutflow,
        totalNetCashflow,
        count: cashflows.length,
      },
    });
  } catch (error: any) {
    console.error("Error fetching cashflow:", error);
    return errorResponse(error.message || "Failed to fetch cashflow", 500);
  }
}

