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

// PUT /api/inventory/stock/[id]/location - Update location for a ProductStock
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
    const { locationId } = body;

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

    // Get existing ProductStock
    const stock = await prisma.productStock.findUnique({
      where: { id: params.id },
      include: {
        branch: true,
      },
    });

    if (!stock) {
      return errorResponse("Product stock not found", 404);
    }

    // Manager can only update stocks in their branch
    if (user.role === "MANAGER") {
      if (!stock.branch || stock.branch.managerId !== userId) {
        return errorResponse("Access denied", 403);
      }
    }

    // Validate location if provided
    if (locationId) {
      const location = await prisma.location.findUnique({
        where: { id: locationId },
      });

      if (!location) {
        return errorResponse("Location not found", 404);
      }

      if (location.branchId !== stock.branchId) {
        return errorResponse("Location does not belong to the same branch", 400);
      }

      if (!location.isActive) {
        return errorResponse("Location is not active", 400);
      }
    }

    // Update ProductStock
    const updatedStock = await prisma.productStock.update({
      where: { id: params.id },
      data: {
        locationId: locationId || null,
      },
      include: {
        location: {
          select: {
            id: true,
            code: true,
            zone: true,
            rack: true,
            shelf: true,
            bin: true,
          },
        },
      },
    });

    return successResponse(updatedStock, "Location updated successfully");
  } catch (error: any) {
    console.error("Error updating stock location:", error);
    return errorResponse(error.message || "Failed to update location", 500);
  }
}
