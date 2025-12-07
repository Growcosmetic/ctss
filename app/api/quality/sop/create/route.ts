// ============================================
// Quality Control - Service SOP Definition
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const {
      serviceId,
      serviceName,
      steps,
      standardParams,
      prerequisites,
      materials,
      qualityStandards,
      version,
    } = await req.json();

    if (!serviceName && !serviceId) {
      return NextResponse.json(
        { error: "serviceName or serviceId is required" },
        { status: 400 }
      );
    }

    if (!steps || !Array.isArray(steps)) {
      return NextResponse.json(
        { error: "steps array is required" },
        { status: 400 }
      );
    }

    // Create or update SOP
    const existing = await prisma.serviceSOP.findFirst({
      where: {
        serviceId: serviceId || null,
        serviceName: serviceName || null,
        isActive: true,
      },
    });

    let sop;
    if (existing) {
      // Update existing
      sop = await prisma.serviceSOP.update({
        where: { id: existing.id },
        data: {
          steps,
          standardParams: standardParams || undefined,
          prerequisites: prerequisites || undefined,
          materials: materials || undefined,
          qualityStandards: qualityStandards || undefined,
          version: version || undefined,
        },
      });
    } else {
      // Create new
      sop = await prisma.serviceSOP.create({
        data: {
          serviceId: serviceId || null,
          serviceName: serviceName || "Unknown",
          steps,
          standardParams: standardParams || null,
          prerequisites: prerequisites || [],
          materials: materials || [],
          qualityStandards: qualityStandards || null,
          version: version || "1.0",
          isActive: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      sop,
    });
  } catch (err: any) {
    console.error("Create SOP error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to create SOP",
      },
      { status: 500 }
    );
  }
}

// Get SOPs
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const serviceId = searchParams.get("serviceId");
    const serviceName = searchParams.get("serviceName");

    const where: any = { isActive: true };
    if (serviceId) where.serviceId = serviceId;
    if (serviceName) where.serviceName = serviceName;

    const sops = await prisma.serviceSOP.findMany({
      where,
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      sops,
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

