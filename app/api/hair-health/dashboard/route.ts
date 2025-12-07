// ============================================
// Hair Health - Dashboard
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json(
        { error: "customerId is required" },
        { status: 400 }
      );
    }

    // Get latest scan
    const latestScan = await prisma.hairHealthScan.findFirst({
      where: { customerId },
      orderBy: { createdAt: "desc" },
    });

    // Get latest damage assessment
    const latestDamage = await prisma.damageLevelAssessment.findFirst({
      where: { customerId },
      orderBy: { createdAt: "desc" },
    });

    // Get latest porosity analysis
    const latestPorosity = await prisma.porosityElasticityAnalysis.findFirst({
      where: { customerId },
      orderBy: { createdAt: "desc" },
    });

    // Get latest chemical risk
    const latestRisk = await prisma.chemicalHistoryRisk.findFirst({
      where: { customerId },
      orderBy: { createdAt: "desc" },
    });

    // Get latest scalp analysis
    const latestScalp = await prisma.scalpConditionAnalysis.findFirst({
      where: { customerId },
      orderBy: { createdAt: "desc" },
    });

    // Get active treatment plan
    const activePlan = await prisma.treatmentPlan.findFirst({
      where: {
        customerId,
        status: "ACTIVE",
      },
      orderBy: { createdAt: "desc" },
    });

    // Get tracking history
    const tracking = await prisma.treatmentTracking.findMany({
      where: {
        customerId,
        treatmentPlanId: activePlan?.id || undefined,
      },
      orderBy: { trackedAt: "asc" },
    });

    // Calculate health trend
    const healthTrend = tracking.map((t) => ({
      week: t.weekNumber || 0,
      score: t.healthScore,
      improvement: t.improvement,
      date: t.trackedAt,
    }));

    // Summary
    const summary = {
      currentHealthScore: latestScan?.healthScore || null,
      damageLevel: latestDamage?.damageLevel || null,
      damageCategory: latestDamage?.damageCategory || null,
      porosity: latestPorosity?.porosity || null,
      elasticity: latestPorosity?.elasticity || null,
      riskLevel: latestRisk?.riskLevel || null,
      scalpCondition: latestScalp?.scalpType || null,
      hasActivePlan: !!activePlan,
      treatmentProgress: healthTrend.length > 0 ? {
        startScore: healthTrend[0].score,
        currentScore: healthTrend[healthTrend.length - 1].score,
        totalImprovement: healthTrend.length > 1
          ? ((healthTrend[healthTrend.length - 1].score - healthTrend[0].score) / healthTrend[0].score) * 100
          : 0,
      } : null,
    };

    return NextResponse.json({
      success: true,
      dashboard: {
        summary,
        latestScan,
        latestDamage,
        latestPorosity,
        latestRisk,
        latestScalp,
        activePlan,
        tracking,
        healthTrend,
      },
    });
  } catch (err: any) {
    console.error("Get hair health dashboard error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get dashboard",
      },
      { status: 500 }
    );
  }
}

