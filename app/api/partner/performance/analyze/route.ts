import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { analyzePartnerPerformance } from "@/core/prompts/partnerPerformancePrompt";

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

// POST /api/partner/performance/analyze
export async function POST(request: NextRequest) {
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
      return errorResponse("Only HQ can analyze partner performance", 403);
    }

    const body = await request.json();
    const { partnerId, periodStart, periodEnd, periodType = "MONTHLY" } = body;

    if (!partnerId) {
      return errorResponse("Partner ID is required", 400);
    }

    const startDate = periodStart ? new Date(periodStart) : new Date();
    const endDate = periodEnd ? new Date(periodEnd) : new Date();

    // Get partner data
    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
      include: {
        branches: true,
      },
    });

    if (!partner) {
      return errorResponse("Partner not found", 404);
    }

    const branchIds = partner.branches.map(b => b.id);

    // Get invoices
    const invoices = await prisma.invoice.findMany({
      where: {
        branchId: {
          in: branchIds,
        },
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Calculate metrics
    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);

    // Get bookings
    const bookings = await prisma.booking.findMany({
      where: {
        branchId: {
          in: branchIds,
        },
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalBookings = bookings.length;
    const bookingIds = bookings.map(b => b.id);
    
    const totalCustomers = await prisma.customer.count({
      where: {
        bookings: {
          some: {
            branchId: {
              in: branchIds,
            },
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
      },
    });

    // Get quality scores

    const qualityScores = await prisma.qualityScore.findMany({
      where: {
        bookingId: {
          in: bookingIds.map(b => b.id),
        },
        capturedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const avgQualityScore = qualityScores.length > 0
      ? qualityScores.reduce((sum, score) => sum + score.overallScore, 0) / qualityScores.length
      : null;

    // Get error detections
    const errors = await prisma.errorDetection.findMany({
      where: {
        bookingId: {
          in: bookingIds.map(b => b.id),
        },
        detectedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const errorRate = totalBookings > 0 ? (errors.length / totalBookings) * 100 : 0;

    // Get product costs - using MixLog and ServiceProductUsage
    const mixLogs = bookingIds.length > 0 ? await prisma.mixLog.findMany({
      where: {
        serviceId: {
          in: bookingIds,
        },
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    }) : [];

    const serviceUsages = bookingIds.length > 0 ? await prisma.serviceProductUsage.findMany({
      where: {
        serviceId: {
          in: bookingIds,
        },
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        product: true,
      },
    }) : [];

    const mixLogCost = mixLogs.reduce((sum, log) => sum + (log.cost || 0), 0);
    const usageCost = serviceUsages.reduce((sum, usage) => {
      const productCost = (usage.quantity || 0) * (usage.product?.cost || 0);
      return sum + productCost;
    }, 0);
    
    const productCost = mixLogCost + usageCost;

    const performanceData = {
      partnerId: partner.id,
      salonName: partner.salonName,
      periodStart: startDate,
      periodEnd: endDate,
      periodType,
      revenue: totalRevenue,
      profit: totalRevenue - productCost, // Simplified
      totalCustomers,
      totalServices: totalBookings,
      avgQualityScore,
      errorRate,
      productCost,
    };

    // AI Analysis
    const aiAnalysis = await analyzePartnerPerformance(performanceData);

    // Create or update performance record
    const performance = await prisma.partnerPerformance.upsert({
      where: {
        partnerId_periodStart_periodType: {
          partnerId,
          periodStart: startDate,
          periodType,
        },
      },
      update: {
        revenue: totalRevenue,
        profit: totalRevenue - productCost,
        totalCustomers,
        totalServices: totalBookings,
        avgQualityScore: avgQualityScore || 0,
        errorRate,
        productCost,
        aiAnalysis: aiAnalysis.analysis,
        strengths: aiAnalysis.strengths || [],
        weaknesses: aiAnalysis.weaknesses || [],
        recommendations: aiAnalysis.recommendations || [],
      },
      create: {
        partnerId,
        periodStart: startDate,
        periodEnd: endDate,
        periodType,
        revenue: totalRevenue,
        profit: totalRevenue - productCost,
        totalCustomers,
        totalServices: totalBookings,
        avgQualityScore: avgQualityScore || 0,
        errorRate,
        productCost,
        aiAnalysis: aiAnalysis.analysis,
        strengths: aiAnalysis.strengths || [],
        weaknesses: aiAnalysis.weaknesses || [],
        recommendations: aiAnalysis.recommendations || [],
      },
    });

    return successResponse(performance);
  } catch (error: any) {
    console.error("Error analyzing partner performance:", error);
    return errorResponse(error.message || "Failed to analyze performance", 500);
  }
}

