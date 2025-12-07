// ============================================
// Stylist Assistant - Support Panel
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const {
      customerId,
      bookingId,
      faceAnalysisId,
      hairConditionId,
      hairstyleRecId,
      colorRecId,
    } = await req.json();

    if (!customerId) {
      return NextResponse.json(
        { error: "customerId is required" },
        { status: 400 }
      );
    }

    // Get all analysis data
    let faceAnalysis = null;
    let hairCondition = null;
    let hairstyleRec = null;
    let colorRec = null;

    if (faceAnalysisId) {
      faceAnalysis = await prisma.faceAnalysis.findUnique({
        where: { id: faceAnalysisId },
      });
    } else {
      faceAnalysis = await prisma.faceAnalysis.findFirst({
        where: { customerId },
        orderBy: { createdAt: "desc" },
      });
    }

    if (hairConditionId) {
      hairCondition = await prisma.hairConditionAnalysis.findUnique({
        where: { id: hairConditionId },
      });
    } else {
      hairCondition = await prisma.hairConditionAnalysis.findFirst({
        where: { customerId },
        orderBy: { createdAt: "desc" },
      });
    }

    if (hairstyleRecId) {
      hairstyleRec = await prisma.hairstyleRecommendation.findUnique({
        where: { id: hairstyleRecId },
      });
    } else {
      hairstyleRec = await prisma.hairstyleRecommendation.findFirst({
        where: { customerId },
        orderBy: { createdAt: "desc" },
      });
    }

    if (colorRecId) {
      colorRec = await prisma.colorRecommendation.findUnique({
        where: { id: colorRecId },
      });
    } else {
      colorRec = await prisma.colorRecommendation.findFirst({
        where: { customerId },
        orderBy: { createdAt: "desc" },
      });
    }

    // Build support data
    const supportData = {
      faceAnalysis: faceAnalysis
        ? {
            faceShape: faceAnalysis.faceShape,
            vibe: faceAnalysis.overallVibe,
            recommendations: faceAnalysis.recommendations,
          }
        : null,
      hairCondition: hairCondition
        ? {
            damageLevel: hairCondition.damageLevel,
            elasticity: hairCondition.elasticity,
            canPerm: hairCondition.canPerm,
            canColor: hairCondition.canColor,
            riskLevel: hairCondition.riskLevel,
            recommendedProducts: hairCondition.recommendedProducts,
          }
        : null,
      hairstyle: hairstyleRec
        ? {
            style: hairstyleRec.recommendedStyle,
            product: hairstyleRec.recommendedProduct,
            permSetting: hairstyleRec.permSetting,
            reasons: hairstyleRec.reasons,
            warnings: hairstyleRec.warnings,
          }
        : null,
      color: colorRec
        ? {
            color: colorRec.recommendedColor,
            technique: colorRec.technique,
            developer: colorRec.developer,
            reasons: colorRec.reasons,
            warnings: colorRec.warnings,
          }
        : null,
    };

    // Build technical guides
    const productGuide = {
      recommendedProducts:
        hairCondition?.recommendedProducts || hairstyleRec?.recommendedProduct
          ? [
              ...(hairCondition?.recommendedProducts || []),
              hairstyleRec?.recommendedProduct || "",
            ].filter(Boolean)
          : [],
      notes: hairCondition?.recommendations || null,
    };

    const formulaGuide = {
      permSetting: hairstyleRec?.permSetting || null,
      colorFormula: colorRec
        ? {
            baseColor: colorRec.baseColor,
            technique: colorRec.technique,
            developer: colorRec.developer,
          }
        : null,
    };

    const settings = {
      time: hairstyleRec?.permSetting
        ? JSON.parse(JSON.stringify(hairstyleRec.permSetting)).time
        : null,
      temperature: hairstyleRec?.permSetting
        ? JSON.parse(JSON.stringify(hairstyleRec.permSetting)).temperature
        : null,
      rodSize: hairstyleRec?.permSetting
        ? JSON.parse(JSON.stringify(hairstyleRec.permSetting)).rodSize
        : null,
    };

    const warnings = [
      ...(hairstyleRec?.warnings || []),
      ...(colorRec?.warnings || []),
      hairCondition?.riskLevel === "HIGH" || hairCondition?.riskLevel === "CRITICAL"
        ? `Cảnh báo: Tóc hư tổn ${hairCondition.damageLevel}% - ${hairCondition.recommendations}`
        : "",
    ].filter(Boolean);

    // Create support panel
    const panel = await prisma.stylistSupportPanel.create({
      data: {
        customerId,
        bookingId: bookingId || null,
        faceAnalysisId: faceAnalysis?.id || null,
        hairConditionId: hairCondition?.id || null,
        hairstyleRecId: hairstyleRec?.id || null,
        colorRecId: colorRec?.id || null,
        supportData,
        faceShape: faceAnalysis?.faceShape || null,
        hairCondition: hairCondition
          ? `${hairCondition.damageLevel || 0}% damage, ${hairCondition.elasticity || "N/A"} elasticity`
          : null,
        recommendedStyle: hairstyleRec?.recommendedStyle || null,
        recommendedColor: colorRec?.recommendedColor || null,
        productGuide,
        formulaGuide,
        settings,
        warnings,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      panel,
    });
  } catch (err: any) {
    console.error("Create support panel error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to create support panel",
      },
      { status: 500 }
    );
  }
}

// Get support panel
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    const bookingId = searchParams.get("bookingId");

    const where: any = { isActive: true };
    if (customerId) where.customerId = customerId;
    if (bookingId) where.bookingId = bookingId;

    const panels = await prisma.stylistSupportPanel.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 1,
    });

    return NextResponse.json({
      success: true,
      panel: panels[0] || null,
    });
  } catch (err: any) {
    console.error("Get support panel error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get support panel",
      },
      { status: 500 }
    );
  }
}

