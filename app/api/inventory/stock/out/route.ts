// ============================================
// Inventory - Stock Out (Xuất kho)
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { productId, quantity, type, note, referenceId, createdBy } =
      await req.json();

    if (!productId || !quantity || !createdBy) {
      return NextResponse.json(
        { error: "productId, quantity, and createdBy are required" },
        { status: 400 }
      );
    }

    // Check stock availability
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        {
          error: `Không đủ tồn kho. Hiện tại: ${product.stock} ${product.unit}`,
        },
        { status: 400 }
      );
    }

    // Create stock log
    const stockLog = await prisma.stockLog.create({
      data: {
        productId,
        type: type || "OUT",
        quantity: -quantity, // Negative for OUT
        note: note || null,
        referenceId: referenceId || null,
        createdBy,
      },
    });

    // Update product stock
    await prisma.product.update({
      where: { id: productId },
      data: {
        stock: {
          decrement: quantity,
        },
      },
    });

    return NextResponse.json({
      success: true,
      stockLog,
      message: `Đã xuất ${quantity} ${product.unit} khỏi kho`,
    });
  } catch (err: any) {
    console.error("Stock out error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to stock out",
      },
      { status: 500 }
    );
  }
}

