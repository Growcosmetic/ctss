// ============================================
// Automation - Create Flow
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, description, trigger, conditions, actions, active } =
      await req.json();

    if (!name || !trigger || !actions || !Array.isArray(actions)) {
      return NextResponse.json(
        { error: "name, trigger, and actions are required" },
        { status: 400 }
      );
    }

    const flow = await prisma.automationFlow.create({
      data: {
        name,
        description: description || null,
        trigger,
        conditions: conditions || {},
        actions,
        active: active !== undefined ? active : true,
      },
    });

    return NextResponse.json({
      success: true,
      flow,
    });
  } catch (err: any) {
    console.error("Create automation flow error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to create automation flow",
      },
      { status: 500 }
    );
  }
}

