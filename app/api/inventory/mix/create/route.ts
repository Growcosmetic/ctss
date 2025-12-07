// ============================================
// Inventory - Create Mix Log (Pha chế)
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const {
      serviceId,
      visitId,
      staffId,
      products, // Array of { productId, quantity, expectedQty?, note? }
      note,
      imageUrl,
    } = await req.json();

    if (!staffId || !products || products.length === 0) {
      return NextResponse.json(
        { error: "staffId and products are required" },
        { status: 400 }
      );
    }

    const mixLogs = [];
    let totalCost = 0;

    for (const item of products) {
      const { productId, quantity, expectedQty, note: itemNote } = item;

      // Get product
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        continue; // Skip invalid products
      }

      // Check stock
      if (product.stock < quantity) {
        return NextResponse.json(
          {
            error: `Không đủ tồn kho cho ${product.name}. Hiện tại: ${product.stock} ${product.unit}`,
          },
          { status: 400 }
        );
      }

      // Calculate cost
      const cost = quantity * product.pricePerUnit;
      totalCost += cost;

      // Create mix log
      const mixLog = await prisma.mixLog.create({
        data: {
          serviceId: serviceId || null,
          visitId: visitId || null,
          staffId,
          productId,
          quantity: expectedQty || quantity, // Use expectedQty if provided
          expectedQty: expectedQty || null,
          actualQty: quantity,
          cost,
          note: itemNote || note || null,
          imageUrl: imageUrl || null,
        },
      });

      mixLogs.push(mixLog);

      // Update product stock (auto stock out)
      await prisma.product.update({
        where: { id: productId },
        data: {
          stock: {
            decrement: quantity,
          },
        },
      });

      // Create stock log for mix
      await prisma.stockLog.create({
        data: {
          productId,
          type: "MIX",
          quantity: -quantity,
          note: `Pha chế cho ${serviceId ? `service ${serviceId}` : "dịch vụ"}`,
          referenceId: serviceId || visitId || null,
          createdBy: staffId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      mixLogs,
      totalCost,
      message: `Đã ghi log pha chế ${mixLogs.length} sản phẩm. Tổng chi phí: ${totalCost.toLocaleString("vi-VN")}đ`,
    });
  } catch (err: any) {
    console.error("Create mix log error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to create mix log",
      },
      { status: 500 }
    );
  }
}

