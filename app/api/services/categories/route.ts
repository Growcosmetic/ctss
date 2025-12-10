// ============================================
// Services - Get Service Categories
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    // Get all unique categories from services
    const services = await prisma.service.findMany({
      select: {
        category: true,
      },
      distinct: ["category"],
      orderBy: {
        category: "asc",
      },
    });

    // Convert to array of objects with id and name
    const categories = services.map((s) => ({
      id: s.category,
      name: s.category,
    }));

    return NextResponse.json({
      success: true,
      data: categories,
      total: categories.length,
    });
  } catch (err: any) {
    console.error("Get categories error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get categories",
        data: [],
      },
      { status: 500 }
    );
  }
}
