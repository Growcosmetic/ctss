// ============================================
// Customer Behavior - AI Behavior Analysis
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { customerBehaviorAnalysisPrompt } from "@/core/prompts/customerBehaviorAnalysisPrompt";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { customerId } = await req.json();

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
        invoices: {
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
          orderBy: { date: "desc" },
        },
        experiences: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        touchpoints: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Calculate metrics
    const totalSpent = customer.totalSpent || 0;
    const visitCount = customer.totalVisits || customer.bookings.length;
    const averageSpend = visitCount > 0 ? totalSpent / visitCount : 0;

    // Find favorite service
    const serviceCounts: Record<string, number> = {};
    for (const invoice of customer.invoices) {
      for (const item of invoice.items) {
        const serviceName = item.service.name;
        serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1;
      }
    }

    const favoriteService = Object.entries(serviceCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0];

    // Calculate visit frequency (visits per month)
    let visitFrequency = 0;
    if (customer.bookings.length > 0) {
      const firstBooking = customer.bookings[customer.bookings.length - 1];
      const lastBooking = customer.bookings[0];
      const daysDiff =
        (lastBooking.date.getTime() - firstBooking.date.getTime()) /
        (1000 * 60 * 60 * 24);
      const monthsDiff = daysDiff / 30;
      visitFrequency = monthsDiff > 0 ? visitCount / monthsDiff : visitCount;
    }

    const lastVisit = customer.bookings[0]?.date || null;

    // AI Analysis
    const customerData = {
      totalSpent,
      visitCount,
      averageSpend,
      favoriteService,
      visitFrequency: Math.round(visitFrequency * 100) / 100,
      lastVisit: lastVisit?.toISOString().split("T")[0] || null,
      experiences: customer.experiences,
      touchpoints: customer.touchpoints,
    };

    const prompt = customerBehaviorAnalysisPrompt(customerData);

    let behaviorAnalysis;
    try {
      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Bạn là AI Customer Behavior Analyst chuyên nghiệp. Phân tích hành vi khách hàng, phân loại chính xác. Trả về JSON hợp lệ.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
        response_format: { type: "json_object" },
      });

      const rawOutput = completion.choices[0]?.message?.content;
      if (rawOutput) {
        behaviorAnalysis = JSON.parse(rawOutput);
      }
    } catch (aiError) {
      console.error("AI behavior analysis error:", aiError);
    }

    // Calculate lifetime value
    const lifetimeValue = totalSpent; // Simplified, can add referral value, etc.

    // Predict next visit
    let nextPredictedVisit: Date | null = null;
    if (lastVisit && visitFrequency > 0) {
      const daysUntilNext = 30 / visitFrequency;
      nextPredictedVisit = new Date(lastVisit);
      nextPredictedVisit.setDate(
        nextPredictedVisit.getDate() + Math.round(daysUntilNext)
      );
    }

    // Upsert behavior record
    const behavior = await prisma.customerBehavior.upsert({
      where: { customerId },
      create: {
        customerId,
        behaviorType: behaviorAnalysis?.behaviorType || "HIGH_VALUE",
        behaviorData: behaviorAnalysis || null,
        confidence: behaviorAnalysis?.confidence || 70,
        totalSpent,
        visitCount,
        averageSpend: Math.round(averageSpend * 100) / 100,
        favoriteService,
        visitFrequency: Math.round(visitFrequency * 100) / 100,
        lastVisit: lastVisit || null,
        nextPredictedVisit: behaviorAnalysis?.nextPredictedVisit
          ? new Date(behaviorAnalysis.nextPredictedVisit)
          : nextPredictedVisit,
        preferredStylist: customer.preferredStylist || null,
        lifetimeValue,
        predictedValue: lifetimeValue * 1.2, // Simple prediction
        aiAnalysis: behaviorAnalysis?.analysis || null,
        tags: behaviorAnalysis?.tags || [],
      },
      update: {
        behaviorType: behaviorAnalysis?.behaviorType || undefined,
        behaviorData: behaviorAnalysis || undefined,
        confidence: behaviorAnalysis?.confidence || undefined,
        totalSpent,
        visitCount,
        averageSpend: Math.round(averageSpend * 100) / 100,
        favoriteService,
        visitFrequency: Math.round(visitFrequency * 100) / 100,
        lastVisit: lastVisit || undefined,
        nextPredictedVisit: behaviorAnalysis?.nextPredictedVisit
          ? new Date(behaviorAnalysis.nextPredictedVisit)
          : nextPredictedVisit,
        preferredStylist: customer.preferredStylist || undefined,
        lifetimeValue,
        predictedValue: lifetimeValue * 1.2,
        aiAnalysis: behaviorAnalysis?.analysis || undefined,
        tags: behaviorAnalysis?.tags || undefined,
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
      behavior,
      analysis: behaviorAnalysis,
    });
  } catch (err: any) {
    console.error("Analyze behavior error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to analyze behavior",
      },
      { status: 500 }
    );
  }
}

// Get behavior for customer
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json(
        { error: "customerId is required" },
        { status: 400 }
      );
    }

    const behavior = await prisma.customerBehavior.findUnique({
      where: { customerId },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            totalSpent: true,
            totalVisits: true,
          },
        },
      },
    });

    if (!behavior) {
      return NextResponse.json({
        success: true,
        behavior: null,
        message: "Behavior not analyzed yet. Use POST to analyze.",
      });
    }

    return NextResponse.json({
      success: true,
      behavior,
    });
  } catch (err: any) {
    console.error("Get behavior error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get behavior",
      },
      { status: 500 }
    );
  }
}

