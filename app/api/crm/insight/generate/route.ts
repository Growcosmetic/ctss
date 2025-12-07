// ============================================
// CRM Insight - Generate Customer Insight
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { customerInsightPrompt } from "@/core/prompts/customerInsightPrompt";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { customerId, forceRefresh = false } = await req.json();

    if (!customerId) {
      return NextResponse.json(
        { error: "customerId is required" },
        { status: 400 }
      );
    }

    // Check if insight exists and is recent (within 7 days)
    if (!forceRefresh) {
      const existingInsight = await prisma.customerInsight.findFirst({
        where: { customerId },
        orderBy: { createdAt: "desc" },
      });

      if (existingInsight) {
        const daysSince = Math.floor(
          (Date.now() - existingInsight.createdAt.getTime()) /
            (1000 * 60 * 60 * 24)
        );
        if (daysSince < 7) {
          return NextResponse.json({
            success: true,
            insight: existingInsight,
            cached: true,
          });
        }
      }
    }

    // Get customer data
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        name: true,
        phone: true,
        totalVisits: true,
        totalSpent: true,
        riskLevel: true,
        preferredStylist: true,
        createdAt: true,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Get visits
    const visits = await prisma.visit.findMany({
      where: { customerId },
      orderBy: { date: "desc" },
      take: 20,
    });

    // Get tags
    const tags = await prisma.customerTag.findMany({
      where: { customerId },
    });

    // Generate AI insight
    const prompt = customerInsightPrompt(customer, visits, tags);

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Bạn là AI CRM Analyst chuyên nghiệp. Phân tích chính xác, đưa ra insights thực tế. Trả về JSON hợp lệ, đầy đủ các trường.",
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
      throw new Error("AI did not return insight");
    }

    // Parse JSON
    let insightData;
    try {
      insightData = JSON.parse(rawOutput);
    } catch (parseError) {
      const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        insightData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse AI response as JSON");
      }
    }

    // Validate required fields
    if (
      !insightData.churnRisk ||
      !insightData.revisitWindow ||
      !insightData.nextService ||
      !insightData.promotion ||
      !insightData.summary ||
      !insightData.actionSteps
    ) {
      throw new Error("AI response missing required fields");
    }

    // Delete old insights (keep only latest)
    await prisma.customerInsight.deleteMany({
      where: { customerId },
    });

    // Save new insight
    const saved = await prisma.customerInsight.create({
      data: {
        customerId,
        churnRisk: insightData.churnRisk,
        revisitWindow: insightData.revisitWindow,
        nextService: insightData.nextService,
        promotion: insightData.promotion,
        summary: insightData.summary,
        actionSteps: insightData.actionSteps || [],
        predictions: insightData.predictions || null,
      },
    });

    // Auto-create reminders based on insight (Phase 17D integration)
    try {
      if (insightData.churnRisk === "HIGH") {
        // Create urgent reminder
        await prisma.reminder.create({
          data: {
            customerId,
            type: "overdue",
            sendAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
            channel: "zalo",
            message: `Dạ em chào chị ${customer.name}! Em nhớ chị lắm. ${insightData.promotion} Chị muốn em giữ lịch đẹp cho chị không ạ? ❤️`,
          },
        });
      }

      // If actionSteps includes reminder-related actions
      const reminderActions = insightData.actionSteps.filter((step: any) =>
        step.action?.toLowerCase().includes("nhắc") ||
        step.action?.toLowerCase().includes("reminder")
      );
      if (reminderActions.length > 0 && visits.length > 0) {
        const lastVisit = visits[0];
        const daysSince = Math.floor(
          (Date.now() - new Date(lastVisit.date).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        if (daysSince >= 40 && daysSince <= 60) {
          await prisma.reminder.create({
            data: {
              customerId,
              type: "rebook_curl",
              sendAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
              channel: "zalo",
              message: `Dạ em chào chị ${customer.name}! ${insightData.nextService} - ${insightData.promotion} Chị muốn em giữ lịch không ạ? ❤️`,
            },
          });
        }
      }
    } catch (reminderError) {
      console.warn("Failed to auto-create reminders from insight:", reminderError);
      // Non-critical, continue
    }

    // Update customer riskLevel if AI suggests different
    if (insightData.churnRisk && insightData.churnRisk !== customer.riskLevel) {
      await prisma.customer.update({
        where: { id: customerId },
        data: { riskLevel: insightData.churnRisk },
      });
    }

    return NextResponse.json({
      success: true,
      insight: saved,
      cached: false,
    });
  } catch (err: any) {
    console.error("Generate insight error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to generate insight",
      },
      { status: 500 }
    );
  }
}

