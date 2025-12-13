import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getCurrentUserId } from "@/lib/api-helpers";

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

// GET /api/admin/salons/:id - Get salon by ID (ADMIN only)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin(request);

    const salon = await prisma.salon.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            users: true,
            customers: true,
            bookings: true,
            services: true,
            products: true,
          },
        },
      },
    });

    if (!salon) {
      return errorResponse("Salon not found", 404);
    }

    return successResponse(salon);
  } catch (error: any) {
    if (error.message === "Not authenticated" || error.message === "Admin access required") {
      return errorResponse(error.message, 403);
    }
    return errorResponse(error.message || "Failed to get salon", 500);
  }
}

// PATCH /api/admin/salons/:id - Update salon (ADMIN only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin(request);

    const body = await request.json();
    const { name, slug, status } = body;

    // Check if salon exists
    const existing = await prisma.salon.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return errorResponse("Salon not found", 404);
    }

    // If slug is being updated, check for conflicts
    if (slug && slug !== existing.slug) {
      const slugRegex = /^[a-z0-9-]+$/;
      if (!slugRegex.test(slug)) {
        return errorResponse("Slug must contain only lowercase letters, numbers, and hyphens", 400);
      }

      const slugExists = await prisma.salon.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return errorResponse("Slug already exists", 409);
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (status !== undefined) updateData.status = status;

    const salon = await prisma.salon.update({
      where: { id: params.id },
      data: updateData,
    });

    return successResponse(salon, "Salon updated successfully");
  } catch (error: any) {
    if (error.message === "Not authenticated" || error.message === "Admin access required") {
      return errorResponse(error.message, 403);
    }
    if (error.code === "P2002") {
      return errorResponse("Slug already exists", 409);
    }
    return errorResponse(error.message || "Failed to update salon", 500);
  }
}

