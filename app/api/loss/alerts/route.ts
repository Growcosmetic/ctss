// ============================================
// Loss Alerts - Get and manage alerts
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const severity = searchParams.get("severity");
    const type = searchParams.get("type");
    const staffId = searchParams.get("staffId");
    const productId = searchParams.get("productId");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: any = {};
    if (status) where.status = status;
    if (severity) where.severity = severity;
    if (type) where.type = type;
    if (staffId) where.staffId = staffId;
    if (productId) where.productId = productId;

    const alerts = await prisma.lossAlert.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            unit: true,
            category: true,
          },
        },
        staff: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { detectedAt: "desc" },
      take: limit,
    });

    // Group by severity
    const stats = {
      total: alerts.length,
      bySeverity: {
        CRITICAL: alerts.filter((a) => a.severity === "CRITICAL").length,
        ALERT: alerts.filter((a) => a.severity === "ALERT").length,
        WARNING: alerts.filter((a) => a.severity === "WARNING").length,
      },
      byType: {
        LOSS: alerts.filter((a) => a.type === "LOSS").length,
        FRAUD: alerts.filter((a) => a.type === "FRAUD").length,
        WASTAGE: alerts.filter((a) => a.type === "WASTAGE").length,
        INVENTORY_MISMATCH: alerts.filter(
          (a) => a.type === "INVENTORY_MISMATCH"
        ).length,
      },
      open: alerts.filter((a) => a.status === "OPEN").length,
    };

    return NextResponse.json({
      success: true,
      alerts,
      stats,
    });
  } catch (err: any) {
    console.error("Get alerts error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get alerts",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const { alertId, status, reviewedBy } = await req.json();

    if (!alertId || !status) {
      return NextResponse.json(
        { error: "alertId and status are required" },
        { status: 400 }
      );
    }

    const updateData: any = {
      status,
    };

    if (status === "REVIEWED" && !req.body.resolvedAt) {
      updateData.reviewedAt = new Date();
      if (reviewedBy) updateData.reviewedBy = reviewedBy;
    }

    if (status === "RESOLVED") {
      updateData.resolvedAt = new Date();
      if (!updateData.reviewedAt) {
        updateData.reviewedAt = new Date();
      }
    }

    const alert = await prisma.lossAlert.update({
      where: { id: alertId },
      data: updateData,
      include: {
        product: true,
        staff: true,
      },
    });

    return NextResponse.json({
      success: true,
      alert,
    });
  } catch (err: any) {
    console.error("Update alert error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to update alert",
      },
      { status: 500 }
    );
  }
}

