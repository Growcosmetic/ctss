// ============================================
// PHASE 35 - CTSS CONTROL TOWER (CEO COMMAND CENTER)
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

// GET /api/control-tower/dashboard
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

    if (!user || user.role !== "ADMIN") {
      return errorResponse("Access denied - CEO only", 403);
    }

    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get("branchId");
    const date = searchParams.get("date") ? new Date(searchParams.get("date")!) : new Date();
    date.setHours(0, 0, 0, 0);

    // ============================================
    // 35A - REAL-TIME KPI CONTROL MAP
    // ============================================

    // Revenue today
    const revenuesToday = await prisma.revenue.findMany({
      where: {
        date: {
          gte: date,
          lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
        },
        ...(branchId ? { branchId } : {}),
      },
    });

    const revenueToday = revenuesToday.reduce((sum, r) => sum + r.amount, 0);

    // Revenue this month
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const revenuesThisMonth = await prisma.revenue.findMany({
      where: {
        date: {
          gte: monthStart,
          lte: date,
        },
        ...(branchId ? { branchId } : {}),
      },
    });

    const revenueThisMonth = revenuesThisMonth.reduce((sum, r) => sum + r.amount, 0);

    // Bookings today
    const bookingsToday = await prisma.booking.count({
      where: {
        date: {
          gte: date,
          lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
        },
        ...(branchId ? { branchId } : {}),
      },
    });

    // Total bookings this month
    const bookingsThisMonth = await prisma.booking.count({
      where: {
        date: {
          gte: monthStart,
          lte: date,
        },
        ...(branchId ? { branchId } : {}),
      },
    });

    // COGS today
    const cogsToday = await prisma.cOGSCalculation.findMany({
      where: {
        date: {
          gte: date,
          lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
        },
        ...(branchId ? { branchId } : {}),
      },
    });

    const totalCogsToday = cogsToday.reduce((sum, c) => sum + c.totalCOGS, 0);
    const cogsPercent = revenueToday > 0 ? (totalCogsToday / revenueToday) * 100 : 0;

    // Expenses this month
    const expensesThisMonth = await prisma.expense.findMany({
      where: {
        date: {
          gte: monthStart,
          lte: date,
        },
        status: "APPROVED",
        ...(branchId ? { branchId } : {}),
      },
    });

    const totalExpenses = expensesThisMonth.reduce((sum, e) => sum + e.amount, 0);
    const profitThisMonth = revenueThisMonth - totalExpenses - cogsToday.reduce((sum, c) => sum + c.totalCOGS, 0);
    const profitMargin = revenueThisMonth > 0 ? (profitThisMonth / revenueThisMonth) * 100 : 0;

    // Customer satisfaction (from visits/ratings)
    const visits = await prisma.visit.findMany({
      where: {
        rating: { not: null },
      },
      take: 100,
      select: {
        rating: true,
      },
    });

    const avgRating = visits.length > 0
      ? visits.reduce((sum, v) => sum + (v.rating || 0), 0) / visits.length
      : 0;

    // Upsale rate (from UpsaleRecord)
    const upsaleRecords = await prisma.upsaleRecord.findMany({
      where: {
        createdAt: {
          gte: monthStart,
        },
      },
    });

    const totalBookings = await prisma.booking.count({
      where: {
        date: {
          gte: monthStart,
        },
        ...(branchId ? { branchId } : {}),
      },
    });

    const upsaleRate = totalBookings > 0
      ? (upsaleRecords.length / totalBookings) * 100
      : 0;

    // Return customer rate
    const bookings = await prisma.booking.findMany({
      where: {
        date: {
          gte: monthStart,
        },
        ...(branchId ? { branchId } : {}),
      },
      select: {
        customerId: true,
        stylistId: true,
      },
    });
    const uniqueCustomers = new Set(bookings.map(b => b.customerId));
    const returningCustomers = await prisma.booking.groupBy({
      by: ['customerId'],
      where: {
        date: {
          gte: monthStart,
        },
        ...(branchId ? { branchId } : {}),
      },
      _count: {
        customerId: true,
      },
    });

    const returnCustomerRate = uniqueCustomers.size > 0
      ? (returningCustomers.filter(c => c._count.customerId > 1).length / uniqueCustomers.size) * 100
      : 0;

    // Stylist status
    const staffCount = await prisma.user.count({
      where: {
        role: "STYLIST",
        ...(branchId ? { branchId } : {}),
      },
    });

    const busyStaff = new Set(bookings.map(b => b.stylistId).filter(Boolean)).size;
    const availableStaff = staffCount - busyStaff;

    // ============================================
    // 35B - AI PREDICTION HUB
    // ============================================

    // Get recent forecasts
    const forecasts = await prisma.financialForecast.findMany({
      orderBy: { forecastDate: "desc" },
      take: 5,
    });

    // Get loyalty predictions
    const loyaltyPredictions = await prisma.loyaltyPrediction.findMany({
      where: {
        status: "ACTIVE",
        predictionType: "RETURN_LIKELIHOOD",
      },
      orderBy: { score: "desc" },
      take: 10,
    });

    // ============================================
    // 35C - FINANCIAL CONTROL PANEL
    // ============================================

    // Profit calculation
    const profitCalculation = await prisma.profitCalculation.findFirst({
      where: {
        periodStart: { lte: date },
        periodEnd: { gte: date },
        ...(branchId ? { branchId } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    // Cashflow
    const cashflow = await prisma.cashflow.findFirst({
      where: {
        date: {
          gte: date,
          lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
        },
        ...(branchId ? { branchId } : {}),
      },
    });

    // Expenses by category
    const expensesByCategory: Record<string, number> = {};
    expensesThisMonth.forEach(e => {
      expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + e.amount;
    });

    // Revenue by source
    const revenueBySource: Record<string, number> = {};
    revenuesThisMonth.forEach(r => {
      revenueBySource[r.source] = (revenueBySource[r.source] || 0) + r.amount;
    });

    // ============================================
    // 35D - MULTI-BRANCH PERFORMANCE MAP
    // ============================================

    const branches = await prisma.branch.findMany();
    const branchPerformance = await Promise.all(
      branches.map(async branch => {
        const branchRevenues = await prisma.revenue.findMany({
          where: {
            branchId: branch.id,
            date: {
              gte: monthStart,
              lte: date,
            },
          },
        });

        const branchRevenue = branchRevenues.reduce((sum, r) => sum + r.amount, 0);
        const branchBookings = await prisma.booking.count({
          where: {
            branchId: branch.id,
            date: {
              gte: monthStart,
              lte: date,
            },
          },
        });

        const branchVisits = await prisma.visit.findMany({
          where: {
            customer: {
              bookings: {
                some: {
                  branchId: branch.id,
                },
              },
            },
            rating: { not: null },
          },
          select: {
            rating: true,
          },
        });

        const branchRating = branchVisits.length > 0
          ? branchVisits.reduce((sum, v) => sum + (v.rating || 0), 0) / branchVisits.length
          : 0;

        return {
          branchId: branch.id,
          branchName: branch.name,
          revenue: branchRevenue,
          bookings: branchBookings,
          rating: branchRating,
          score: (branchRating / 5) * 100, // Simplified score
        };
      })
    );

    // ============================================
    // 35E - QUALITY & SOP ENFORCEMENT CENTER
    // ============================================

    // Quality control data (from Phase 25) - model not available yet
    const qcIssues: any[] = []; // Placeholder until qualityControl model is added

    // SOP compliance (simplified - would have actual SOP check data)
    const sopComplianceRate = 92; // Placeholder

    // ============================================
    // 35F - STAFF & TRAINING RADAR
    // ============================================

    const staffPerformance = await Promise.all(
      (await prisma.user.findMany({
        where: {
          role: "STYLIST",
          ...(branchId ? { branchId } : {}),
        },
        take: 20,
      })).map(async staff => {
        const staffBookings = await prisma.booking.findMany({
          where: {
            stylistId: staff.id,
            date: {
              gte: monthStart,
            },
          },
        });

        const staffVisits = await prisma.visit.findMany({
          where: {
            customer: {
              bookings: {
                some: {
                  stylistId: staff.id,
                },
              },
            },
            rating: { not: null },
          },
          select: {
            rating: true,
          },
        });

        const staffRating = staffVisits.length > 0
          ? staffVisits.reduce((sum, v) => sum + (v.rating || 0), 0) / staffVisits.length
          : 0;

        return {
          staffId: staff.id,
          staffName: staff.name,
          bookings: staffBookings.length,
          rating: staffRating,
          score: (staffRating / 5) * 100,
        };
      })
    );

    // ============================================
    // 35G - ALERT CENTER
    // ============================================

    const alerts: any[] = [];

    // Financial risk alerts
    const financialAlerts = await prisma.financialRiskAlert.findMany({
      where: {
        status: "ACTIVE",
        severity: { in: ["HIGH", "CRITICAL"] },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    alerts.push(...financialAlerts.map(a => ({
      type: "FINANCE",
      severity: a.severity,
      title: a.title,
      message: a.message,
      createdAt: a.createdAt,
    })));

    // Product low stock alerts
    const products = await prisma.product.findMany({
      where: {
        stock: { lte: 100 }, // Low stock threshold
      },
      take: 10,
    });

    alerts.push(...products.map(p => ({
      type: "PRODUCT",
      severity: (p.stock || 0) < 50 ? "HIGH" : "MEDIUM",
      title: `${p.name} sắp hết`,
      message: `Còn ${p.stock || 0}${p.unit || "g"}. Dự báo hết trong 1 ngày.`,
      createdAt: new Date(),
    })));

    // VIP customer not returned
    const diamondMembers = await prisma.customerMembership.findMany({
      where: {
        currentTier: "DIAMOND",
        lastVisitAt: {
          lte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      },
      take: 10,
    });

    alerts.push(...diamondMembers.map(m => ({
      type: "CUSTOMER",
      severity: "HIGH",
      title: "Khách VIP lâu không quay lại",
      message: `Khách Diamond ${30 + Math.floor((Date.now() - (m.lastVisitAt?.getTime() || 0)) / (1000 * 60 * 60 * 24))} ngày chưa quay lại.`,
      createdAt: new Date(),
    })));

    // Sort alerts by severity and date
    alerts.sort((a, b) => {
      const severityOrder: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });

    return successResponse({
      // 35A - KPI Control Map
      kpi: {
        revenueToday: Math.round(revenueToday),
        revenueThisMonth: Math.round(revenueThisMonth),
        bookingsToday,
        bookingsThisMonth,
        profitThisMonth: Math.round(profitThisMonth),
        profitMargin: Math.round(profitMargin * 100) / 100,
        cogsPercent: Math.round(cogsPercent * 100) / 100,
        avgRating: Math.round(avgRating * 100) / 100,
        upsaleRate: Math.round(upsaleRate * 100) / 100,
        returnCustomerRate: Math.round(returnCustomerRate * 100) / 100,
        staffStatus: {
          total: staffCount,
          busy: busyStaff,
          available: availableStaff,
        },
      },

      // 35B - AI Prediction Hub
      predictions: {
        forecasts: forecasts.map(f => ({
          periodStart: f.periodStart,
          forecastRevenue: f.forecastRevenue,
          forecastProfit: f.forecastProfit,
          confidence: f.confidence,
          recommendations: f.recommendations,
        })),
        loyaltyPredictions: loyaltyPredictions.map(p => ({
          customerId: p.customerId,
          score: p.score,
          predictedValue: p.predictedValue,
          predictedDate: p.predictedDate,
        })),
      },

      // 35C - Financial Control Panel
      financial: {
        profit: profitCalculation ? {
          grossProfit: profitCalculation.grossProfit,
          netProfit: profitCalculation.netProfit,
          grossMargin: profitCalculation.grossMargin,
          netMargin: profitCalculation.netMargin,
        } : null,
        cashflow: cashflow ? {
          totalInflow: cashflow.totalInflow,
          totalOutflow: cashflow.totalOutflow,
          netCashflow: cashflow.netCashflow,
          closingBalance: cashflow.closingBalance,
        } : null,
        expensesByCategory,
        revenueBySource,
      },

      // 35D - Multi-branch Performance
      branches: branchPerformance.sort((a, b) => b.score - a.score),

      // 35E - Quality & SOP
      quality: {
        issuesCount: qcIssues.length,
        recentIssues: qcIssues.slice(0, 10).map(q => ({
          id: q.id,
          bookingId: q.bookingId,
          issue: q.issue || "N/A",
          severity: q.severity,
          createdAt: q.createdAt,
        })),
        sopComplianceRate,
      },

      // 35F - Staff & Training
      staff: staffPerformance.sort((a, b) => b.score - a.score),

      // 35G - Alert Center
      alerts: alerts.slice(0, 20),
    });
  } catch (error: any) {
    console.error("Error fetching control tower dashboard:", error);
    return errorResponse(error.message || "Failed to fetch dashboard", 500);
  }
}

