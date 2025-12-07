// ============================================
// Hair Health - Damage Level Assessment
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { customerId, scanId, damageLevel } = await req.json();

    if (damageLevel === undefined || damageLevel === null) {
      return NextResponse.json(
        { error: "damageLevel is required" },
        { status: 400 }
      );
    }

    // Determine category
    let damageCategory = "LEVEL_1";
    let status = "HEALTHY";
    
    if (damageLevel >= 0 && damageLevel < 20) {
      damageCategory = "LEVEL_1";
      status = "HEALTHY";
    } else if (damageLevel >= 20 && damageLevel < 40) {
      damageCategory = "LEVEL_2";
      status = "MILD";
    } else if (damageLevel >= 40 && damageLevel < 60) {
      damageCategory = "LEVEL_3";
      status = "MODERATE";
    } else if (damageLevel >= 60 && damageLevel < 80) {
      damageCategory = "LEVEL_4";
      status = "SEVERE";
    } else {
      damageCategory = "LEVEL_5";
      status = "CRITICAL";
    }

    // Determine risks
    const breakageRisk =
      damageLevel >= 80
        ? "CRITICAL"
        : damageLevel >= 60
        ? "HIGH"
        : damageLevel >= 40
        ? "MEDIUM"
        : "LOW";

    const canPerm = damageLevel < 60;
    const canColor = damageLevel < 70;
    const canBleach = damageLevel < 50;

    // Generate assessment
    const assessment = `Damage level: ${damageLevel}% → ${damageCategory} (${status}). ${
      damageLevel < 40
        ? "Tóc khỏe, có thể uốn/nhuộm an toàn."
        : damageLevel < 60
        ? "Tóc hư trung bình, cần phục hồi trước khi uốn/nhuộm."
        : damageLevel < 80
        ? "Tóc hư nặng, dễ gãy. Không nên uốn/nhuộm, chỉ phục hồi."
        : "Tóc siêu hư tổn. Không thể uốn/nhuộm, cần phục hồi tích cực."
    }`;

    const warnings: string[] = [];
    if (damageLevel >= 60) {
      warnings.push("Không nên uốn nóng");
    }
    if (damageLevel >= 70) {
      warnings.push("Không nên nhuộm");
    }
    if (damageLevel >= 50) {
      warnings.push("Không nên tẩy");
    }
    if (damageLevel >= 40) {
      warnings.push("Cần phục hồi trước khi làm hóa chất");
    }

    // Create assessment
    const assessmentRecord = await prisma.damageLevelAssessment.create({
      data: {
        customerId: customerId || null,
        scanId: scanId || null,
        damageLevel,
        damageCategory,
        status,
        breakageRisk,
        canPerm,
        canColor,
        canBleach,
        assessment,
        warnings,
      },
    });

    return NextResponse.json({
      success: true,
      assessment: assessmentRecord,
    });
  } catch (err: any) {
    console.error("Damage assessment error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to assess damage",
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

    const assessments = await prisma.damageLevelAssessment.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      assessments,
    });
  } catch (err: any) {
    console.error("Get damage assessments error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get assessments",
      },
      { status: 500 }
    );
  }
}

