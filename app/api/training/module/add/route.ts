// ============================================
// Training Module - Add Module
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, desc, order } = body;

    // Validation
    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // If order not provided, get next order
    let finalOrder = order;
    if (finalOrder === undefined || finalOrder === null) {
      const maxOrder = await prisma.trainingModule.findFirst({
        orderBy: { order: "desc" },
        select: { order: true },
      });
      finalOrder = (maxOrder?.order || 0) + 1;
    }

    const module = await prisma.trainingModule.create({
      data: {
        title,
        desc: desc || null,
        order: finalOrder,
      },
    });

    return NextResponse.json({
      success: true,
      module,
    });
  } catch (err: any) {
    console.error("Add training module error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to add module" },
      { status: 500 }
    );
  }
}
