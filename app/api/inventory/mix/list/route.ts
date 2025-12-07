// ============================================
// Inventory - List Mix Logs
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const serviceId = searchParams.get("serviceId");
    const visitId = searchParams.get("visitId");
    const staffId = searchParams.get("staffId");
    const productId = searchParams.get("productId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = {};
    if (serviceId) where.serviceId = serviceId;
    if (visitId) where.visitId = visitId;
    if (staffId) where.staffId = staffId;
    if (productId) where.productId = productId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const mixLogs = await prisma.mixLog.findMany({
      where,
      include: {
        product: true,
        staff: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    // Calculate totals
    const totalCost = mixLogs.reduce((sum, log) => sum + log.cost, 0);
    const totalQuantity = mixLogs.reduce((sum, log) => sum + log.actualQty, 0);

    return NextResponse.json({
      success: true,
      mixLogs,
      total: mixLogs.length,
      totals: {
        cost: totalCost,
        quantity: totalQuantity,
      },
    });
  } catch (err: any) {
    console.error("List mix logs error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to list mix logs",
      },
      { status: 500 }
    );
  }
}

