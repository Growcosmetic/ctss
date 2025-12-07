// ============================================
// Training Module - Get/Update/Delete Module
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const module = await prisma.trainingModule.findUnique({
      where: { id: params.id },
      include: {
        lessons: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!module) {
      return NextResponse.json(
        { error: "Module not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      module,
    });
  } catch (err: any) {
    console.error("Get module error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load module" },
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
    const { title, desc, order } = body;

    const module = await prisma.trainingModule.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(desc !== undefined && { desc }),
        ...(order !== undefined && { order }),
      },
    });

    return NextResponse.json({
      success: true,
      module,
    });
  } catch (err: any) {
    console.error("Update module error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update module" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.trainingModule.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Module deleted successfully",
    });
  } catch (err: any) {
    console.error("Delete module error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete module" },
      { status: 500 }
    );
  }
}

