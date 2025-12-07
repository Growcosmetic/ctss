// ============================================
// Services - List Services
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const where: any = {};
    if (category) where.category = category;

    const services = await prisma.service.findMany({
      where,
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      success: true,
      services,
      total: services.length,
    });
  } catch (err: any) {
    console.error("List services error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to list services",
      },
      { status: 500 }
    );
  }
}
