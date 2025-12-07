// ============================================
// SOP - Get SOPs
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { role } = body;

    // Build where clause
    const where: any = {};
    if (role && role !== "all") {
      where.role = role;
    }

    // Get SOPs
    const sops = await prisma.sOP.findMany({
      where,
      orderBy: { step: "asc" },
    });

    return NextResponse.json({
      success: true,
      sops,
      total: sops.length,
    });
  } catch (err: any) {
    console.error("Get SOPs error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get SOPs",
      },
      { status: 500 }
    );
  }
}

// Also support GET for backward compatibility
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");

    const where: any = {};
    if (role && role !== "all") {
      where.role = role;
    }

    const sops = await prisma.sOP.findMany({
      where,
      orderBy: { step: "asc" },
    });

    return NextResponse.json({
      success: true,
      sops,
      total: sops.length,
    });
  } catch (err: any) {
    console.error("Get SOPs error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get SOPs",
      },
      { status: 500 }
    );
  }
}

