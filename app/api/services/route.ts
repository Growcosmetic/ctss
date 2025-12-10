// ============================================
// Services - List Services & Create Service
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const where: any = {};
    if (category) where.category = category;

    const services = await prisma.service.findMany({
      where,
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      success: true,
      services,
      total: services.length,
    });
  } catch (err: any) {
    console.error("List services error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to list services",
      },
      { status: 500 }
    );
  }
}

// POST /api/services - Create a new service
export async function POST(req: Request) {
  try {
    const { name, category, price, duration } = await req.json();

    if (!name || !category || price === undefined || duration === undefined) {
      return NextResponse.json(
        { success: false, error: "name, category, price, and duration are required" },
        { status: 400 }
      );
    }

    // Check if service already exists
    const existing = await prisma.service.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
        category: { equals: category, mode: "insensitive" },
      },
    });

    if (existing) {
      return NextResponse.json({
        success: false,
        error: "Service already exists",
      });
    }

    const service = await prisma.service.create({
      data: {
        name,
        category,
        price: parseInt(price),
        duration: parseInt(duration),
      },
    });

    return NextResponse.json({
      success: true,
      service,
    });
  } catch (err: any) {
    console.error("Create service error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to create service",
      },
      { status: 500 }
    );
  }
}
