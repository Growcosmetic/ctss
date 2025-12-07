// ============================================
// Training - List Certifications
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const staffId = searchParams.get("staffId");
    const role = searchParams.get("role");

    const where: any = {};
    if (staffId) where.userId = staffId;
    if (role) where.role = role;

    const certifications = await prisma.certification.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            trainingRole: true,
          },
        },
        levelData: {
          include: {
            role: true,
          },
        },
      },
      orderBy: { issuedAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      certifications,
      total: certifications.length,
    });
  } catch (err: any) {
    console.error("List certifications error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to list certifications",
      },
      { status: 500 }
    );
  }
}

