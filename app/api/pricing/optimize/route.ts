// ============================================
// PHASE 33F - Profit Optimization Model
// ============================================

import { NextRequest } from "next/server";

// Lazy initialize OpenAI client
function getClient() {
  return getOpenAIClientSafe();
}
import { prisma } from "@/lib/prisma";
import { getOpenAIClientSafe } from "@/lib/ai/openai";
import { profitOptimizationPrompt } from "@/core/prompts/profitOptimizationPrompt";

// Client initialized lazily via getClient()

function successResponse(data: any, message: string = "Success", status: number = 200) {
  return Response.json({ success: true, data, message }, { status });
}

function errorResponse(message: string, status: number = 400) {
  return Response.json({ success: false, error: message }, { status });
}

// POST /api/pricing/optimize
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      periodStart,
      periodEnd,
      periodType = "MONTHLY",
      serviceId,
      branchId,
    } = body;

    if (!periodStart || !periodEnd) {
      return errorResponse("Period start and end dates are required", 400);
    }

    const startDate = new Date(periodStart);
    const endDate = new Date(periodEnd);

    // Get current prices
    const services = await prisma.service.findMany({
      where: serviceId ? { id: serviceId } : {},
    });

    // Get revenue data
    const revenues = await prisma.revenue.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
        source: "SERVICE",
        ...(serviceId ? { serviceId } : {}),
        ...(branchId ? { branchId } : {}),
      },
    });

    // Get cost data
    const cogs = await prisma.cOGSCalculation.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
        ...(serviceId ? { serviceId } : {}),
        ...(branchId ? { branchId } : {}),
      },
    });

    // Get demand data
    const bookings = await prisma.booking.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
        ...(serviceId ? { serviceId } : {}),
        ...(branchId ? { branchId } : {}),
      },
    });

    // Prepare data for AI
    const currentPrices = services.map(s => ({
      serviceId: s.id,
      serviceName: s.name,
      basePrice: s.price || 0,
    }));

    const currentRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);
    const currentCost = cogs.reduce((sum, c) => sum + c.totalCOGS, 0);
    const currentProfit = currentRevenue - currentCost;

    // Generate prompt
    const prompt = profitOptimizationPrompt({
      currentPrices,
      demandData: {
        bookingsCount: bookings.length,
        avgBookingsPerService: bookings.length / services.length,
      },
      revenueData: {
        totalRevenue: currentRevenue,
        avgRevenuePerService: currentRevenue / services.length,
      },
      costData: {
        totalCost: currentCost,
        avgCostPerService: currentCost / services.length,
      },
    });

    // Call OpenAI
    const completion = await getClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Bạn là AI chuyên tối ưu giá để tăng lợi nhuận. Đảm bảo margin > 50%, không tăng quá 15%, không giảm quá 20%. Trả về JSON hợp lệ.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 2500,
      temperature: 0.4,
      response_format: { type: "json_object" },
    });

    const rawOutput = completion.choices[0]?.message?.content;
    if (!rawOutput) {
      return errorResponse("AI did not generate optimization", 500);
    }

    // Parse JSON
    let optimizationData;
    try {
      const cleaned = rawOutput.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      optimizationData = JSON.parse(cleaned);
    } catch (parseError: any) {
      console.error("Failed to parse optimization JSON:", parseError);
      return errorResponse("Failed to parse optimization response", 500);
    }

    // Calculate expected revenue increase
    const optimizedRevenue = currentRevenue * (1 + (optimizationData.expectedImpact?.revenueIncrease || 0) / 100);
    const revenueIncrease = optimizedRevenue - currentRevenue;
    const revenueIncreasePercent = (revenueIncrease / currentRevenue) * 100;

    // Create optimization record
    const optimization = await prisma.pricingOptimization.create({
      data: {
        periodStart: startDate,
        periodEnd: endDate,
        periodType,
        serviceId: serviceId || null,
        branchId: branchId || null,
        currentRevenue,
        optimizedRevenue,
        revenueIncrease,
        revenueIncreasePercent,
        currentAvgPrice: currentRevenue / (bookings.length || 1),
        optimizedAvgPrice: optimizedRevenue / (bookings.length || 1),
        optimizationFactors: optimizationData.optimizationFactors || null,
        recommendations: optimizationData.recommendations || null,
        expectedImpact: optimizationData.expectedImpact || null,
        aiAnalysis: optimizationData.aiAnalysis || null,
      },
    });

    return successResponse({
      ...optimization,
      optimizedPrices: optimizationData.optimizedPrices || [],
    });
  } catch (error: any) {
    console.error("Error optimizing pricing:", error);
    return errorResponse(error.message || "Failed to optimize pricing", 500);
  }
}

