// ============================================
// PHASE 33E - Smart Discount Engine
// ============================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { discountSuggestionPrompt } from "@/core/prompts/discountSuggestionPrompt";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

function successResponse(data: any, message: string = "Success", status: number = 200) {
  return Response.json({ success: true, data, message }, { status });
}

function errorResponse(message: string, status: number = 400) {
  return Response.json({ success: false, error: message }, { status });
}

// POST /api/pricing/discount/generate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { branchId } = body;

    // Get services with low demand
    const services = await prisma.service.findMany({
      take: 20,
    });

    // Get recent bookings to identify low-demand services
    const recentBookings = await prisma.booking.findMany({
      where: {
        date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        ...(branchId ? { branchId } : {}),
      },
      include: { service: true },
    });

    // Calculate demand per service
    const serviceDemand: Record<string, number> = {};
    recentBookings.forEach(b => {
      if (b.serviceId) {
        serviceDemand[b.serviceId] = (serviceDemand[b.serviceId] || 0) + 1;
      }
    });

    const lowDemandServices = services
      .filter(s => {
        const demand = serviceDemand[s.id] || 0;
        const avgDemand = Object.values(serviceDemand).reduce((a, b) => a + b, 0) / services.length;
        return demand < avgDemand * 0.7;
      })
      .map(s => ({
        serviceId: s.id,
        serviceName: s.name,
        demand: serviceDemand[s.id] || 0,
      }));

    // Get slow time slots
    const slowTimeSlots = await prisma.peakHourDetection.findMany({
      where: {
        date: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        trafficLevel: "LOW",
        ...(branchId ? { branchId } : {}),
      },
      take: 10,
    });

    // Generate prompt
    const prompt = discountSuggestionPrompt({
      lowDemandServices,
      slowTimeSlots: slowTimeSlots.map(s => ({
        timeSlot: s.timeSlot,
        dayOfWeek: s.dayOfWeek,
        trafficLevel: s.trafficLevel,
      })),
      revenueData: {},
    });

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Bạn là AI chuyên tạo chương trình khuyến mãi thông minh. Tạo discounts hợp lý, có lãi. Trả về JSON hợp lệ.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 2000,
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const rawOutput = completion.choices[0]?.message?.content;
    if (!rawOutput) {
      return errorResponse("AI did not generate discounts", 500);
    }

    // Parse JSON
    let discountData;
    try {
      const cleaned = rawOutput.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      discountData = JSON.parse(cleaned);
    } catch (parseError: any) {
      console.error("Failed to parse discount JSON:", parseError);
      return errorResponse("Failed to parse discount response", 500);
    }

    // Create discounts
    const createdDiscounts = [];
    if (discountData.discounts && Array.isArray(discountData.discounts)) {
      for (const discount of discountData.discounts) {
        const created = await prisma.smartDiscount.create({
          data: {
            discountType: discount.discountType,
            discountName: discount.discountName,
            discountValue: discount.discountValue,
            discountUnit: discount.discountUnit || "PERCENTAGE",
            minPurchase: discount.minPurchase || null,
            serviceIds: discount.serviceIds || [],
            branchIds: branchId ? [branchId] : [],
            customerSegments: discount.customerSegments || [],
            startTime: new Date(discount.startTime),
            endTime: new Date(discount.endTime),
            conditions: discount.conditions || null,
            maxUsage: discount.conditions?.maxUses || null,
            aiGenerated: true,
            aiReasoning: discount.aiReasoning || null,
            isActive: true,
          },
        });
        createdDiscounts.push(created);
      }
    }

    return successResponse({
      discounts: createdDiscounts,
      analysis: discountData.aiAnalysis || null,
    });
  } catch (error: any) {
    console.error("Error generating discounts:", error);
    return errorResponse(error.message || "Failed to generate discounts", 500);
  }
}

// GET /api/pricing/discount
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive");
    const branchId = searchParams.get("branchId");

    const where: any = {};
    if (isActive !== null) where.isActive = isActive === "true";
    if (branchId) {
      where.OR = [
        { branchIds: { has: branchId } },
        { branchIds: { isEmpty: true } },
      ];
    }

    const discounts = await prisma.smartDiscount.findMany({
      where,
      orderBy: { startTime: "desc" },
    });

    return successResponse(discounts);
  } catch (error: any) {
    console.error("Error fetching discounts:", error);
    return errorResponse(error.message || "Failed to fetch discounts", 500);
  }
}

