// ============================================
// Training - List Roleplay Sessions
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const role = searchParams.get("role");
    const status = searchParams.get("status");

    const where: any = {};
    if (userId) where.userId = userId;
    if (role) where.role = role;
    if (status) where.status = status;

    const sessions = await prisma.roleplaySession.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            trainingRole: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    // Calculate stats
    const stats = {
      total: sessions.length,
      completed: sessions.filter((s) => s.status === "completed").length,
      active: sessions.filter((s) => s.status === "active").length,
      averageScore:
        sessions
          .filter((s) => s.score !== null)
          .reduce((sum, s) => sum + (s.score || 0), 0) /
        sessions.filter((s) => s.score !== null).length || 0,
    };

    return NextResponse.json({
      success: true,
      sessions,
      stats,
    });
  } catch (err: any) {
    console.error("List roleplay sessions error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to list sessions",
      },
      { status: 500 }
    );
  }
}

