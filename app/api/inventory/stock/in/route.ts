// ============================================
// Inventory - Stock In (Nhập kho)
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { productId, quantity, pricePerUnit, note, createdBy } =
      await req.json();

    if (!productId || !quantity || pricePerUnit === undefined || !createdBy) {
      return NextResponse.json(
        {
          error:
            "productId, quantity, pricePerUnit, and createdBy are required",
        },
        { status: 400 }
      );
    }

    // Create stock log
    const totalCost = quantity * pricePerUnit;

    const stockLog = await prisma.stockLog.create({
      data: {
        productId,
        type: "IN",
        quantity,
        pricePerUnit,
        totalCost,
        note: note || null,
        createdBy,
      },
    });

    // Update product stock
    await prisma.product.update({
      where: { id: productId },
      data: {
        stock: {
          increment: quantity,
        },
        pricePerUnit, // Update latest price
      },
    });

    return NextResponse.json({
      success: true,
      stockLog,
      message: `Đã nhập ${quantity} ${(await prisma.product.findUnique({ where: { id: productId } }))?.unit} vào kho`,
    });
  } catch (err: any) {
    console.error("Stock in error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to stock in",
      },
      { status: 500 }
    );
  }
}

