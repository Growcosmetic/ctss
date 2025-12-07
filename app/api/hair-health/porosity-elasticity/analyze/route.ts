// ============================================
// Hair Health - Porosity & Elasticity Analysis
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const {
      customerId,
      scanId,
      porosity,
      elasticity,
      proteinLevel,
      moistureLevel,
    } = await req.json();

    if (!porosity || !elasticity) {
      return NextResponse.json(
        { error: "porosity and elasticity are required" },
        { status: 400 }
      );
    }

    // Calculate balance
    let balance = "BALANCED";
    if (proteinLevel !== undefined && moistureLevel !== undefined) {
      const diff = Math.abs(proteinLevel - moistureLevel);
      if (diff > 20) {
        if (proteinLevel > moistureLevel) {
          balance = "PROTEIN_DEFICIENT";
        } else {
          balance = "MOISTURE_DEFICIENT";
        }
      }
    }

    // Analyze risks
    const riskFactors: string[] = [];
    if (porosity === "HIGH") {
      riskFactors.push("Tóc xốp cao - ăn thuốc rất nhanh, dễ hư");
    }
    if (porosity === "LOW") {
      riskFactors.push("Tóc xốp thấp - khó ăn thuốc");
    }
    if (elasticity === "LOW" || elasticity === "POOR") {
      riskFactors.push("Độ đàn hồi thấp - tóc yếu, dễ gãy");
    }
    if (balance === "PROTEIN_DEFICIENT") {
      riskFactors.push("Thiếu protein - cần bổ sung protein");
    }
    if (balance === "MOISTURE_DEFICIENT") {
      riskFactors.push("Thiếu ẩm - cần cấp ẩm");
    }

    // Generate analysis
    let analysis = "";
    if (porosity === "HIGH" && elasticity === "LOW") {
      analysis =
        "Porosity cao + Elasticity thấp → Không nên uốn nóng, chỉ uốn lạnh + phục hồi.";
    } else if (porosity === "LOW") {
      analysis = "Porosity thấp → Cần xử lý trước khi nhuộm để thuốc ngấm đều.";
    } else if (elasticity === "POOR") {
      analysis = "Elasticity kém → Cần phục hồi protein trước khi làm hóa chất.";
    } else {
      analysis = "Porosity và Elasticity ở mức ổn định, có thể làm hóa chất với biện pháp bảo vệ.";
    }

    // Recommendations
    let recommendations = "";
    if (porosity === "HIGH") {
      recommendations += "Sử dụng sản phẩm phục hồi để giảm độ xốp. ";
    }
    if (elasticity === "LOW" || elasticity === "POOR") {
      recommendations += "Bổ sung protein qua treatment. ";
    }
    if (balance === "PROTEIN_DEFICIENT") {
      recommendations += "Sử dụng protein treatment. ";
    }
    if (balance === "MOISTURE_DEFICIENT") {
      recommendations += "Cấp ẩm tích cực với mask và serum.";
    }

    // Create analysis record
    const analysisRecord = await prisma.porosityElasticityAnalysis.create({
      data: {
        customerId: customerId || null,
        scanId: scanId || null,
        porosity,
        elasticity,
        porosityLevel: porosity === "HIGH" ? 75 : porosity === "MEDIUM" ? 50 : 25,
        elasticityLevel: elasticity === "HIGH" ? 80 : elasticity === "MEDIUM" ? 60 : elasticity === "LOW" ? 40 : 20,
        proteinLevel: proteinLevel || null,
        moistureLevel: moistureLevel || null,
        balance,
        analysis,
        riskFactors,
        recommendations: recommendations || null,
      },
    });

    return NextResponse.json({
      success: true,
      analysis: analysisRecord,
    });
  } catch (err: any) {
    console.error("Porosity elasticity analysis error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to analyze porosity/elasticity",
      },
      { status: 500 }
    );
  }
}

// Get analyses
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");

    const where: any = {};
    if (customerId) where.customerId = customerId;

    const analyses = await prisma.porosityElasticityAnalysis.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      analyses,
    });
  } catch (err: any) {
    console.error("Get porosity elasticity analyses error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get analyses",
      },
      { status: 500 }
    );
  }
}

