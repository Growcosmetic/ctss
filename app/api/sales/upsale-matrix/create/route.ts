// ============================================
// Sales Upsale Matrix - Create upsale matrix
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const {
      serviceId,
      serviceName,
      recommendedServices,
      recommendedProducts,
      upsaleType,
      priority,
      conversionRate,
      conditions,
      script,
      benefits,
    } = await req.json();

    if (!serviceName && !serviceId) {
      return NextResponse.json(
        { error: "serviceName or serviceId is required" },
        { status: 400 }
      );
    }

    const matrix = await prisma.upsaleMatrix.create({
      data: {
        serviceId: serviceId || null,
        serviceName: serviceName || "Unknown",
        recommendedServices: recommendedServices || [],
        recommendedProducts: recommendedProducts || [],
        upsaleType: upsaleType || "PRODUCT",
        priority: priority || 0,
        conversionRate: conversionRate || null,
        conditions: conditions || null,
        script: script || null,
        benefits: benefits || [],
      },
    });

    return NextResponse.json({
      success: true,
      matrix,
    });
  } catch (err: any) {
    console.error("Create upsale matrix error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to create upsale matrix",
      },
      { status: 500 }
    );
  }
}

// Get upsale matrix
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const serviceId = searchParams.get("serviceId");
    const serviceName = searchParams.get("serviceName");
    const upsaleType = searchParams.get("upsaleType");

    const where: any = { isActive: true };
    if (serviceId) where.serviceId = serviceId;
    if (serviceName) where.serviceName = serviceName;
    if (upsaleType) where.upsaleType = upsaleType;

    const matrices = await prisma.upsaleMatrix.findMany({
      where,
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({
      success: true,
      matrices,
      total: matrices.length,
    });
  } catch (err: any) {
    console.error("Get upsale matrix error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get upsale matrix",
      },
      { status: 500 }
    );
  }
}

