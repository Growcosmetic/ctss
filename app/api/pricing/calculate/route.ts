// ============================================
// PHASE 33A, 33B, 33C - Calculate Dynamic Price
// ============================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

function successResponse(data: any, message: string = "Success", status: number = 200) {
  return Response.json({ success: true, data, message }, { status });
}

function errorResponse(message: string, status: number = 400) {
  return Response.json({ success: false, error: message }, { status });
}

// POST /api/pricing/calculate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      serviceId,
      branchId,
      stylistId,
      date,
      timeSlot, // e.g., "14:00"
    } = body;

    if (!serviceId) {
      return errorResponse("Service ID is required", 400);
    }

    // Get service base price
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return errorResponse("Service not found", 404);
    }

    let basePrice = service.price || 0;

    // Get active pricing rules (ordered by priority)
    const now = new Date();
    const activeRules = await prisma.pricingRule.findMany({
      where: {
        isActive: true,
        AND: [
          {
            OR: [
              { serviceIds: { has: serviceId } },
              { serviceIds: { isEmpty: true } },
            ],
          },
          {
            OR: [
              { branchIds: branchId ? { has: branchId } : { isEmpty: true } },
              { branchIds: { isEmpty: true } },
            ],
          },
          {
            OR: [
              { stylistIds: stylistId ? { has: stylistId } : { isEmpty: true } },
              { stylistIds: { isEmpty: true } },
            ],
          },
          {
            OR: [
              { startDate: null },
              { startDate: { lte: now } },
            ],
          },
          {
            OR: [
              { endDate: null },
              { endDate: { gte: now } },
            ],
          },
        ],
      },
      orderBy: { priority: "desc" },
    });

    // Apply rules
    let adjustedPrice = basePrice;
    const appliedRules: string[] = [];
    let totalAdjustment = 0;
    let totalAdjustmentPercent = 0;

    const targetDate = date ? new Date(date) : new Date();
    const dayOfWeek = targetDate.getDay();
    const hour = timeSlot ? parseInt(timeSlot.split(':')[0]) : targetDate.getHours();

    for (const rule of activeRules) {
      const conditions = rule.conditions as any;

      // Check if rule applies
      let applies = true;

      // Check time-based conditions
      if (rule.ruleType === "TIME_BASED" && conditions.timeRange) {
        const [startHour, startMin] = conditions.timeRange[0].split(':').map(Number);
        const [endHour, endMin] = conditions.timeRange[1].split(':').map(Number);
        const currentHour = hour || targetDate.getHours();
        const currentMin = targetDate.getMinutes();

        const currentTime = currentHour * 60 + currentMin;
        const startTime = startHour * 60 + startMin;
        const endTime = endHour * 60 + endMin;

        if (currentTime < startTime || currentTime > endTime) {
          applies = false;
        }
      }

      // Check day of week
      if (conditions.daysOfWeek && !conditions.daysOfWeek.includes(dayOfWeek)) {
        applies = false;
      }

      // Check stylist level
      if (rule.ruleType === "STYLIST_LEVEL" && stylistId) {
        const stylist = await prisma.user.findUnique({
          where: { id: stylistId },
        });
        // This would check stylist level - simplified for now
      }

      if (!applies) continue;

      // Apply adjustment
      let adjustment = 0;
      if (rule.adjustmentType === "PERCENTAGE") {
        adjustment = adjustedPrice * (rule.adjustmentValue / 100);
        totalAdjustmentPercent += rule.adjustmentValue;
      } else {
        adjustment = rule.adjustmentValue;
      }

      if (rule.adjustmentDirection === "INCREASE") {
        adjustedPrice += adjustment;
        totalAdjustment += adjustment;
      } else {
        adjustedPrice -= adjustment;
        totalAdjustment -= adjustment;
      }

      appliedRules.push(rule.id);
    }

    // Ensure price doesn't go negative
    adjustedPrice = Math.max(adjustedPrice, basePrice * 0.5); // Min 50% of base

    // Get demand level (simplified - would call demand analysis)
    const demandLevel = "NORMAL"; // Would be calculated

    // Get traffic level (simplified)
    const trafficLevel = "NORMAL"; // Would be calculated

    // Create or update dynamic pricing record
    const dynamicPricing = await prisma.dynamicPricing.create({
      data: {
        serviceId,
        branchId: branchId || null,
        stylistId: stylistId || null,
        basePrice,
        adjustedPrice,
        adjustmentAmount: totalAdjustment,
        adjustmentPercent: totalAdjustmentPercent,
        appliedRules,
        timeSlot: timeSlot || null,
        dayOfWeek,
        demandLevel,
        trafficLevel,
        effectiveFrom: new Date(),
      },
    });

    // Record pricing history
    await prisma.pricingHistory.create({
      data: {
        serviceId,
        branchId: branchId || null,
        stylistId: stylistId || null,
        previousPrice: basePrice,
        newPrice: adjustedPrice,
        changeAmount: totalAdjustment,
        changePercent: totalAdjustmentPercent,
        appliedRules,
        demandLevel,
        trafficLevel,
        changedBy: "AUTO",
      },
    });

    return successResponse({
      ...dynamicPricing,
      breakdown: {
        basePrice,
        adjustments: appliedRules.length,
        finalPrice: adjustedPrice,
      },
    });
  } catch (error: any) {
    console.error("Error calculating dynamic price:", error);
    return errorResponse(error.message || "Failed to calculate price", 500);
  }
}

