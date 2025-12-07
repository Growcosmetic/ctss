// ============================================
// Inventory - Create Product
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const {
      name,
      category,
      subCategory,
      unit,
      pricePerUnit,
      stock,
      minStock,
      maxStock,
      supplier,
      expiryDate,
      imageUrl,
      notes,
    } = await req.json();

    if (!name || !category || !unit || pricePerUnit === undefined) {
      return NextResponse.json(
        { error: "name, category, unit, and pricePerUnit are required" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        category,
        subCategory: subCategory || null,
        unit,
        pricePerUnit,
        stock: stock || 0,
        minStock: minStock || null,
        maxStock: maxStock || null,
        supplier: supplier || null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        imageUrl: imageUrl || null,
        notes: notes || null,
      },
    });

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (err: any) {
    console.error("Create product error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to create product",
      },
      { status: 500 }
    );
  }
}

