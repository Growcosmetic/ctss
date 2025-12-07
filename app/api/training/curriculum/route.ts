// ============================================
// Training Curriculum - Get All Curriculum
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
        },
      },
    });

    return NextResponse.json({
      success: true,
      modules,
      totalModules: modules.length,
      totalLessons: modules.reduce(
        (sum, module) => sum + module.lessons.length,
        0
      ),
    });
  } catch (err: any) {
    console.error("Get curriculum error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load curriculum" },
      { status: 500 }
    );
  }
}
