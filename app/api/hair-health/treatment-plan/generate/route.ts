// ============================================
// Hair Health - AI Treatment Plan Generator
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { treatmentPlanPrompt } from "@/core/prompts/treatmentPlanPrompt";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const {
      customerId,
      scanId,
      damageAssessmentId,
      porosityAnalysisId,
      chemicalRiskId,
      scalpAnalysisId,
      planType,
    } = await req.json();

    if (!customerId) {
      return NextResponse.json(
        { error: "customerId is required" },
        { status: 400 }
      );
    }

    // Get all analysis data
    let scan = null;
    let damageAssessment = null;
    let porosityAnalysis = null;
    let chemicalRisk = null;
    let scalpAnalysis = null;

    if (scanId) {
      scan = await prisma.hairHealthScan.findUnique({
        where: { id: scanId },
      });
    } else {
      scan = await prisma.hairHealthScan.findFirst({
        where: { customerId },
        orderBy: { createdAt: "desc" },
      });
    }

    if (damageAssessmentId) {
      damageAssessment = await prisma.damageLevelAssessment.findUnique({
        where: { id: damageAssessmentId },
      });
    } else {
      damageAssessment = await prisma.damageLevelAssessment.findFirst({
        where: { customerId },
        orderBy: { createdAt: "desc" },
      });
    }

    if (porosityAnalysisId) {
      porosityAnalysis = await prisma.porosityElasticityAnalysis.findUnique({
        where: { id: porosityAnalysisId },
      });
    } else {
      porosityAnalysis = await prisma.porosityElasticityAnalysis.findFirst({
        where: { customerId },
        orderBy: { createdAt: "desc" },
      });
    }

    if (chemicalRiskId) {
      chemicalRisk = await prisma.chemicalHistoryRisk.findUnique({
        where: { id: chemicalRiskId },
      });
    } else {
      chemicalRisk = await prisma.chemicalHistoryRisk.findFirst({
        where: { customerId },
        orderBy: { createdAt: "desc" },
      });
    }

    if (scalpAnalysisId) {
      scalpAnalysis = await prisma.scalpConditionAnalysis.findUnique({
        where: { id: scalpAnalysisId },
      });
    } else {
      scalpAnalysis = await prisma.scalpConditionAnalysis.findFirst({
        where: { customerId },
        orderBy: { createdAt: "desc" },
      });
    }

    // Prepare data for AI
    const prompt = treatmentPlanPrompt({
      healthScore: scan?.healthScore || undefined,
      damageLevel: damageAssessment?.damageLevel || undefined,
      porosity: porosityAnalysis?.porosity || undefined,
      elasticity: porosityAnalysis?.elasticity || undefined,
      riskLevel: chemicalRisk?.riskLevel || undefined,
      scalpCondition: scalpAnalysis?.scalpType || undefined,
    });

    // AI Generate treatment plan
    let plan;
    try {
      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Bạn là AI Treatment Plan Specialist chuyên nghiệp. Tạo phác đồ phục hồi chi tiết theo chuẩn salon Hàn Quốc. Trả về JSON hợp lệ.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 3000,
        temperature: 0.7,
        response_format: { type: "json_object" },
      });

      const rawOutput = completion.choices[0]?.message?.content;
      if (rawOutput) {
        plan = JSON.parse(rawOutput);
      }
    } catch (aiError) {
      console.error("AI treatment plan generation error:", aiError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to generate treatment plan",
        },
        { status: 500 }
      );
    }

    // Create treatment plan
    const treatmentPlan = await prisma.treatmentPlan.create({
      data: {
        customerId,
        scanId: scan?.id || null,
        damageAssessmentId: damageAssessment?.id || null,
        porosityAnalysisId: porosityAnalysis?.id || null,
        chemicalRiskId: chemicalRisk?.id || null,
        scalpAnalysisId: scalpAnalysis?.id || null,
        planType: planType || "COMPREHENSIVE",
        duration: plan.duration || 30,
        immediateTreatment: plan.immediateTreatment || null,
        weeklyPlan: plan.weeklyPlan || null,
        homecarePlan: plan.homecarePlan || null,
        permSuitability: plan.permSuitability || null,
        colorSuitability: plan.colorSuitability || null,
        bleachSuitability: plan.bleachSuitability || null,
        products: plan.products || [],
        expectedHealthScore: plan.expectedHealthScore || null,
        expectedImprovement: plan.expectedImprovement || null,
        status: "ACTIVE",
        isAIGenerated: true,
        confidence: 85,
      },
    });

    return NextResponse.json({
      success: true,
      plan: treatmentPlan,
      aiData: plan,
    });
  } catch (err: any) {
    console.error("Generate treatment plan error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to generate treatment plan",
      },
      { status: 500 }
    );
  }
}

// Get treatment plans
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    const status = searchParams.get("status");

    const where: any = {};
    if (customerId) where.customerId = customerId;
    if (status) where.status = status;

    const plans = await prisma.treatmentPlan.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      plans,
    });
  } catch (err: any) {
    console.error("Get treatment plans error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get treatment plans",
      },
      { status: 500 }
    );
  }
}

