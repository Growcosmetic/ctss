// ============================================
// Automation - Delete Flow
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    await prisma.automationFlow.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Flow deleted successfully",
    });
  } catch (err: any) {
    console.error("Delete automation flow error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to delete automation flow",
      },
      { status: 500 }
    );
  }
}

