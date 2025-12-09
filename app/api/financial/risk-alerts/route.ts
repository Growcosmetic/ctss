// ============================================
// PHASE 32G - Financial Risk Alerts
// ============================================

import { NextRequest } from "next/server";

// Lazy initialize OpenAI client
function getClient() {
  return getOpenAIClientSafe();
}
import { prisma } from "@/lib/prisma";
import { getOpenAIClientSafe } from "@/lib/ai/openai";
import { financialRiskDetectionPrompt } from "@/core/prompts/financialRiskDetectionPrompt";

// Client initialized lazily via getClient()

function successResponse(data: any, message: string = "Success", status: number = 200) {
  return Response.json({ success: true, data, message }, { status });
}

function errorResponse(message: string, status: number = 400) {
  return Response.json({ success: false, error: message }, { status });
}

// POST /api/financial/risk-alerts/check
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      periodStart,
      periodEnd,
      branchId,
      partnerId,
    } = body;

    if (!periodStart || !periodEnd) {
      return errorResponse("Period start and end dates are required", 400);
    }

    const startDate = new Date(periodStart);
    const endDate = new Date(periodEnd);

    // Get current period data
    const currentRevenues = await prisma.revenue.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
        ...(branchId ? { branchId } : {}),
        ...(partnerId ? { partnerId } : {}),
      },
    });

    const currentCOGS = await prisma.cOGSCalculation.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
        ...(branchId ? { branchId } : {}),
      },
    });

    const currentExpenses = await prisma.expense.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
        status: "APPROVED",
        ...(branchId ? { branchId } : {}),
        ...(partnerId ? { partnerId } : {}),
      },
    });

    // Get previous period data (same duration before)
    const periodDuration = endDate.getTime() - startDate.getTime();
    const previousStart = new Date(startDate.getTime() - periodDuration);
    const previousEnd = startDate;

    const previousRevenues = await prisma.revenue.findMany({
      where: {
        date: { gte: previousStart, lt: previousEnd },
        ...(branchId ? { branchId } : {}),
        ...(partnerId ? { partnerId } : {}),
      },
    });

    const previousCOGS = await prisma.cOGSCalculation.findMany({
      where: {
        date: { gte: previousStart, lt: previousEnd },
        ...(branchId ? { branchId } : {}),
      },
    });

    const previousExpenses = await prisma.expense.findMany({
      where: {
        date: { gte: previousStart, lt: previousEnd },
        status: "APPROVED",
        ...(branchId ? { branchId } : {}),
        ...(partnerId ? { partnerId } : {}),
      },
    });

    // Calculate totals
    const currentTotalRevenue = currentRevenues.reduce((sum, r) => sum + r.amount, 0);
    const currentTotalCOGS = currentCOGS.reduce((sum, c) => sum + c.totalCOGS, 0);
    const currentTotalExpenses = currentExpenses.reduce((sum, e) => sum + e.amount, 0);
    const currentProfit = currentTotalRevenue - currentTotalCOGS - currentTotalExpenses;
    const currentMargin = currentTotalRevenue > 0 ? (currentProfit / currentTotalRevenue) * 100 : 0;

    const previousTotalRevenue = previousRevenues.reduce((sum, r) => sum + r.amount, 0);
    const previousTotalCOGS = previousCOGS.reduce((sum, c) => sum + c.totalCOGS, 0);
    const previousTotalExpenses = previousExpenses.reduce((sum, e) => sum + e.amount, 0);
    const previousProfit = previousTotalRevenue - previousTotalCOGS - previousTotalExpenses;
    const previousMargin = previousTotalRevenue > 0 ? (previousProfit / previousTotalRevenue) * 100 : 0;

    // Prepare data for AI
    const currentData = {
      cogs: currentTotalCOGS,
      revenue: currentTotalRevenue,
      expenses: currentTotalExpenses,
      profit: currentProfit,
      margins: { grossMargin: currentMargin },
    };

    const previousData = {
      cogs: previousTotalCOGS,
      revenue: previousTotalRevenue,
      expenses: previousTotalExpenses,
      profit: previousProfit,
      margins: { grossMargin: previousMargin },
    };

    // Generate prompt
    const prompt = financialRiskDetectionPrompt(currentData, previousData);

    // Call OpenAI
    const completion = await getClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Bạn là AI chuyên phát hiện rủi ro tài chính. Phân tích chính xác và trả về JSON hợp lệ với array of risks.",
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
      return errorResponse("AI did not generate risk analysis", 500);
    }

    // Parse JSON
    let riskData;
    try {
      const cleaned = rawOutput.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      riskData = JSON.parse(cleaned);
    } catch (parseError: any) {
      console.error("Failed to parse risk JSON:", parseError);
      return errorResponse("Failed to parse risk response", 500);
    }

    // Create alerts
    const alerts = [];
    if (riskData.risks && Array.isArray(riskData.risks)) {
      for (const risk of riskData.risks) {
        const alert = await prisma.financialRiskAlert.create({
          data: {
            alertType: risk.alertType,
            severity: risk.severity || "MEDIUM",
            title: risk.title,
            message: risk.message,
            currentValue: risk.currentValue || null,
            previousValue: risk.previousValue || null,
            changePercent: risk.changePercent || null,
            branchId: branchId || null,
            partnerId: partnerId || null,
            periodStart: startDate,
            periodEnd: endDate,
            recommendations: risk.recommendations || [],
            status: "ACTIVE",
          },
        });
        alerts.push(alert);
      }
    }

    return successResponse({
      alerts,
      analysis: riskData.aiAnalysis || null,
    });
  } catch (error: any) {
    console.error("Error checking risks:", error);
    return errorResponse(error.message || "Failed to check risks", 500);
  }
}

// GET /api/financial/risk-alerts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "ACTIVE";
    const severity = searchParams.get("severity");
    const branchId = searchParams.get("branchId");

    const where: any = { status };
    if (severity) where.severity = severity;
    if (branchId) where.branchId = branchId;

    const alerts = await prisma.financialRiskAlert.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return successResponse(alerts);
  } catch (error: any) {
    console.error("Error fetching alerts:", error);
    return errorResponse(error.message || "Failed to fetch alerts", 500);
  }
}

