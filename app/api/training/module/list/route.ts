// ============================================
// Training Module - List Modules
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const modules = await prisma.trainingModule.findMany({
      orderBy: { order: "asc" },
      include: {
        lessons: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            title: true,
            order: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      modules,
    });
  } catch (err: any) {
    console.error("List training modules error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to list modules" },
      { status: 500 }
    );
  }
}

