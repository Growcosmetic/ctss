// ============================================
// PHASE 29D - Plexis Formula Generator
// ============================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { plexisFormulaPrompt } from "@/core/prompts/plexisFormulaPrompt";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

function successResponse(data: any, message: string = "Success", status: number = 200) {
  return Response.json({ success: true, data, message }, { status });
}

function errorResponse(message: string, status: number = 400) {
  return Response.json({ success: false, error: message }, { status });
}

// POST /api/hair-formula/generate/plexis
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageId, styleAnalysisId, curlAnalysisId } = body;

    if (!imageId) {
      return errorResponse("Image ID is required", 400);
    }

    // Get image and analyses
    const image = await prisma.hairStyleImage.findUnique({
      where: { id: imageId },
      include: {
        styleAnalysis: true,
        curlAnalysis: true,
      },
    });

    if (!image) {
      return errorResponse("Image not found", 404);
    }

    const styleAnalysis = styleAnalysisId
      ? await prisma.hairStyleAnalysis.findUnique({
          where: { id: styleAnalysisId },
        })
      : image.styleAnalysis;

    const curlAnalysis = curlAnalysisId
      ? await prisma.curlPatternAnalysis.findUnique({
          where: { id: curlAnalysisId },
        })
      : image.curlAnalysis;

    if (!styleAnalysis || !curlAnalysis) {
      return errorResponse(
        "Style analysis and curl analysis are required. Please run analysis first.",
        400
      );
    }

    // Prepare hair condition
    const hairCondition = {
      damageLevel: styleAnalysis.damageLevel || 0,
      porosity: styleAnalysis.porosity || "MEDIUM",
      dryness: styleAnalysis.dryness || 0,
    };

    // Generate prompt
    const prompt = plexisFormulaPrompt(styleAnalysis, curlAnalysis, hairCondition);

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Bạn là chuyên gia uốn tóc Plexis tại Chí Tâm Hair Salon. Tạo công thức chính xác, chuyên nghiệp. Trả về JSON hợp lệ.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 2000,
      temperature: 0.4,
      response_format: { type: "json_object" },
    });

    const rawOutput = completion.choices[0]?.message?.content;
    if (!rawOutput) {
      return errorResponse("AI did not generate formula", 500);
    }

    // Parse JSON
    let formulaData;
    try {
      const cleaned = rawOutput.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      formulaData = JSON.parse(cleaned);
    } catch (parseError: any) {
      console.error("Failed to parse formula JSON:", parseError);
      return errorResponse("Failed to parse formula response", 500);
    }

    // Save formula
    const formula = await prisma.hairFormula.create({
      data: {
        imageId,
        formulaType: formulaData.formulaType || "PERM_HOT",
        permProduct: formulaData.permProduct || null,
        permStrength: formulaData.permStrength || null,
        permSetting: formulaData.permSetting || null,
        permTime: formulaData.permTime || null,
        permHeat: formulaData.permHeat || null,
        permSteps: formulaData.permSteps || null,
        preTreatment: formulaData.preTreatment || null,
        postTreatment: formulaData.postTreatment || null,
        warnings: formulaData.warnings || [],
        notes: formulaData.notes || [],
        riskLevel: formulaData.riskLevel || "MEDIUM",
        riskFactors: formulaData.riskFactors || [],
        aiGenerated: true,
        confidence: formulaData.confidence || null,
      },
    });

    return successResponse(formula);
  } catch (error: any) {
    console.error("Error generating Plexis formula:", error);
    return errorResponse(error.message || "Failed to generate formula", 500);
  }
}

