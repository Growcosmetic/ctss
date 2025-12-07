// ============================================
// Customer Experience - Score system
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { experienceAnalysisPrompt } from "@/core/prompts/experienceAnalysisPrompt";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const {
      customerId,
      serviceId,
      visitId,
      consultationScore,
      technicalScore,
      attitudeScore,
      waitTimeScore,
      valueScore,
      careScore,
      feedback,
    } = await req.json();

    if (!customerId) {
      return NextResponse.json(
        { error: "customerId is required" },
        { status: 400 }
      );
    }

    // Calculate overall score (weighted average)
    const scores = [
      { value: consultationScore, weight: 0.15 },
      { value: technicalScore, weight: 0.25 },
      { value: attitudeScore, weight: 0.20 },
      { value: waitTimeScore, weight: 0.10 },
      { value: valueScore, weight: 0.20 },
      { value: careScore, weight: 0.10 },
    ];

    let totalWeight = 0;
    let weightedSum = 0;

    for (const score of scores) {
      if (score.value !== null && score.value !== undefined) {
        weightedSum += score.value * score.weight;
        totalWeight += score.weight;
      }
    }

    const overallScore = totalWeight > 0 ? weightedSum / totalWeight : 0;

    // AI Analysis
    let aiAnalysis = null;
    let sentiment = "NEUTRAL";
    let strengths = null;
    let improvements = null;

    if (feedback || overallScore < 80) {
      try {
        const prompt = experienceAnalysisPrompt({
          consultationScore,
          technicalScore,
          attitudeScore,
          waitTimeScore,
          valueScore,
          careScore,
          overallScore,
          feedback,
        });

        const completion = await client.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "Bạn là AI Customer Experience Analyst chuyên nghiệp. Phân tích trải nghiệm khách hàng, đưa ra insights sâu sắc. Trả về JSON hợp lệ.",
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
          const analysis = JSON.parse(rawOutput);
          aiAnalysis = analysis.analysis || null;
          sentiment = analysis.sentiment || "NEUTRAL";
          strengths = analysis.strengths || null;
          improvements = analysis.improvements || null;
        }
      } catch (aiError) {
        console.error("AI analysis error:", aiError);
      }
    } else {
      // Quick analysis for high scores
      strengths = "Trải nghiệm tốt, khách hàng hài lòng";
      sentiment = overallScore >= 90 ? "POSITIVE" : "NEUTRAL";
    }

    // Create experience record
    const experience = await prisma.customerExperience.create({
      data: {
        customerId,
        serviceId: serviceId || null,
        visitId: visitId || null,
        consultationScore: consultationScore || null,
        technicalScore: technicalScore || null,
        attitudeScore: attitudeScore || null,
        waitTimeScore: waitTimeScore || null,
        valueScore: valueScore || null,
        careScore: careScore || null,
        overallScore: Math.round(overallScore * 100) / 100,
        strengths,
        improvements,
        feedback: feedback || null,
        aiAnalysis,
        sentiment,
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
      experience,
    });
  } catch (err: any) {
    console.error("Score experience error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to score experience",
      },
      { status: 500 }
    );
  }
}

// Get experience scores for customer
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!customerId) {
      return NextResponse.json(
        { error: "customerId is required" },
        { status: 400 }
      );
    }

    const experiences = await prisma.customerExperience.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    // Calculate average scores
    const averages = {
      consultationScore: 0,
      technicalScore: 0,
      attitudeScore: 0,
      waitTimeScore: 0,
      valueScore: 0,
      careScore: 0,
      overallScore: 0,
    };

    let count = experiences.length;
    if (count > 0) {
      for (const exp of experiences) {
        if (exp.consultationScore) averages.consultationScore += exp.consultationScore;
        if (exp.technicalScore) averages.technicalScore += exp.technicalScore;
        if (exp.attitudeScore) averages.attitudeScore += exp.attitudeScore;
        if (exp.waitTimeScore) averages.waitTimeScore += exp.waitTimeScore;
        if (exp.valueScore) averages.valueScore += exp.valueScore;
        if (exp.careScore) averages.careScore += exp.careScore;
        averages.overallScore += exp.overallScore;
      }

      averages.consultationScore /= count;
      averages.technicalScore /= count;
      averages.attitudeScore /= count;
      averages.waitTimeScore /= count;
      averages.valueScore /= count;
      averages.careScore /= count;
      averages.overallScore /= count;
    }

    return NextResponse.json({
      success: true,
      experiences,
      averages: {
        consultationScore: Math.round(averages.consultationScore * 100) / 100,
        technicalScore: Math.round(averages.technicalScore * 100) / 100,
        attitudeScore: Math.round(averages.attitudeScore * 100) / 100,
        waitTimeScore: Math.round(averages.waitTimeScore * 100) / 100,
        valueScore: Math.round(averages.valueScore * 100) / 100,
        careScore: Math.round(averages.careScore * 100) / 100,
        overallScore: Math.round(averages.overallScore * 100) / 100,
      },
      total: count,
    });
  } catch (err: any) {
    console.error("Get experiences error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get experiences",
      },
      { status: 500 }
    );
  }
}

