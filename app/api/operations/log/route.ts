// ============================================
// Operations - Log Operation Action
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId, role, sopStep, action, customerId, meta } = await req.json();

    if (!role || !sopStep || !action) {
      return NextResponse.json(
        { error: "role, sopStep, and action are required" },
        { status: 400 }
      );
    }

    const log = await prisma.operationLog.create({
      data: {
        userId: userId || null,
        role,
        sopStep,
        action,
        customerId: customerId || null,
        meta: meta || null,
      },
    });

    return NextResponse.json({
      success: true,
      log,
    });
  } catch (err: any) {
    console.error("Create operation log error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to create operation log",
      },
      { status: 500 }
    );
  }
}

