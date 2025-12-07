// ============================================
// Training Lesson - Add Lesson
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { moduleId, title, content, order } = body;

    // Validation
    if (!moduleId || !title) {
      return NextResponse.json(
        { error: "moduleId and title are required" },
        { status: 400 }
      );
    }

    // Verify module exists
    const module = await prisma.trainingModule.findUnique({
      where: { id: moduleId },
    });

    if (!module) {
      return NextResponse.json(
        { error: "Module not found" },
        { status: 404 }
      );
    }

    // If order not provided, get next order in module
    let finalOrder = order;
    if (finalOrder === undefined || finalOrder === null) {
      const maxOrder = await prisma.trainingLesson.findFirst({
        where: { moduleId },
        orderBy: { order: "desc" },
        select: { order: true },
      });
      finalOrder = (maxOrder?.order || 0) + 1;
    }

    const lesson = await prisma.trainingLesson.create({
      data: {
        moduleId,
        title,
        content: content || null,
        order: finalOrder,
      },
    });

    return NextResponse.json({
      success: true,
      lesson,
    });
  } catch (err: any) {
    console.error("Add training lesson error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to add lesson" },
      { status: 500 }
    );
  }
}
