// ============================================
// PHASE 34F - AI Loyalty Prediction
// ============================================

import { NextRequest } from "next/server";

// Lazy initialize OpenAI client
function getClient() {
  return getOpenAIClientSafe();
}
import { prisma } from "@/lib/prisma";
import { getOpenAIClientSafe } from "@/lib/ai/openai";
import { loyaltyPredictionPrompt } from "@/core/prompts/loyaltyPredictionPrompt";

// Client initialized lazily via getClient()

function successResponse(data: any, message: string = "Success", status: number = 200) {
  return Response.json({ success: true, data, message }, { status });
}

function errorResponse(message: string, status: number = 400) {
  return Response.json({ success: false, error: message }, { status });
}

// POST /api/membership/loyalty/predict
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId } = body;

    if (!customerId) {
      return errorResponse("Customer ID is required", 400);
    }

    // Get membership
    const membership = await prisma.customerMembership.findUnique({
      where: { customerId },
    });

    if (!membership) {
      return errorResponse("Membership not found", 404);
    }

    // Get visit history (bookings)
    const bookings = await prisma.booking.findMany({
      where: { customerId },
      orderBy: { date: "desc" },
      take: 20,
    });

    // Get spending history (revenues)
    const revenues = await prisma.revenue.findMany({
      where: {
        customerId,
        source: "SERVICE",
      },
      orderBy: { date: "desc" },
      take: 20,
    });

    // Calculate behavior metrics
    const visitDates = bookings.map(b => b.date);
    const avgDaysBetweenVisits = visitDates.length > 1
      ? visitDates.slice(1).reduce((sum, date, i) => {
          const diff = (date.getTime() - visitDates[i + 1].getTime()) / (1000 * 60 * 60 * 24);
          return sum + diff;
        }, 0) / (visitDates.length - 1)
      : null;

    const lastVisit = visitDates[0] ? new Date(visitDates[0]) : null;
    const daysSinceLastVisit = lastVisit
      ? (Date.now() - lastVisit.getTime()) / (1000 * 60 * 60 * 24)
      : null;

    // Generate prompt
    const prompt = loyaltyPredictionPrompt({
      membership: {
        currentTier: membership.currentTier,
        totalSpending: membership.totalSpending,
        periodSpending: membership.periodSpending,
        totalVisits: membership.totalVisits,
        periodVisits: membership.periodVisits,
        currentPoints: membership.currentPoints,
        lastVisitAt: membership.lastVisitAt,
      },
      visitHistory: bookings.map(b => ({
        date: b.date,
        serviceId: b.serviceId,
        status: b.status,
      })),
      spendingHistory: revenues.map(r => ({
        date: r.date,
        amount: r.amount,
        source: r.source,
      })),
      behaviorData: {
        avgDaysBetweenVisits,
        daysSinceLastVisit,
        visitFrequency: bookings.length,
        avgSpending: revenues.length > 0
          ? revenues.reduce((sum, r) => sum + r.amount, 0) / revenues.length
          : 0,
      },
    });

    // Call OpenAI
    const completion = await getClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Bạn là AI chuyên dự đoán loyalty và retention khách hàng. Phân tích chính xác và trả về JSON hợp lệ.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 2500,
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const rawOutput = completion.choices[0]?.message?.content;
    if (!rawOutput) {
      return errorResponse("AI did not generate predictions", 500);
    }

    // Parse JSON
    let predictionData;
    try {
      const cleaned = rawOutput.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      predictionData = JSON.parse(cleaned);
    } catch (parseError: any) {
      console.error("Failed to parse prediction JSON:", parseError);
      return errorResponse("Failed to parse prediction response", 500);
    }

    // Save predictions
    const savedPredictions = [];
    if (predictionData.predictions && Array.isArray(predictionData.predictions)) {
      for (const pred of predictionData.predictions) {
        // Invalidate old predictions of same type
        await prisma.loyaltyPrediction.updateMany({
          where: {
            customerId,
            predictionType: pred.predictionType,
            status: "ACTIVE",
          },
          data: { status: "INVALIDATED" },
        });

        // Create new prediction
        const saved = await prisma.loyaltyPrediction.create({
          data: {
            customerId,
            predictionType: pred.predictionType,
            score: pred.score || 0,
            predictedValue: pred.predictedValue || null,
            confidence: pred.confidence || null,
            predictedDate: pred.predictedDate ? new Date(pred.predictedDate) : null,
            factors: pred.factors || null,
            aiAnalysis: pred.aiAnalysis || null,
            status: "ACTIVE",
          },
        });
        savedPredictions.push(saved);
      }
    }

    return successResponse({
      predictions: savedPredictions,
      recommendations: predictionData.recommendations || [],
    });
  } catch (error: any) {
    console.error("Error generating loyalty predictions:", error);
    return errorResponse(error.message || "Failed to generate predictions", 500);
  }
}

// GET /api/membership/loyalty/predict?customerId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return errorResponse("Customer ID is required", 400);
    }

    const predictions = await prisma.loyaltyPrediction.findMany({
      where: {
        customerId,
        status: "ACTIVE",
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(predictions);
  } catch (error: any) {
    console.error("Error fetching predictions:", error);
    return errorResponse(error.message || "Failed to fetch predictions", 500);
  }
}

