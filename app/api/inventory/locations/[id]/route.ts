import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { cookies } from "next/headers";

// Simple token validation
function validateToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [userId] = decoded.split(":");
    return userId || null;
  } catch {
    return null;
  }
}

// GET /api/inventory/locations/[id] - Get a single location
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return errorResponse("Not authenticated", 401);
    }

    const userId = validateToken(token);
    if (!userId) {
      return errorResponse("Invalid token", 401);
    }

    const location = await prisma.location.findUnique({
      where: { id: params.id },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
        productStocks: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                unit: true,
              },
            },
          },
        },
      },
    });

    if (!location) {
      return errorResponse("Location not found", 404);
    }

    return successResponse(location);
  } catch (error: any) {
    console.error("Error fetching location:", error);
    return errorResponse(error.message || "Failed to fetch location", 500);
  }
}

// PUT /api/inventory/locations/[id] - Update a location
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return errorResponse("Not authenticated", 401);
    }

    const userId = validateToken(token);
    if (!userId) {
      return errorResponse("Invalid token", 401);
    }

    const body = await request.json();
    const { code, zone, rack, shelf, bin, description, capacity, isActive } = body;

    // Check permissions
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return errorResponse("User not found", 404);
    }

    if (user.role !== "ADMIN" && user.role !== "MANAGER") {
      return errorResponse("Access denied", 403);
    }

    // Get existing location
    const existing = await prisma.location.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return errorResponse("Location not found", 404);
    }

    // Manager can only update locations in their branch
    if (user.role === "MANAGER") {
      const branch = await prisma.branch.findUnique({
        where: { id: existing.branchId },
      });

      if (!branch || branch.managerId !== userId) {
        return errorResponse("Access denied", 403);
      }
    }

    // Check if code is being changed and if it conflicts
    if (code && code.toUpperCase().trim() !== existing.code) {
      const codeExists = await prisma.location.findFirst({
        where: {
          branchId: existing.branchId,
          code: code.toUpperCase().trim(),
        },
      });

      if (codeExists) {
        return errorResponse("Location code already exists for this branch", 409);
      }
    }

    const location = await prisma.location.update({
      where: { id: params.id },
      data: {
        code: code ? code.toUpperCase().trim() : undefined,
        zone: zone !== undefined ? (zone?.trim() || null) : undefined,
        rack: rack !== undefined ? (rack?.trim() || null) : undefined,
        shelf: shelf !== undefined ? (shelf?.trim() || null) : undefined,
        bin: bin !== undefined ? (bin?.trim() || null) : undefined,
        description: description !== undefined ? (description?.trim() || null) : undefined,
        capacity: capacity !== undefined ? (capacity ? parseInt(capacity.toString()) : null) : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
    });

    return successResponse(location, "Location updated successfully");
  } catch (error: any) {
    console.error("Error updating location:", error);
    if (error.code === "P2002") {
      return errorResponse("Location code already exists", 409);
    }
    return errorResponse(error.message || "Failed to update location", 500);
  }
}

// DELETE /api/inventory/locations/[id] - Delete a location (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return errorResponse("Not authenticated", 401);
    }

    const userId = validateToken(token);
    if (!userId) {
      return errorResponse("Invalid token", 401);
    }

    // Check permissions
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return errorResponse("User not found", 404);
    }

    if (user.role !== "ADMIN" && user.role !== "MANAGER") {
      return errorResponse("Access denied", 403);
    }

    // Get existing location
    const existing = await prisma.location.findUnique({
      where: { id: params.id },
      include: {
        productStocks: true,
      },
    });

    if (!existing) {
      return errorResponse("Location not found", 404);
    }

    // Manager can only delete locations in their branch
    if (user.role === "MANAGER") {
      const branch = await prisma.branch.findUnique({
        where: { id: existing.branchId },
      });

      if (!branch || branch.managerId !== userId) {
        return errorResponse("Access denied", 403);
      }
    }

    // Check if location has products assigned
    if (existing.productStocks.length > 0) {
      // Soft delete - set isActive to false
      const location = await prisma.location.update({
        where: { id: params.id },
        data: {
          isActive: false,
        },
      });

      return successResponse(location, "Location deactivated (has products assigned)");
    }

    // Hard delete if no products assigned
    await prisma.location.delete({
      where: { id: params.id },
    });

    return successResponse(null, "Location deleted successfully");
  } catch (error: any) {
    console.error("Error deleting location:", error);
    return errorResponse(error.message || "Failed to delete location", 500);
  }
}
