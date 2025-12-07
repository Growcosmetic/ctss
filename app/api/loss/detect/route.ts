// ============================================
// Loss Detection - Detect loss from mix logs
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getThreshold, calculateSeverity } from "@/lib/thresholds";

export async function POST(req: Request) {
  try {
    const { mixLogId } = await req.json();

    if (!mixLogId) {
      return NextResponse.json(
        { error: "mixLogId is required" },
        { status: 400 }
      );
    }

    // Get mix log
    const mixLog = await prisma.mixLog.findUnique({
      where: { id: mixLogId },
      include: {
        product: true,
        staff: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!mixLog) {
      return NextResponse.json(
        { error: "Mix log not found" },
        { status: 404 }
      );
    }

    // Calculate loss
    if (!mixLog.expectedQty || mixLog.expectedQty <= 0) {
      return NextResponse.json({
        success: true,
        detected: false,
        reason: "No expected quantity to compare",
      });
    }

    const lossQty = mixLog.actualQty - mixLog.expectedQty;
    const lossRate = (lossQty / mixLog.expectedQty) * 100;

    // Get threshold
    const threshold = getThreshold(
      mixLog.product.category,
      undefined, // TODO: Get service category from serviceId
      mixLog.productId,
      mixLog.serviceId || undefined
    );

    // Calculate severity
    const severityResult = calculateSeverity(lossRate, threshold);

    // Check if already has alert
    const existingAlert = await prisma.lossAlert.findFirst({
      where: {
        mixLogId,
        status: { in: ["OPEN", "REVIEWED"] },
      },
    });

    if (existingAlert) {
      return NextResponse.json({
        success: true,
        detected: true,
        alertId: existingAlert.id,
        existing: true,
        lossRate,
        severity: severityResult.severity,
      });
    }

    // Create alert if loss detected
    if (severityResult.level > 0) {
      const alert = await prisma.lossAlert.create({
        data: {
          type: "LOSS",
          severity: severityResult.severity,
          productId: mixLog.productId,
          staffId: mixLog.staffId,
          serviceId: mixLog.serviceId || null,
          mixLogId: mixLog.id,
          expectedQty: mixLog.expectedQty,
          actualQty: mixLog.actualQty,
          lossQty,
          lossRate: Math.round(lossRate * 100) / 100,
          thresholdType: "PRODUCT_TYPE",
          thresholdValue: threshold?.normalMax || 10,
          deviation: lossRate - (threshold?.normalMax || 10),
          description: `Hao hụt ${lossRate.toFixed(1)}% (${lossQty.toFixed(1)}${mixLog.product.unit}) cho sản phẩm ${mixLog.product.name}`,
          status: "OPEN",
        },
        include: {
          product: true,
          staff: true,
        },
      });

      return NextResponse.json({
        success: true,
        detected: true,
        alert: {
          id: alert.id,
          severity: alert.severity,
          lossRate: alert.lossRate,
          description: alert.description,
        },
      });
    }

    return NextResponse.json({
      success: true,
      detected: false,
      lossRate,
      severity: severityResult.severity,
    });
  } catch (err: any) {
    console.error("Loss detection error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to detect loss",
      },
      { status: 500 }
    );
  }
}

// Auto-detect loss for recent mix logs
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const hours = parseInt(searchParams.get("hours") || "24");
    const limit = parseInt(searchParams.get("limit") || "100");

    const since = new Date();
    since.setHours(since.getHours() - hours);

    // Get mix logs with expectedQty
    const mixLogs = await prisma.mixLog.findMany({
      where: {
        createdAt: { gte: since },
        expectedQty: { not: null, gt: 0 },
      },
      include: {
        product: true,
        staff: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const results = [];

    for (const mixLog of mixLogs) {
      if (!mixLog.expectedQty) continue;

      const lossQty = mixLog.actualQty - mixLog.expectedQty;
      const lossRate = (lossQty / mixLog.expectedQty) * 100;

      const threshold = getThreshold(
        mixLog.product.category,
        undefined,
        mixLog.productId,
        mixLog.serviceId || undefined
      );

      const severityResult = calculateSeverity(lossRate, threshold);

      if (severityResult.level > 0) {
        // Check if alert exists
        const existing = await prisma.lossAlert.findFirst({
          where: { mixLogId: mixLog.id },
        });

        if (!existing) {
          const alert = await prisma.lossAlert.create({
            data: {
              type: "LOSS",
              severity: severityResult.severity,
              productId: mixLog.productId,
              staffId: mixLog.staffId,
              serviceId: mixLog.serviceId || null,
              mixLogId: mixLog.id,
              expectedQty: mixLog.expectedQty,
              actualQty: mixLog.actualQty,
              lossQty,
              lossRate: Math.round(lossRate * 100) / 100,
              thresholdType: "PRODUCT_TYPE",
              thresholdValue: threshold?.normalMax || 10,
              deviation: lossRate - (threshold?.normalMax || 10),
              description: `Hao hụt ${lossRate.toFixed(1)}% (${lossQty.toFixed(1)}${mixLog.product.unit}) cho sản phẩm ${mixLog.product.name}`,
              status: "OPEN",
            },
          });

          results.push({
            mixLogId: mixLog.id,
            alertId: alert.id,
            severity: alert.severity,
            lossRate: alert.lossRate,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      detected: results.length,
      alerts: results,
    });
  } catch (err: any) {
    console.error("Auto loss detection error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to auto-detect loss",
      },
      { status: 500 }
    );
  }
}

