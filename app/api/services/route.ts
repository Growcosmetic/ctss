// ============================================
// Services - List Services & Create Service
// ============================================

import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSalonId, getSalonFilter } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    // Require salonId for multi-tenant isolation
    const salonId = await requireSalonId(req);

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const isActive = searchParams.get("isActive");

    const where: any = {
      ...getSalonFilter(salonId), // Filter by salonId
    };
    if (category) {
      where.category = { equals: category, mode: "insensitive" };
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
      ];
    }
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === "true";
    }

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
export async function POST(req: NextRequest) {
  try {
    // Require salonId for multi-tenant isolation
    const salonId = await requireSalonId(req);

    const {
      name,
      code,
      category,
      categoryId, // Support both for backward compatibility
      description,
      englishName,
      englishDescription,
      price,
      duration,
      image,
      isActive,
      allowPriceOverride,
      unit,
      displayLocation,
    } = await req.json();

    if (!name || !category) {
      return NextResponse.json(
        { success: false, error: "name and category are required" },
        { status: 400 }
      );
    }

    // Use categoryId if provided, otherwise use category
    const finalCategory = categoryId || category;

    // Check if service already exists (by code if provided, otherwise by name+category)
    let existing = null;
    if (code) {
      existing = await prisma.service.findFirst({
        where: {
          ...getSalonFilter(salonId),
          code,
        },
      });
    }
    if (!existing) {
      existing = await prisma.service.findFirst({
        where: {
          ...getSalonFilter(salonId),
          name: { equals: name, mode: "insensitive" },
          category: { equals: finalCategory, mode: "insensitive" },
        },
      });
    }

    if (existing) {
      return NextResponse.json({
        success: false,
        error: "Service already exists",
      });
    }

    const service = await prisma.service.create({
      data: {
        salonId, // Multi-tenant: Assign to current salon
        name,
        code: code || null,
        category: finalCategory,
        description: description || null,
        englishName: englishName || null,
        englishDescription: englishDescription || null,
        price: price !== undefined ? parseInt(String(price)) : 0,
        duration: duration !== undefined ? parseInt(String(duration)) : 30,
        image: image || null,
        isActive: isActive !== undefined ? isActive : true,
        allowPriceOverride: allowPriceOverride !== undefined ? allowPriceOverride : false,
        unit: unit || null,
        displayLocation: displayLocation || null,
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
