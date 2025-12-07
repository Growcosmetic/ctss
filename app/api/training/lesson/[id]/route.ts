// ============================================
// Training Lesson - Get/Update/Delete Lesson
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const lesson = await prisma.trainingLesson.findUnique({
      where: { id: params.id },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            order: true,
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      lesson,
    });
  } catch (err: any) {
    console.error("Get lesson error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load lesson" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { title, content, order, moduleId } = body;

    const lesson = await prisma.trainingLesson.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(content !== undefined && { content }),
        ...(order !== undefined && { order }),
        ...(moduleId && { moduleId }),
      },
    });

    return NextResponse.json({
      success: true,
      lesson,
    });
  } catch (err: any) {
    console.error("Update lesson error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update lesson" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.trainingLesson.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Lesson deleted successfully",
    });
  } catch (err: any) {
    console.error("Delete lesson error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete lesson" },
      { status: 500 }
    );
  }
}

