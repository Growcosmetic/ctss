// ============================================
// PHASE 29E - Color Formula Generator
// ============================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { colorFormulaPrompt } from "@/core/prompts/colorFormulaPrompt";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

function successResponse(data: any, message: string = "Success", status: number = 200) {
  return Response.json({ success: true, data, message }, { status });
}

function errorResponse(message: string, status: number = 400) {
  return Response.json({ success: false, error: message }, { status });
}

// POST /api/hair-formula/generate/color
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageId, colorAnalysisId } = body;

    if (!imageId) {
      return errorResponse("Image ID is required", 400);
    }

    // Get image and color analysis
    const image = await prisma.hairStyleImage.findUnique({
      where: { id: imageId },
      include: {
        colorAnalysis: true,
        styleAnalysis: true,
      },
    });

    if (!image) {
      return errorResponse("Image not found", 404);
    }

    const colorAnalysis = colorAnalysisId
      ? await prisma.colorAnalysis.findUnique({
          where: { id: colorAnalysisId },
        })
      : image.colorAnalysis;

    if (!colorAnalysis) {
      return errorResponse(
        "Color analysis is required. Please run color analysis first.",
        400
      );
    }

    // Prepare hair condition
    const hairCondition = {
      currentLevel: colorAnalysis.baseLevel || 5,
      damageLevel: image.styleAnalysis?.damageLevel || 0,
      porosity: image.styleAnalysis?.porosity || "MEDIUM",
    };

    // Generate prompt
    const prompt = colorFormulaPrompt(colorAnalysis, hairCondition);

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Bạn là chuyên gia nhuộm tóc tại Chí Tâm Hair Salon. Tạo công thức màu chính xác với tỷ lệ mix chuẩn. Trả về JSON hợp lệ.",
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
      console.error("Failed to parse color formula JSON:", parseError);
      return errorResponse("Failed to parse formula response", 500);
    }

    // Save formula
    const formula = await prisma.hairFormula.create({
      data: {
        imageId,
        formulaType: formulaData.formulaType || "COLOR",
        colorTubes: formulaData.colorTubes || null,
        colorOxy: formulaData.colorOxy || null,
        colorTime: formulaData.colorTime || null,
        colorSteps: formulaData.colorSteps || null,
        preTreatment: formulaData.preLift ? JSON.stringify(formulaData.preLift) : null,
        postTreatment: null,
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
    console.error("Error generating color formula:", error);
    return errorResponse(error.message || "Failed to generate formula", 500);
  }
}

