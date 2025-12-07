// ============================================
// Quality Control - Consistency Analysis
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const {
      staffId,
      serviceId,
      periodStart,
      periodEnd,
    } = await req.json();

    if (!staffId || !periodStart || !periodEnd) {
      return NextResponse.json(
        { error: "staffId, periodStart, and periodEnd are required" },
        { status: 400 }
      );
    }

    const startDate = new Date(periodStart);
    const endDate = new Date(periodEnd);

    // Get staff's quality scores in period
    const staffScores = await prisma.qualityScore.findMany({
      where: {
        staffId,
        serviceId: serviceId || undefined,
        capturedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    if (staffScores.length === 0) {
      return NextResponse.json(
        { error: "No quality scores found for this period" },
        { status: 404 }
      );
    }

    // Calculate averages
    const avgSetting = staffScores.reduce((sum, s) => sum + (s.evenness || 0), 0) / staffScores.length;
    const avgProductAmount = staffScores.reduce((sum, s) => sum + (s.productAmount || 0), 0) / staffScores.length;
    const avgTiming = staffScores.reduce((sum, s) => sum + (s.timing || 0), 0) / staffScores.length;
    const avgQualityScore = staffScores.reduce((sum, s) => sum + s.overallScore, 0) / staffScores.length;

    // Get team averages (all other staff for same service)
    const teamScores = await prisma.qualityScore.findMany({
      where: {
        staffId: { not: staffId },
        serviceId: serviceId || undefined,
        capturedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    let teamAvgSetting = 0;
    let teamAvgQuality = 0;

    if (teamScores.length > 0) {
      teamAvgSetting = teamScores.reduce((sum, s) => sum + (s.evenness || 0), 0) / teamScores.length;
      teamAvgQuality = teamScores.reduce((sum, s) => sum + s.overallScore, 0) / teamScores.length;
    }

    // Calculate deviation
    const settingDeviation = teamAvgSetting > 0 ? ((avgSetting - teamAvgSetting) / teamAvgSetting) * 100 : 0;
    const qualityDeviation = teamAvgQuality > 0 ? ((avgQualityScore - teamAvgQuality) / teamAvgQuality) * 100 : 0;

    // Calculate consistency score (100 - average absolute deviation)
    const consistencyScore = 100 - Math.abs(settingDeviation + qualityDeviation) / 2;

    // Generate analysis
    let analysis = "";
    let recommendations: string[] = [];

    if (Math.abs(settingDeviation) > 15) {
      if (settingDeviation > 0) {
        analysis += `Stylist dùng thuốc nhiều hơn team ${settingDeviation.toFixed(1)}%. `;
        recommendations.push("Giảm lượng thuốc để phù hợp với chuẩn team");
      } else {
        analysis += `Stylist dùng thuốc ít hơn team ${Math.abs(settingDeviation).toFixed(1)}%. `;
        recommendations.push("Tăng lượng thuốc để đảm bảo hiệu quả");
      }
    }

    if (Math.abs(qualityDeviation) > 10) {
      if (qualityDeviation > 0) {
        analysis += `Chất lượng tốt hơn team ${qualityDeviation.toFixed(1)}%. `;
      } else {
        analysis += `Chất lượng thấp hơn team ${Math.abs(qualityDeviation).toFixed(1)}%. `;
        recommendations.push("Cần cải thiện kỹ thuật để đạt chuẩn team");
      }
    }

    if (analysis === "") {
      analysis = "Chất lượng đồng nhất với team. Duy trì chuẩn hiện tại.";
    }

    // Create consistency metrics
    const metrics = await prisma.consistencyMetrics.create({
      data: {
        staffId,
        serviceId: serviceId || null,
        periodStart: startDate,
        periodEnd: endDate,
        avgSetting: Math.round(avgSetting * 100) / 100,
        avgProductAmount: Math.round(avgProductAmount * 100) / 100,
        avgTiming: Math.round(avgTiming * 100) / 100,
        avgQualityScore: Math.round(avgQualityScore * 100) / 100,
        teamAvgSetting: teamAvgSetting > 0 ? Math.round(teamAvgSetting * 100) / 100 : null,
        teamAvgQuality: teamAvgQuality > 0 ? Math.round(teamAvgQuality * 100) / 100 : null,
        consistencyScore: Math.round(consistencyScore * 100) / 100,
        deviation: Math.round(settingDeviation * 100) / 100,
        analysis,
        recommendations,
      },
    });

    return NextResponse.json({
      success: true,
      metrics,
    });
  } catch (err: any) {
    console.error("Analyze consistency error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to analyze consistency",
      },
      { status: 500 }
    );
  }
}

// Get consistency metrics
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const staffId = searchParams.get("staffId");
    const serviceId = searchParams.get("serviceId");

    const where: any = {};
    if (staffId) where.staffId = staffId;
    if (serviceId) where.serviceId = serviceId;

    const metrics = await prisma.consistencyMetrics.findMany({
      where,
      orderBy: { periodStart: "desc" },
    });

    return NextResponse.json({
      success: true,
      metrics,
    });
  } catch (err: any) {
    console.error("Get consistency metrics error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get metrics",
      },
      { status: 500 }
    );
  }
}

