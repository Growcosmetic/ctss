// ============================================
// Training - List Module Library
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const role = searchParams.get("role");
    const level = searchParams.get("level");

    const where: any = {};
    if (category) where.category = category;
    if (role) where.role = role;

    const modules = await prisma.trainingModule.findMany({
      where,
      include: {
        lessons: {
          where: level ? { level: parseInt(level) } : undefined,
          orderBy: { order: "asc" },
        },
        _count: {
          select: { lessons: true },
        },
      },
      orderBy: { order: "asc" },
    });

    // Group by category
    const grouped = modules.reduce(
      (acc: any, module) => {
        const cat = module.category || "other";
        if (!acc[cat]) {
          acc[cat] = [];
        }
        acc[cat].push(module);
        return acc;
      },
      {} as Record<string, typeof modules>
    );

    return NextResponse.json({
      success: true,
      modules,
      grouped,
      total: modules.length,
    });
  } catch (err: any) {
    console.error("List training library error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to list training library",
      },
      { status: 500 }
    );
  }
}

