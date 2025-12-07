// ============================================
// SOP - Add SOP
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { step, title, detail, role } = body;

    // Validation
    if (!step || !title || !detail || !role) {
      return NextResponse.json(
        { error: "step, title, detail, and role are required" },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ["receptionist", "stylist", "assistant", "online", "all"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(", ")}` },
        { status: 400 }
      );
    }

    // Create SOP
    const sop = await prisma.sOP.create({
      data: {
        step,
        title,
        detail,
        role,
      },
    });

    return NextResponse.json({
      success: true,
      sop,
    });
  } catch (err: any) {
    console.error("Add SOP error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to add SOP",
      },
      { status: 500 }
    );
  }
}

