// ============================================
// Hair Health - Treatment Tracking
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const {
      customerId,
      treatmentPlanId,
      weekNumber,
      healthScore,
      previousScore,
      treatmentsDone,
      productsUsed,
      notes,
      customerFeedback,
    } = await req.json();

    if (!customerId || !healthScore) {
      return NextResponse.json(
        { error: "customerId and healthScore are required" },
        { status: 400 }
      );
    }

    // Calculate improvements
    let improvement = null;
    let damageReduction = null;
    if (previousScore !== undefined && previousScore !== null) {
      improvement = ((healthScore - previousScore) / previousScore) * 100;
      
      // Estimate damage reduction (assuming damage = 100 - health score)
      const previousDamage = 100 - previousScore;
      const currentDamage = 100 - healthScore;
      damageReduction = previousDamage > 0 ? ((previousDamage - currentDamage) / previousDamage) * 100 : 0;
    }

    // Get previous tracking for AI assessment
    const previousTracking = await prisma.treatmentTracking.findFirst({
      where: {
        customerId,
        treatmentPlanId: treatmentPlanId || undefined,
      },
      orderBy: { trackedAt: "desc" },
    });

    // AI Assessment (simplified)
    let aiAssessment = null;
    if (previousScore !== undefined && improvement) {
      if (improvement > 0) {
        aiAssessment = `Tình trạng tóc cải thiện ${improvement.toFixed(1)}%. Tiếp tục phác đồ hiện tại.`;
      } else if (improvement < -5) {
        aiAssessment = `Tình trạng tóc giảm ${Math.abs(improvement).toFixed(1)}%. Cần điều chỉnh phác đồ.`;
      } else {
        aiAssessment = "Tình trạng tóc ổn định. Duy trì phác đồ.";
      }
    }

    // Create tracking record
    const tracking = await prisma.treatmentTracking.create({
      data: {
        customerId,
        treatmentPlanId: treatmentPlanId || null,
        weekNumber: weekNumber || null,
        healthScore,
        previousScore: previousScore || previousTracking?.healthScore || null,
        improvement: improvement ? Math.round(improvement * 100) / 100 : null,
        damageReduction: damageReduction ? Math.round(damageReduction * 100) / 100 : null,
        treatmentsDone: treatmentsDone || null,
        productsUsed: productsUsed || [],
        notes: notes || null,
        customerFeedback: customerFeedback || null,
        aiAssessment,
      },
    });

    return NextResponse.json({
      success: true,
      tracking,
    });
  } catch (err: any) {
    console.error("Record tracking error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to record tracking",
      },
      { status: 500 }
    );
  }
}

// Get tracking history
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    const treatmentPlanId = searchParams.get("treatmentPlanId");

    const where: any = {};
    if (customerId) where.customerId = customerId;
    if (treatmentPlanId) where.treatmentPlanId = treatmentPlanId;

    const trackings = await prisma.treatmentTracking.findMany({
      where,
      orderBy: { trackedAt: "asc" },
    });

    // Calculate overall progress
    const progress = {
      startScore: trackings[0]?.healthScore || null,
      currentScore: trackings[trackings.length - 1]?.healthScore || null,
      totalImprovement: null,
      weeksTracked: trackings.length,
    };

    if (progress.startScore && progress.currentScore) {
      progress.totalImprovement =
        ((progress.currentScore - progress.startScore) / progress.startScore) * 100;
    }

    return NextResponse.json({
      success: true,
      trackings,
      progress,
    });
  } catch (err: any) {
    console.error("Get tracking error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get tracking",
      },
      { status: 500 }
    );
  }
}

