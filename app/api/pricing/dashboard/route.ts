// ============================================
// PHASE 33G - Pricing Dashboard
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

// GET /api/pricing/dashboard
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
    const branchId = searchParams.get("branchId");

    // Get active pricing rules
    const activeRules = await prisma.pricingRule.count({
      where: { isActive: true },
    });

    // Get services with pricing
    const services = await prisma.service.findMany({
      take: 50,
    });

    // Get recent dynamic pricing
    const recentPricing = await prisma.dynamicPricing.findMany({
      where: branchId ? { branchId } : {},
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        // Would need to include service relation if exists
      },
    });

    // Get peak hour patterns
    const peakHours = await prisma.peakHourDetection.findMany({
      where: {
        date: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        ...(branchId ? { branchId } : {}),
      },
      orderBy: { peakScore: "desc" },
      take: 10,
    });

    // Get active discounts
    const activeDiscounts = await prisma.smartDiscount.findMany({
      where: {
        isActive: true,
        startTime: { lte: new Date() },
        endTime: { gte: new Date() },
        ...(branchId ? { branchIds: { has: branchId } } : {}),
      },
    });

    // Get pricing history (recent changes)
    const pricingHistory = await prisma.pricingHistory.findMany({
      orderBy: { changedAt: "desc" },
      take: 20,
    });

    // Get latest optimization
    const latestOptimization = await prisma.pricingOptimization.findFirst({
      orderBy: { createdAt: "desc" },
    });

    // Calculate price ranges by service
    const servicePricing = services.map(service => {
      const servicePricings = recentPricing.filter(p => p.serviceId === service.id);
      const basePrice = service.price || 0;
      const minPrice = servicePricings.length > 0
        ? Math.min(...servicePricings.map(p => p.adjustedPrice))
        : basePrice;
      const maxPrice = servicePricings.length > 0
        ? Math.max(...servicePricings.map(p => p.adjustedPrice))
        : basePrice;

      return {
        serviceId: service.id,
        serviceName: service.name,
        basePrice,
        minPrice,
        maxPrice,
        priceRange: maxPrice - minPrice,
      };
    });

    // Peak vs Off-peak analysis
    const peakData = peakHours.filter(p => p.trafficLevel === "HIGH" || p.trafficLevel === "VERY_HIGH");
    const offPeakData = peakHours.filter(p => p.trafficLevel === "LOW");

    return successResponse({
      overview: {
        activeRules,
        activeDiscounts: activeDiscounts.length,
        servicesCount: services.length,
        latestOptimization: latestOptimization ? {
          revenueIncrease: latestOptimization.revenueIncrease,
          revenueIncreasePercent: latestOptimization.revenueIncreasePercent,
        } : null,
      },
      services: servicePricing,
      peakHours: peakData.map(p => ({
        timeSlot: p.timeSlot,
        dayOfWeek: p.dayOfWeek,
        trafficLevel: p.trafficLevel,
        peakScore: p.peakScore,
      })),
      activeDiscounts: activeDiscounts.map(d => ({
        id: d.id,
        discountName: d.discountName,
        discountType: d.discountType,
        discountValue: d.discountValue,
        discountUnit: d.discountUnit,
        startTime: d.startTime,
        endTime: d.endTime,
      })),
      pricingHistory: pricingHistory.map(h => ({
        serviceId: h.serviceId,
        previousPrice: h.previousPrice,
        newPrice: h.newPrice,
        changePercent: h.changePercent,
        changedAt: h.changedAt,
      })),
      peakVsOffPeak: {
        peak: {
          count: peakData.length,
          avgPeakScore: peakData.length > 0
            ? peakData.reduce((sum, p) => sum + p.peakScore, 0) / peakData.length
            : 0,
        },
        offPeak: {
          count: offPeakData.length,
          avgPeakScore: offPeakData.length > 0
            ? offPeakData.reduce((sum, p) => sum + p.peakScore, 0) / offPeakData.length
            : 0,
        },
      },
    });
  } catch (error: any) {
    console.error("Error fetching pricing dashboard:", error);
    return errorResponse(error.message || "Failed to fetch dashboard", 500);
  }
}

