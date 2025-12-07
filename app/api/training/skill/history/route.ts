// ============================================
// Training - Skill Assessment History
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const staffId = searchParams.get("staffId");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {};
    if (staffId) where.staffId = staffId;

    const assessments = await prisma.skillAssessment.findMany({
      where,
      include: {
        staff: {
          select: {
            id: true,
            name: true,
            trainingRole: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      assessments,
      total: assessments.length,
    });
  } catch (err: any) {
    console.error("Skill history error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get skill history",
      },
      { status: 500 }
    );
  }
}

