// ============================================
// Hair Health - Scalp Condition Analysis
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const {
      customerId,
      scalpType,
      dandruff,
      dandruffType,
      fungalInfection,
      inflammation,
      rootStrength,
      hairLoss,
    } = await req.json();

    if (!scalpType) {
      return NextResponse.json(
        { error: "scalpType is required" },
        { status: 400 }
      );
    }

    // Analyze issues
    const issues: string[] = [];
    if (dandruff && dandruff !== "NONE") {
      issues.push(`Gàu: ${dandruff} - ${dandruffType || "N/A"}`);
    }
    if (fungalInfection) {
      issues.push("Nhiễm nấm");
    }
    if (inflammation) {
      issues.push("Viêm/mụn");
    }
    if (hairLoss && hairLoss !== "NORMAL") {
      issues.push(`Rụng tóc: ${hairLoss}`);
    }
    if (rootStrength && rootStrength < 50) {
      issues.push(`Chân tóc yếu: ${rootStrength}%`);
    }

    // Generate analysis
    let analysis = `Da đầu ${scalpType.toLowerCase()}`;
    if (dandruff && dandruff !== "NONE") {
      analysis += `, có gàu ${dandruff.toLowerCase()} (${dandruffType?.toLowerCase() || "N/A"})`;
    }
    if (rootStrength !== undefined) {
      analysis += `. Sức mạnh chân tóc: ${rootStrength}%`;
    }
    if (hairLoss && hairLoss !== "NORMAL") {
      analysis += `. Tình trạng rụng: ${hairLoss.toLowerCase()}`;
    }

    // Recommendations
    let recommendations = "";
    if (scalpType === "OILY") {
      recommendations = "Detox da đầu + gội phục hồi nhẹ";
    }
    if (dandruff === "MILD" || dandruff === "MODERATE") {
      recommendations += ". Sử dụng dầu gội trị gàu";
    }
    if (fungalInfection) {
      recommendations += ". Cần điều trị nấm";
    }
    if (rootStrength && rootStrength < 50) {
      recommendations += ". Tăng cường chân tóc với serum";
    }

    // Create analysis record
    const scalpAnalysis = await prisma.scalpConditionAnalysis.create({
      data: {
        customerId: customerId || null,
        scalpType,
        dandruff: dandruff || "NONE",
        dandruffType: dandruffType || null,
        fungalInfection: fungalInfection || false,
        inflammation: inflammation || false,
        rootStrength: rootStrength || null,
        hairLoss: hairLoss || "NORMAL",
        analysis,
        issues,
        recommendations: recommendations || null,
      },
    });

    return NextResponse.json({
      success: true,
      analysis: scalpAnalysis,
    });
  } catch (err: any) {
    console.error("Scalp analysis error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to analyze scalp",
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

    const analyses = await prisma.scalpConditionAnalysis.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      analyses,
    });
  } catch (err: any) {
    console.error("Get scalp analyses error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get analyses",
      },
      { status: 500 }
    );
  }
}

