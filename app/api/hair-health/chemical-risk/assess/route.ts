// ============================================
// Hair Health - Chemical History Risk Assessment
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const {
      customerId,
      chemicalHistory,
      lastPerm,
      lastColor,
      lastBleach,
      lastStraighten,
      lastTreatment,
      homeDyeing,
      heatStyling,
    } = await req.json();

    if (!chemicalHistory || !Array.isArray(chemicalHistory)) {
      return NextResponse.json(
        { error: "chemicalHistory array is required" },
        { status: 400 }
      );
    }

    // Calculate frequency
    const permCount = chemicalHistory.filter((h: any) => 
      h.type?.toLowerCase().includes("perm") || h.type?.toLowerCase().includes("uốn")
    ).length;
    const colorCount = chemicalHistory.filter((h: any) =>
      h.type?.toLowerCase().includes("color") || h.type?.toLowerCase().includes("nhuộm")
    ).length;
    const bleachCount = chemicalHistory.filter((h: any) =>
      h.type?.toLowerCase().includes("bleach") || h.type?.toLowerCase().includes("tẩy")
    ).length;

    const permFrequency =
      permCount >= 3 ? "HIGH" : permCount >= 2 ? "MEDIUM" : "LOW";
    const colorFrequency =
      colorCount >= 4 ? "HIGH" : colorCount >= 2 ? "MEDIUM" : "LOW";

    // Calculate cumulative damage
    let cumulativeDamage = 0;
    for (const history of chemicalHistory) {
      cumulativeDamage += history.damage || 0;
    }

    // Assess risk
    let riskLevel = "LOW";
    let riskScore = 0;
    const riskFactors: string[] = [];

    // Factor 1: Bleach history
    if (bleachCount >= 2) {
      riskScore += 40;
      riskFactors.push(`Đã tẩy ${bleachCount} lần`);
      riskLevel = "HIGH";
    } else if (bleachCount === 1) {
      riskScore += 20;
    }

    // Factor 2: Recent treatments
    const now = new Date();
    if (lastBleach) {
      const daysSinceBleach =
        (now.getTime() - new Date(lastBleach).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceBleach < 30) {
        riskScore += 30;
        riskFactors.push("Tẩy trong vòng 30 ngày gần đây");
        if (riskLevel === "LOW") riskLevel = "MEDIUM";
        if (riskLevel === "MEDIUM") riskLevel = "HIGH";
      }
    }

    if (lastColor) {
      const daysSinceColor =
        (now.getTime() - new Date(lastColor).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceColor < 30 && colorCount >= 2) {
        riskScore += 20;
        riskFactors.push("Nhuộm liên tục 30 ngày gần đây");
        if (riskLevel === "LOW") riskLevel = "MEDIUM";
      }
    }

    // Factor 3: Home dyeing
    if (homeDyeing) {
      riskScore += 15;
      riskFactors.push("Hay tự nhuộm tại nhà");
      if (riskLevel === "LOW") riskLevel = "MEDIUM";
    }

    // Factor 4: Heat styling
    if (heatStyling) {
      riskScore += 10;
      riskFactors.push("Hay ép/kẹp nhiều");
    }

    // Factor 5: Cumulative damage
    if (cumulativeDamage >= 80) {
      riskScore += 30;
      riskFactors.push(`Tổn thương tích lũy cao: ${cumulativeDamage}%`);
      riskLevel = "CRITICAL";
    } else if (cumulativeDamage >= 60) {
      riskScore += 20;
      riskFactors.push(`Tổn thương tích lũy: ${cumulativeDamage}%`);
      if (riskLevel === "LOW") riskLevel = "MEDIUM";
      if (riskLevel === "MEDIUM") riskLevel = "HIGH";
    }

    riskScore = Math.min(100, riskScore);

    // Final risk level
    if (riskScore >= 70) {
      riskLevel = "CRITICAL";
    } else if (riskScore >= 50) {
      riskLevel = "HIGH";
    } else if (riskScore >= 30) {
      riskLevel = "MEDIUM";
    }

    // Safety recommendations
    const safeToPerm = riskLevel === "LOW" || riskLevel === "MEDIUM";
    const safeToColor = riskLevel !== "CRITICAL" && bleachCount < 2;
    const safeToBleach = riskLevel === "LOW" && bleachCount === 0;

    let recommendations = "";
    if (riskLevel === "CRITICAL" || riskLevel === "HIGH") {
      recommendations = "Rủi ro cao. Không nên uốn/nhuộm, chỉ phục hồi. Xếp vào nhóm 'không uốn nóng'.";
    } else if (riskLevel === "MEDIUM") {
      recommendations = "Rủi ro trung bình. Có thể uốn/nhuộm với biện pháp bảo vệ và phục hồi sau.";
    } else {
      recommendations = "Rủi ro thấp. Có thể làm hóa chất an toàn với biện pháp bảo vệ.";
    }

    // Create risk assessment
    const riskAssessment = await prisma.chemicalHistoryRisk.create({
      data: {
        customerId: customerId || null,
        chemicalHistory,
        lastPerm: lastPerm ? new Date(lastPerm) : null,
        lastColor: lastColor ? new Date(lastColor) : null,
        lastBleach: lastBleach ? new Date(lastBleach) : null,
        lastStraighten: lastStraighten ? new Date(lastStraighten) : null,
        lastTreatment: lastTreatment ? new Date(lastTreatment) : null,
        permFrequency,
        colorFrequency,
        homeDyeing: homeDyeing || false,
        heatStyling: heatStyling || false,
        riskLevel,
        riskScore,
        riskFactors,
        cumulativeDamage,
        safeToPerm,
        safeToColor,
        safeToBleach,
        recommendations,
      },
    });

    return NextResponse.json({
      success: true,
      assessment: riskAssessment,
    });
  } catch (err: any) {
    console.error("Chemical risk assessment error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to assess chemical risk",
      },
      { status: 500 }
    );
  }
}

// Get assessments
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");

    const where: any = {};
    if (customerId) where.customerId = customerId;

    const assessments = await prisma.chemicalHistoryRisk.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      assessments,
    });
  } catch (err: any) {
    console.error("Get chemical risk assessments error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get assessments",
      },
      { status: 500 }
    );
  }
}

