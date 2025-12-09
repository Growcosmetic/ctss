// ============================================
// Sales Upsale - AI Recommendation
// ============================================

import { NextResponse } from "next/server";

// Lazy initialize OpenAI client
function getClient() {
  return getOpenAIClientSafe();
}
import { prisma } from "@/lib/prisma";
import { upsaleRecommendationPrompt } from "@/core/prompts/upsaleRecommendationPrompt";
import { getOpenAIClientSafe } from "@/lib/ai/openai";

// Client initialized lazily via getClient()

export async function POST(req: Request) {
  try {
    const { customerId, serviceId, invoiceId } = await req.json();

    if (!customerId) {
      return NextResponse.json(
        { error: "customerId is required" },
        { status: 400 }
      );
    }

    // Get customer data
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        behavior: true,
        invoices: {
          take: 5,
          orderBy: { date: "desc" },
          include: {
            items: {
              include: {
                service: true,
              },
            },
          },
        },
        bookings: {
          take: 10,
          orderBy: { date: "desc" },
          include: {
            service: true,
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Get current service if provided
    let currentService = null;
    if (serviceId) {
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
      });
      currentService = service?.name || null;
    }

    // Prepare data for AI
    const serviceHistory = customer.bookings.map((b) => ({
      service: b.service?.name || "Unknown",
      date: b.date.toISOString().split("T")[0],
    }));

    const prompt = upsaleRecommendationPrompt({
      customerName: customer.name,
      customerType: customer.behavior?.behaviorType || "REGULAR",
      currentService: currentService || undefined,
      serviceHistory,
      totalSpent: customer.totalSpent || 0,
      averageSpend: customer.behavior?.averageSpend || 0,
      budgetRange: customer.behavior?.behaviorType === "BUDGET" ? "Thấp" : 
                   customer.behavior?.behaviorType === "VIP" ? "Cao" : "Trung bình",
    });

    // AI Recommendation
    let recommendation;
    try {
      const completion = await getClient().chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Bạn là AI Upsale Recommendation Specialist chuyên nghiệp. Đề xuất upsale phù hợp, tinh tế, không ép buộc. Trả về JSON hợp lệ.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1500,
        temperature: 0.7,
        response_format: { type: "json_object" },
      });

      const rawOutput = completion.choices[0]?.message?.content;
      if (rawOutput) {
        recommendation = JSON.parse(rawOutput);
      }
    } catch (aiError) {
      console.error("AI upsale recommendation error:", aiError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to generate recommendation",
        },
        { status: 500 }
      );
    }

    // Also check upsale matrix
    const matrixEntries = await prisma.upsaleMatrix.findMany({
      where: {
        isActive: true,
        OR: [
          { serviceId: serviceId || "none" },
          { serviceName: currentService || "none" },
        ],
      },
      orderBy: { priority: "desc" },
      take: 3,
    });

    // Merge AI recommendation with matrix
    let recommendedServices = recommendation?.recommendedServices || [];
    let recommendedProducts = recommendation?.recommendedProducts || [];

    for (const matrix of matrixEntries) {
      recommendedServices = [
        ...recommendedServices,
        ...(matrix.recommendedServices || []),
      ];
      recommendedProducts = [
        ...recommendedProducts,
        ...(matrix.recommendedProducts || []),
      ];
    }

    // Remove duplicates
    recommendedServices = [...new Set(recommendedServices)];
    recommendedProducts = [...new Set(recommendedProducts)];

    // Create recommendation record
    const upsaleRec = await prisma.upsaleRecommendation.create({
      data: {
        customerId,
        serviceId: serviceId || null,
        invoiceId: invoiceId || null,
        recommendedServices: recommendedServices,
        recommendedProducts: recommendedProducts,
        combo: recommendation?.combo || null,
        isAIGenerated: true,
        confidence: recommendation?.confidence || 70,
        reason: recommendation?.reason || null,
        script: recommendation?.script || null,
        tone: recommendation?.tone || null,
        status: "PENDING",
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      recommendation: {
        ...upsaleRec,
        aiData: recommendation,
        matrixSuggestions: matrixEntries,
      },
    });
  } catch (err: any) {
    console.error("Recommend upsale error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to recommend upsale",
      },
      { status: 500 }
    );
  }
}

// Get recommendations
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    const status = searchParams.get("status");

    const where: any = {};
    if (customerId) where.customerId = customerId;
    if (status) where.status = status;

    const recommendations = await prisma.upsaleRecommendation.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      recommendations,
      total: recommendations.length,
    });
  } catch (err: any) {
    console.error("Get recommendations error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get recommendations",
      },
      { status: 500 }
    );
  }
}

