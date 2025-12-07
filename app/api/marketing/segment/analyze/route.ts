// ============================================
// Marketing Segment - AI Segmentation
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { customerSegmentationPrompt } from "@/core/prompts/customerSegmentationPrompt";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    // Get all customers with behavior data
    const customers = await prisma.customer.findMany({
      include: {
        behavior: true,
        invoices: {
          take: 10,
          orderBy: { date: "desc" },
        },
        bookings: {
          take: 10,
          orderBy: { date: "desc" },
        },
      },
      take: 500, // Limit for performance
    });

    // Prepare data for AI
    const customerData = customers.map((c) => ({
      id: c.id,
      name: c.name,
      totalSpent: c.totalSpent || 0,
      visitCount: c.totalVisits || c.bookings.length,
      averageSpend: c.totalSpent && c.totalVisits > 0
        ? c.totalSpent / c.totalVisits
        : 0,
      favoriteService: c.behavior?.favoriteService || null,
      visitFrequency: c.behavior?.visitFrequency || null,
      behaviorType: c.behavior?.behaviorType || null,
      lastVisit: c.bookings[0]?.date.toISOString().split("T")[0] || null,
    }));

    // AI Segmentation
    const prompt = customerSegmentationPrompt(customerData);

    let segmentation;
    try {
      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Bạn là AI Customer Segmentation Analyst chuyên nghiệp. Phân loại khách hàng chính xác vào 8 nhóm marketing. Trả về JSON hợp lệ.",
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
      if (rawOutput) {
        segmentation = JSON.parse(rawOutput);
      }
    } catch (aiError) {
      console.error("AI segmentation error:", aiError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to segment customers",
        },
        { status: 500 }
      );
    }

    // Create/update segments
    const segments = [];
    for (const [segmentName, segmentData] of Object.entries(
      segmentation.segments || {}
    )) {
      const segment = await prisma.marketingSegment.upsert({
        where: { name: segmentName },
        create: {
          name: segmentName,
          description: (segmentData as any).description || null,
          criteria: segmentData as any,
          customerCount: (segmentData as any).customers?.length || 0,
          averageLTV: (segmentData as any).averageLTV || 0,
          averageSpend: (segmentData as any).averageSpend || 0,
          isAIGenerated: true,
          aiAnalysis: segmentation.summary || null,
        },
        update: {
          description: (segmentData as any).description || null,
          criteria: segmentData as any,
          customerCount: (segmentData as any).customers?.length || 0,
          averageLTV: (segmentData as any).averageLTV || 0,
          averageSpend: (segmentData as any).averageSpend || 0,
          aiAnalysis: segmentation.summary || null,
        },
      });

      segments.push(segment);
    }

    return NextResponse.json({
      success: true,
      segments,
      summary: segmentation.summary,
      totalCustomers: customerData.length,
    });
  } catch (err: any) {
    console.error("Segment analyze error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to analyze segments",
      },
      { status: 500 }
    );
  }
}

// Get segments
export async function GET(req: Request) {
  try {
    const segments = await prisma.marketingSegment.findMany({
      orderBy: { customerCount: "desc" },
    });

    return NextResponse.json({
      success: true,
      segments,
      total: segments.length,
    });
  } catch (err: any) {
    console.error("Get segments error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get segments",
      },
      { status: 500 }
    );
  }
}

