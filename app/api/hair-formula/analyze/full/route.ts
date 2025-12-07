// ============================================
// PHASE 29 - Full Analysis (All in One)
// ============================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

function successResponse(data: any, message: string = "Success", status: number = 200) {
  return Response.json({ success: true, data, message }, { status });
}

function errorResponse(message: string, status: number = 400) {
  return Response.json({ success: false, error: message }, { status });
}

// POST /api/hair-formula/analyze/full - Run all analyses and generate formulas
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageId, generatePermFormula = true, generateColorFormula = true } = body;

    if (!imageId) {
      return errorResponse("Image ID is required", 400);
    }

    const image = await prisma.hairStyleImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      return errorResponse("Image not found", 404);
    }

    const results: any = {
      imageId,
    };

    // 1. Run style analysis
    try {
      const styleResponse = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/hair-formula/analyze/style`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageId }),
        }
      );
      const styleData = await styleResponse.json();
      results.styleAnalysis = styleData.data;
    } catch (error) {
      console.error("Style analysis error:", error);
    }

    // 2. Run curl analysis
    try {
      const curlResponse = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/hair-formula/analyze/curl`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageId }),
        }
      );
      const curlData = await curlResponse.json();
      results.curlAnalysis = curlData.data;
    } catch (error) {
      console.error("Curl analysis error:", error);
    }

    // 3. Run color analysis
    try {
      const colorResponse = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/hair-formula/analyze/color`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageId }),
        }
      );
      const colorData = await colorResponse.json();
      results.colorAnalysis = colorData.data;
    } catch (error) {
      console.error("Color analysis error:", error);
    }

    // 4. Generate Plexis formula if requested
    if (generatePermFormula && results.styleAnalysis && results.curlAnalysis) {
      try {
        const permResponse = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/hair-formula/generate/plexis`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imageId,
              styleAnalysisId: results.styleAnalysis.id,
              curlAnalysisId: results.curlAnalysis.id,
            }),
          }
        );
        const permData = await permResponse.json();
        results.permFormula = permData.data;
      } catch (error) {
        console.error("Perm formula generation error:", error);
      }
    }

    // 5. Generate color formula if requested
    if (generateColorFormula && results.colorAnalysis) {
      try {
        const colorFormulaResponse = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/hair-formula/generate/color`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imageId,
              colorAnalysisId: results.colorAnalysis.id,
            }),
          }
        );
        const colorFormulaData = await colorFormulaResponse.json();
        results.colorFormula = colorFormulaData.data;
      } catch (error) {
        console.error("Color formula generation error:", error);
      }
    }

    // 6. Generate full procedure if formulas exist
    const formulaId = results.permFormula?.id || results.colorFormula?.id;
    if (formulaId) {
      try {
        const procedureResponse = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/hair-formula/generate/procedure`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imageId,
              formulaId,
              includePerm: !!results.permFormula,
              includeColor: !!results.colorFormula,
            }),
          }
        );
        const procedureData = await procedureResponse.json();
        results.procedure = procedureData.data;
      } catch (error) {
        console.error("Procedure generation error:", error);
      }
    }

    return successResponse(results, "Full analysis completed");
  } catch (error: any) {
    console.error("Error in full analysis:", error);
    return errorResponse(error.message || "Failed to complete full analysis", 500);
  }
}

