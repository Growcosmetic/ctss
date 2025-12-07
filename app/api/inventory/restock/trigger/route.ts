// ============================================
// Auto Restock Trigger - Check and create triggers
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Check and create restock triggers
export async function POST(req: Request) {
  try {
    const { productId } = await req.json();

    const where: any = { status: "ACTIVE" };
    if (productId) where.productId = productId;

    // Get all active projections
    const projections = await prisma.inventoryProjection.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            unit: true,
            stock: true,
            minStock: true,
          },
        },
      },
    });

    const triggers: any[] = [];

    for (const projection of projections) {
      const product = projection.product;
      const currentStock = product.stock || 0;
      const safetyStock = product.minStock || 0;

      // Check 1: Low stock (below safety stock)
      if (currentStock < safetyStock && safetyStock > 0) {
        const existing = await prisma.restockTrigger.findFirst({
          where: {
            productId: product.id,
            triggerType: "LOW_STOCK",
            status: "ACTIVE",
          },
        });

        if (!existing) {
          const trigger = await prisma.restockTrigger.create({
            data: {
              productId: product.id,
              triggerType: "LOW_STOCK",
              severity: currentStock < safetyStock * 0.5 ? "URGENT" : "WARNING",
              currentStock,
              threshold: safetyStock,
              message: `Tồn kho (${currentStock}${product.unit}) thấp hơn mức an toàn (${safetyStock}${product.unit})`,
            },
          });
          triggers.push(trigger);
        }
      }

      // Check 2: Projected out (will run out soon)
      if (projection.daysUntilEmpty && projection.daysUntilEmpty < 10) {
        const existing = await prisma.restockTrigger.findFirst({
          where: {
            productId: product.id,
            triggerType: "PROJECTED_OUT",
            status: "ACTIVE",
          },
        });

        if (!existing) {
          const severity =
            projection.daysUntilEmpty < 5
              ? "URGENT"
              : projection.daysUntilEmpty < 7
              ? "WARNING"
              : "INFO";

          const trigger = await prisma.restockTrigger.create({
            data: {
              productId: product.id,
              triggerType: "PROJECTED_OUT",
              severity,
              currentStock,
              threshold: projection.daysUntilEmpty,
              message: `Dự báo hết trong ${Math.round(projection.daysUntilEmpty)} ngày`,
            },
          });
          triggers.push(trigger);
        }
      }

      // Check 3: Increased usage (trend factor > 1.1)
      if (projection.trendFactor && projection.trendFactor > 1.1) {
        const existing = await prisma.restockTrigger.findFirst({
          where: {
            productId: product.id,
            triggerType: "INCREASED_USAGE",
            status: "ACTIVE",
          },
        });

        if (!existing) {
          const trigger = await prisma.restockTrigger.create({
            data: {
              productId: product.id,
              triggerType: "INCREASED_USAGE",
              severity: "INFO",
              currentStock,
              threshold: projection.trendFactor,
              message: `Lượng dùng tăng ${((projection.trendFactor - 1) * 100).toFixed(0)}% so với trung bình`,
            },
          });
          triggers.push(trigger);
        }
      }
    }

    return NextResponse.json({
      success: true,
      triggersCreated: triggers.length,
      triggers,
    });
  } catch (err: any) {
    console.error("Create restock triggers error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to create restock triggers",
      },
      { status: 500 }
    );
  }
}

// Get active triggers
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const severity = searchParams.get("severity");
    const triggerType = searchParams.get("triggerType");

    const where: any = { status: "ACTIVE" };
    if (severity) where.severity = severity;
    if (triggerType) where.triggerType = triggerType;

    const triggers = await prisma.restockTrigger.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            unit: true,
            category: true,
            stock: true,
          },
        },
      },
      orderBy: [
        { severity: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({
      success: true,
      triggers,
      total: triggers.length,
    });
  } catch (err: any) {
    console.error("Get triggers error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get triggers",
      },
      { status: 500 }
    );
  }
}

