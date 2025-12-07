// ============================================
// Content Library - Delete Content
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.contentLibrary.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Content deleted successfully",
    });
  } catch (err: any) {
    console.error("Content library delete error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete content" },
      { status: 500 }
    );
  }
}

