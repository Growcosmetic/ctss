// ============================================
// Automation - List Flows
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const active = searchParams.get("active");
    const trigger = searchParams.get("trigger");

    const where: any = {};
    if (active !== null) {
      where.active = active === "true";
    }
    if (trigger) {
      where.trigger = trigger;
    }

    const flows = await prisma.automationFlow.findMany({
      where,
      include: {
        _count: {
          select: { logs: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      flows,
      total: flows.length,
    });
  } catch (err: any) {
    console.error("List automation flows error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to list automation flows",
      },
      { status: 500 }
    );
  }
}

