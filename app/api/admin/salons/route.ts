import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getCurrentUserId } from "@/lib/api-helpers";
import { cookies } from "next/headers";

// Helper to check if user is ADMIN
async function requireAdmin(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("Not authenticated");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user || user.role !== "ADMIN") {
    throw new Error("Admin access required");
  }
}

// GET /api/admin/salons - List all salons (ADMIN only)
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");

    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }
    if (status) {
      where.status = status;
    }

    const [salons, total] = await Promise.all([
      prisma.salon.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: {
              users: true,
              customers: true,
              bookings: true,
            },
          },
        },
      }),
      prisma.salon.count({ where }),
    ]);

    return successResponse({
      salons,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    if (error.message === "Not authenticated" || error.message === "Admin access required") {
      return errorResponse(error.message, 403);
    }
    return errorResponse(error.message || "Failed to list salons", 500);
  }
}

// POST /api/admin/salons - Create a new salon (ADMIN only)
export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);

    const body = await request.json();
    const { name, slug, status } = body;

    if (!name || !slug) {
      return errorResponse("Name and slug are required", 400);
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      return errorResponse("Slug must contain only lowercase letters, numbers, and hyphens", 400);
    }

    // Check if slug already exists
    const existing = await prisma.salon.findUnique({
      where: { slug },
    });

    if (existing) {
      return errorResponse("Slug already exists", 409);
    }

    const salon = await prisma.salon.create({
      data: {
        name,
        slug,
        status: status || "ACTIVE",
      },
    });

    return successResponse(salon, "Salon created successfully", 201);
  } catch (error: any) {
    if (error.message === "Not authenticated" || error.message === "Admin access required") {
      return errorResponse(error.message, 403);
    }
    if (error.code === "P2002") {
      return errorResponse("Slug already exists", 409);
    }
    return errorResponse(error.message || "Failed to create salon", 500);
  }
}

