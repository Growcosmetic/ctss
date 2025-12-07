// ============================================
// Stylist Assistant - Hair Simulation
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const {
      customerId,
      recommendationId,
      originalImageUrl,
      style,
      color,
      length,
      simulationType,
    } = await req.json();

    if (!originalImageUrl) {
      return NextResponse.json(
        { error: "originalImageUrl is required" },
        { status: 400 }
      );
    }

    // Create simulation record
    const simulation = await prisma.hairSimulation.create({
      data: {
        customerId: customerId || null,
        recommendationId: recommendationId || null,
        originalImageUrl,
        style: style || null,
        color: color || null,
        length: length || null,
        simulationType: simulationType || "FULL",
        status: "PENDING",
        progress: 0,
      },
    });

    // TODO: In production, trigger AI image generation service here
    // For now, return pending status
    // Example: Call Replicate, Midjourney API, or custom AI service

    return NextResponse.json({
      success: true,
      simulation,
      message: "Simulation created. Processing will start shortly.",
    });
  } catch (err: any) {
    console.error("Create simulation error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to create simulation",
      },
      { status: 500 }
    );
  }
}

// Update simulation (when AI processing completes)
export async function PATCH(req: Request) {
  try {
    const { id, simulatedImageUrl, status, progress } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }

    const simulation = await prisma.hairSimulation.update({
      where: { id },
      data: {
        simulatedImageUrl: simulatedImageUrl || undefined,
        status: status || undefined,
        progress: progress !== undefined ? progress : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      simulation,
    });
  } catch (err: any) {
    console.error("Update simulation error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to update simulation",
      },
      { status: 500 }
    );
  }
}

// Get simulations
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    const status = searchParams.get("status");

    const where: any = {};
    if (customerId) where.customerId = customerId;
    if (status) where.status = status;

    const simulations = await prisma.hairSimulation.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      simulations,
    });
  } catch (err: any) {
    console.error("Get simulations error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get simulations",
      },
      { status: 500 }
    );
  }
}

