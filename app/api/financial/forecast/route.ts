// ============================================
// PHASE 32F - Financial Forecasting AI
// ============================================

import { NextRequest } from "next/server";

// Lazy initialize OpenAI client
function getClient() {
  return getOpenAIClientSafe();
}
import { prisma } from "@/lib/prisma";
import { getOpenAIClientSafe } from "@/lib/ai/openai";
import { financialForecastingPrompt } from "@/core/prompts/financialForecastingPrompt";

// Client initialized lazily via getClient()

function successResponse(data: any, message: string = "Success", status: number = 200) {
  return Response.json({ success: true, data, message }, { status });
}

function errorResponse(message: string, status: number = 400) {
  return Response.json({ success: false, error: message }, { status });
}

// POST /api/financial/forecast
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      periodType = "MONTHLY",
      periods = 1, // Number of periods to forecast
      branchId,
      partnerId,
    } = body;

    // Get historical data (last 6-12 months)
    const monthsToLookBack = periodType === "MONTHLY" ? 12 : periodType === "WEEKLY" ? 24 : 8;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsToLookBack);

    // Get revenues
    const revenues = await prisma.revenue.findMany({
      where: {
        date: { gte: startDate },
        ...(branchId ? { branchId } : {}),
        ...(partnerId ? { partnerId } : {}),
      },
      orderBy: { date: "asc" },
    });

    // Get expenses
    const expenses = await prisma.expense.findMany({
      where: {
        date: { gte: startDate },
        status: "APPROVED",
        ...(branchId ? { branchId } : {}),
        ...(partnerId ? { partnerId } : {}),
      },
      orderBy: { date: "asc" },
    });

    // Get profits
    const profits = await prisma.profitCalculation.findMany({
      where: {
        periodStart: { gte: startDate },
        periodType,
        ...(branchId ? { branchId } : {}),
        ...(partnerId ? { partnerId } : {}),
      },
      orderBy: { periodStart: "asc" },
    });

    // Get bookings for trend analysis
    const bookings = await prisma.booking.findMany({
      where: {
        date: { gte: startDate },
        ...(branchId ? { branchId } : {}),
      },
      orderBy: { date: "asc" },
      take: 1000,
    });

    // Calculate trends
    const recentRevenue = revenues.slice(-3).reduce((sum, r) => sum + r.amount, 0);
    const olderRevenue = revenues.slice(-6, -3).reduce((sum, r) => sum + r.amount, 0);
    const revenueTrend = olderRevenue > 0 ? ((recentRevenue - olderRevenue) / olderRevenue) * 100 : 0;

    // Generate prompt
    const prompt = financialForecastingPrompt(
      {
        revenues,
        expenses,
        profits,
        bookings,
        trends: {
          revenueTrend,
        },
      },
      periodType
    );

    // Call OpenAI
    const completion = await getClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Bạn là AI chuyên dự đoán tài chính cho salon. Dự đoán chính xác dựa trên dữ liệu lịch sử và xu hướng. Trả về JSON hợp lệ.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 2000,
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const rawOutput = completion.choices[0]?.message?.content;
    if (!rawOutput) {
      return errorResponse("AI did not generate forecast", 500);
    }

    // Parse JSON
    let forecastData;
    try {
      const cleaned = rawOutput.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      forecastData = JSON.parse(cleaned);
    } catch (parseError: any) {
      console.error("Failed to parse forecast JSON:", parseError);
      return errorResponse("Failed to parse forecast response", 500);
    }

    // Calculate forecast period dates
    const forecastDate = new Date();
    const periodStart = new Date();
    periodStart.setMonth(periodStart.getMonth() + 1);
    periodStart.setDate(1);
    const periodEnd = new Date(periodStart);
    if (periodType === "MONTHLY") {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
      periodEnd.setDate(0); // Last day of month
    }

    // Save forecast
    const forecast = await prisma.financialForecast.create({
      data: {
        forecastDate: new Date(),
        periodStart,
        periodEnd,
        periodType,
        forecastRevenue: forecastData.forecastRevenue || null,
        forecastExpenses: forecastData.forecastExpenses || null,
        forecastProfit: forecastData.forecastProfit || null,
        forecastBreakdown: {
          revenueChangePercent: forecastData.revenueChangePercent || null,
          expenseChangePercent: forecastData.expenseChangePercent || null,
          profitChangePercent: forecastData.profitChangePercent || null,
        },
        confidence: forecastData.confidence || null,
        factors: forecastData.factors || null,
        assumptions: forecastData.assumptions || null,
        branchId: branchId || null,
        partnerId: partnerId || null,
        aiAnalysis: forecastData.aiAnalysis || null,
        recommendations: forecastData.recommendations || [],
      },
    });

    return successResponse(forecast);
  } catch (error: any) {
    console.error("Error generating forecast:", error);
    return errorResponse(error.message || "Failed to generate forecast", 500);
  }
}

// GET /api/financial/forecast
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get("branchId");
    const partnerId = searchParams.get("partnerId");
    const periodType = searchParams.get("periodType") || "MONTHLY";

    const where: any = { periodType };
    if (branchId) where.branchId = branchId;
    if (partnerId) where.partnerId = partnerId;

    const forecasts = await prisma.financialForecast.findMany({
      where,
      orderBy: { forecastDate: "desc" },
      take: 10,
    });

    return successResponse(forecasts);
  } catch (error: any) {
    console.error("Error fetching forecasts:", error);
    return errorResponse(error.message || "Failed to fetch forecasts", 500);
  }
}

