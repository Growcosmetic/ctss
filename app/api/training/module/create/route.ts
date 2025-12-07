// ============================================
// Training - Create Module
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { title, desc, order, category, role } = await req.json();

    if (!title || order === undefined) {
      return NextResponse.json(
        { error: "title and order are required" },
        { status: 400 }
      );
    }

    const module = await prisma.trainingModule.create({
      data: {
        title,
        desc: desc || null,
        order,
        category: category || null, // product | technical | communication | sop | culture
        role: role || null, // RECEPTIONIST | STYLIST | ASSISTANT | CSKH_ONLINE | ALL
      },
    });

    return NextResponse.json({
      success: true,
      module,
    });
  } catch (err: any) {
    console.error("Create module error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to create module",
      },
      { status: 500 }
    );
  }
}

