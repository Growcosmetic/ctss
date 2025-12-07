// ============================================
// Inventory - List Products
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const lowStock = searchParams.get("lowStock") === "true";

    const where: any = {};
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { subCategory: { contains: search, mode: "insensitive" } },
      ];
    }
    if (lowStock) {
      where.AND = [
        { minStock: { not: null } },
        { stock: { lte: prisma.product.fields.minStock } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        _count: {
          select: {
            stockLogs: true,
            mixLogs: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      success: true,
      products,
      total: products.length,
    });
  } catch (err: any) {
    console.error("List products error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to list products",
      },
      { status: 500 }
    );
  }
}

