// ============================================
// Sales Funnel - Track funnel progress
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const {
      customerId,
      funnelStage,
      entryPoint,
      currentService,
      currentProduct,
      stepCompleted,
    } = await req.json();

    if (!funnelStage) {
      return NextResponse.json(
        { error: "funnelStage is required" },
        { status: 400 }
      );
    }

    const validStages = [
      "AWARENESS",
      "CONSIDERATION",
      "DECISION",
      "CHECKOUT",
      "POST_SERVICE",
      "RETURN",
    ];

    if (!validStages.includes(funnelStage)) {
      return NextResponse.json(
        { error: "Invalid funnel stage" },
        { status: 400 }
      );
    }

    // Get or create funnel
    let funnel = await prisma.salesFunnel.findFirst({
      where: {
        customerId: customerId || null,
        funnelStage,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!funnel) {
      funnel = await prisma.salesFunnel.create({
        data: {
          customerId: customerId || null,
          funnelStage,
          entryPoint: entryPoint || null,
          currentService: currentService || null,
          currentProduct: currentProduct || null,
          stepsCompleted: stepCompleted ? [stepCompleted] : [],
          automationActive: true,
        },
      });
    } else {
      // Update funnel
      const updatedSteps = stepCompleted
        ? [...(funnel.stepsCompleted || []), stepCompleted]
        : funnel.stepsCompleted || [];

      const timeInFunnel = funnel.createdAt
        ? Math.floor((new Date().getTime() - funnel.createdAt.getTime()) / 60000)
        : null;

      funnel = await prisma.salesFunnel.update({
        where: { id: funnel.id },
        data: {
          currentService: currentService || undefined,
          currentProduct: currentProduct || undefined,
          stepsCompleted: updatedSteps,
          currentStep: stepCompleted || undefined,
          timeInFunnel,
        },
      });
    }

    return NextResponse.json({
      success: true,
      funnel,
    });
  } catch (err: any) {
    console.error("Track funnel error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to track funnel",
      },
      { status: 500 }
    );
  }
}

// Get funnel
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    const funnelStage = searchParams.get("funnelStage");

    const where: any = {};
    if (customerId) where.customerId = customerId;
    if (funnelStage) where.funnelStage = funnelStage;

    const funnels = await prisma.salesFunnel.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // Calculate funnel metrics
    const stageCounts: Record<string, number> = {};
    for (const funnel of funnels) {
      stageCounts[funnel.funnelStage] = (stageCounts[funnel.funnelStage] || 0) + 1;
    }

    return NextResponse.json({
      success: true,
      funnels,
      stageCounts,
      total: funnels.length,
    });
  } catch (err: any) {
    console.error("Get funnel error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get funnel",
      },
      { status: 500 }
    );
  }
}

