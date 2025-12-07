// ============================================
// PHASE 32H - CEO Financial Dashboard
// ============================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

function successResponse(data: any, message: string = "Success", status: number = 200) {
  return Response.json({ success: true, data, message }, { status });
}

function errorResponse(message: string, status: number = 400) {
  return Response.json({ success: false, error: message }, { status });
}

function validateToken(token: string): string | null {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return payload.userId || null;
  } catch {
    return null;
  }
}

// GET /api/financial/dashboard
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return errorResponse("Not authenticated", 401);
    }

    const userId = validateToken(token);
    if (!userId) {
      return errorResponse("Invalid token", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
      return errorResponse("Access denied", 403);
    }

    const { searchParams } = new URL(request.url);
    const periodStart = searchParams.get("periodStart")
      ? new Date(searchParams.get("periodStart")!)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const periodEnd = searchParams.get("periodEnd")
      ? new Date(searchParams.get("periodEnd")!)
      : new Date();
    const branchId = searchParams.get("branchId") || undefined;
    const partnerId = searchParams.get("partnerId") || undefined;

    // Get revenue
    const revenues = await prisma.revenue.findMany({
      where: {
        date: { gte: periodStart, lte: periodEnd },
        ...(branchId ? { branchId } : {}),
        ...(partnerId ? { partnerId } : {}),
      },
    });

    const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);

    // Revenue breakdown by source
    const revenueBySource: Record<string, number> = {};
    revenues.forEach(r => {
      revenueBySource[r.source] = (revenueBySource[r.source] || 0) + r.amount;
    });

    // Get expenses
    const expenses = await prisma.expense.findMany({
      where: {
        date: { gte: periodStart, lte: periodEnd },
        status: "APPROVED",
        ...(branchId ? { branchId } : {}),
        ...(partnerId ? { partnerId } : {}),
      },
    });

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Expenses by category
    const expensesByCategory: Record<string, number> = {};
    expenses.forEach(e => {
      expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + e.amount;
    });

    // Get COGS
    const cogsRecords = await prisma.cOGSCalculation.findMany({
      where: {
        date: { gte: periodStart, lte: periodEnd },
        ...(branchId ? { branchId } : {}),
      },
    });

    const totalCOGS = cogsRecords.reduce((sum, c) => sum + c.totalCOGS, 0);

    // Calculate profits
    const grossProfit = totalRevenue - totalCOGS;
    const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    const operatingProfit = grossProfit - totalExpenses;
    const operatingMargin = totalRevenue > 0 ? (operatingProfit / totalRevenue) * 100 : 0;

    const netProfit = operatingProfit; // Simplified
    const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Get cashflow
    const cashflows = await prisma.cashflow.findMany({
      where: {
        date: { gte: periodStart, lte: periodEnd },
        ...(branchId ? { branchId } : {}),
        ...(partnerId ? { partnerId } : {}),
      },
      orderBy: { date: "asc" },
    });

    const totalInflow = cashflows.reduce((sum, c) => sum + c.totalInflow, 0);
    const totalOutflow = cashflows.reduce((sum, c) => sum + c.totalOutflow, 0);
    const netCashflow = totalInflow - totalOutflow;

    // Get forecasts
    const forecasts = await prisma.financialForecast.findMany({
      where: {
        periodStart: { gte: new Date() },
        ...(branchId ? { branchId } : {}),
        ...(partnerId ? { partnerId } : {}),
      },
      orderBy: { forecastDate: "desc" },
      take: 3,
    });

    // Get active alerts
    const alerts = await prisma.financialRiskAlert.findMany({
      where: {
        status: "ACTIVE",
        ...(branchId ? { branchId } : {}),
        ...(partnerId ? { partnerId } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Get top revenue-generating services
    const serviceRevenues = revenues.filter(r => r.serviceId);
    const serviceRevenueMap: Record<string, number> = {};
    serviceRevenues.forEach(r => {
      if (r.serviceId) {
        serviceRevenueMap[r.serviceId] = (serviceRevenueMap[r.serviceId] || 0) + r.amount;
      }
    });

    const topServices = Object.entries(serviceRevenueMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([serviceId, revenue]) => ({ serviceId, revenue }));

    // Revenue trend (daily for chart)
    const dailyRevenues: Record<string, number> = {};
    revenues.forEach(r => {
      const dateKey = r.date.toISOString().split('T')[0];
      dailyRevenues[dateKey] = (dailyRevenues[dateKey] || 0) + r.amount;
    });

    const revenueChart = Object.entries(dailyRevenues)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return successResponse({
      overview: {
        totalRevenue: Math.round(totalRevenue),
        totalExpenses: Math.round(totalExpenses),
        totalCOGS: Math.round(totalCOGS),
        grossProfit: Math.round(grossProfit),
        grossMargin: Math.round(grossMargin * 100) / 100,
        operatingProfit: Math.round(operatingProfit),
        operatingMargin: Math.round(operatingMargin * 100) / 100,
        netProfit: Math.round(netProfit),
        netMargin: Math.round(netMargin * 100) / 100,
      },
      cashflow: {
        totalInflow: Math.round(totalInflow),
        totalOutflow: Math.round(totalOutflow),
        netCashflow: Math.round(netCashflow),
      },
      breakdowns: {
        revenueBySource,
        expensesByCategory,
      },
      trends: {
        revenueChart,
      },
      topServices,
      forecasts: forecasts.map(f => ({
        periodStart: f.periodStart,
        forecastRevenue: f.forecastRevenue,
        forecastProfit: f.forecastProfit,
        confidence: f.confidence,
        recommendations: f.recommendations,
      })),
      alerts: alerts.map(a => ({
        id: a.id,
        alertType: a.alertType,
        severity: a.severity,
        title: a.title,
        message: a.message,
        recommendations: a.recommendations,
        createdAt: a.createdAt,
      })),
    });
  } catch (error: any) {
    console.error("Error fetching dashboard:", error);
    return errorResponse(error.message || "Failed to fetch dashboard", 500);
  }
}

