// ============================================
// PHASE 29F - Full Procedure Output
// ============================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

function successResponse(data: any, message: string = "Success", status: number = 200) {
  return Response.json({ success: true, data, message }, { status });
}

function errorResponse(message: string, status: number = 400) {
  return Response.json({ success: false, error: message }, { status });
}

// POST /api/hair-formula/generate/procedure
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageId, formulaId, includePerm = true, includeColor = true } = body;

    if (!imageId) {
      return errorResponse("Image ID is required", 400);
    }

    // Get image with all analyses and formulas
    const image = await prisma.hairStyleImage.findUnique({
      where: { id: imageId },
      include: {
        styleAnalysis: true,
        curlAnalysis: true,
        colorAnalysis: true,
        formulas: {
          orderBy: { createdAt: "desc" },
          take: 2, // Get latest perm and color formulas
        },
      },
    });

    if (!image) {
      return errorResponse("Image not found", 404);
    }

    // Get formula
    let formula = null;
    if (formulaId) {
      formula = await prisma.hairFormula.findUnique({
        where: { id: formulaId },
      });
    } else {
      // Use latest formula
      formula = image.formulas[0] || null;
    }

    if (!formula) {
      return errorResponse("No formula found. Please generate formula first.", 400);
    }

    // Determine procedure type
    let procedureType = "BOTH";
    if (!includePerm && includeColor) procedureType = "COLOR";
    if (includePerm && !includeColor) procedureType = "PERM";
    if (formula.formulaType === "COLOR") procedureType = "COLOR";
    if (formula.formulaType?.includes("PERM")) procedureType = "PERM";

    // Build comprehensive procedure prompt
    const procedurePrompt = `
Bạn là chuyên gia tạo SOP (Standard Operating Procedure) cho salon tại Chí Tâm Hair Salon.

THÔNG TIN PHÂN TÍCH:
${image.styleAnalysis ? JSON.stringify(image.styleAnalysis, null, 2) : "Chưa có"}
${image.curlAnalysis ? JSON.stringify(image.curlAnalysis, null, 2) : "Chưa có"}
${image.colorAnalysis ? JSON.stringify(image.colorAnalysis, null, 2) : "Chưa có"}

CÔNG THỨC:
${JSON.stringify(formula, null, 2)}

NHIỆM VỤ:
Tạo SOP hoàn chỉnh từ phân tích và công thức trên.

SOP CẦN BAO GỒM:

1. PRE-PROCEDURE (Chuẩn bị):
   - Kiểm tra tình trạng tóc
   - Pre-treatment (nếu có)
   - Chuẩn bị dụng cụ và sản phẩm

2. MAIN PROCEDURE (Quy trình chính):
   - Các bước chi tiết theo thứ tự
   - Thời gian cho mỗi bước
   - Lưu ý kỹ thuật

3. POST-PROCEDURE (Sau xử lý):
   - Xả sạch
   - Dưỡng
   - Styling

4. PRODUCT RECOMMENDATIONS:
   - Sản phẩm sử dụng
   - Sản phẩm chăm sóc sau

5. ESTIMATED TIME:
   - Tổng thời gian ước tính

6. AFTERCARE:
   - Hướng dẫn chăm sóc tại nhà

7. FULL SOP TEXT:
   - SOP đầy đủ dạng text

TRẢ VỀ JSON:
{
  "procedureType": "BOTH",
  "preProcedure": [
    "Kiểm tra tình trạng tóc",
    "Pre-treatment: Plexis Treatment 3 phút",
    "..."
  ],
  "mainProcedure": [
    "Bước 1: ...",
    "Bước 2: ...",
    "..."
  ],
  "postProcedure": [
    "Xả sạch...",
    "Dưỡng...",
    "..."
  ],
  "products": [
    {"name": "Plexis Acid Aqua Gloss Curl 7.5", "usage": "Main perm product"},
    "..."
  ],
  "estimatedTime": 120,
  "aftercare": {
    "instructions": [
      "Chăm mask 2 lần/tuần",
      "Tránh gội nước nóng",
      "..."
    ],
    "products": ["Product 1", "Product 2"]
  },
  "fullSOP": "SOP đầy đủ dạng text format..."
}
`;

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Bạn là chuyên gia tạo SOP cho salon. Tạo quy trình chi tiết, chuyên nghiệp, dễ follow. Trả về JSON hợp lệ.",
        },
        {
          role: "user",
          content: procedurePrompt,
        },
      ],
      max_tokens: 3000,
      temperature: 0.5,
      response_format: { type: "json_object" },
    });

    const rawOutput = completion.choices[0]?.message?.content;
    if (!rawOutput) {
      return errorResponse("AI did not generate procedure", 500);
    }

    // Parse JSON
    let procedureData;
    try {
      const cleaned = rawOutput.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      procedureData = JSON.parse(cleaned);
    } catch (parseError: any) {
      console.error("Failed to parse procedure JSON:", parseError);
      return errorResponse("Failed to parse procedure response", 500);
    }

    // Save procedure
    const procedure = await prisma.hairProcedure.create({
      data: {
        imageId,
        styleAnalysisId: image.styleAnalysis?.id || null,
        curlAnalysisId: image.curlAnalysis?.id || null,
        colorAnalysisId: image.colorAnalysis?.id || null,
        formulaId: formula.id,
        procedureType: procedureType,
        preProcedure: procedureData.preProcedure || null,
        mainProcedure: procedureData.mainProcedure || [],
        postProcedure: procedureData.postProcedure || null,
        products: procedureData.products || null,
        estimatedTime: procedureData.estimatedTime || null,
        aftercare: procedureData.aftercare || null,
        fullSOP: procedureData.fullSOP || null,
      },
    });

    return successResponse(procedure);
  } catch (error: any) {
    console.error("Error generating procedure:", error);
    return errorResponse(error.message || "Failed to generate procedure", 500);
  }
}

