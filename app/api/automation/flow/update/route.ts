// ============================================
// Automation - Update Flow
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { id, name, description, trigger, conditions, actions, active } =
      await req.json();

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (trigger !== undefined) updateData.trigger = trigger;
    if (conditions !== undefined) updateData.conditions = conditions;
    if (actions !== undefined) updateData.actions = actions;
    if (active !== undefined) updateData.active = active;

    const flow = await prisma.automationFlow.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      flow,
    });
  } catch (err: any) {
    console.error("Update automation flow error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to update automation flow",
      },
      { status: 500 }
    );
  }
}

