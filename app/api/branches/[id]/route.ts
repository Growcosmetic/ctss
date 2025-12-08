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

// GET /api/branches/:id
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

    const branch = await prisma.branch.findUnique({
      where: { id: params.id },
    });

    if (!branch) {
      return errorResponse("Branch not found", 404);
    }

    // Check permissions
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return errorResponse("User not found", 404);
    }

    if (user.role === "ADMIN") {
      return successResponse(branch);
    }

    if (user.role === "MANAGER" && branch.managerId === userId) {
      return successResponse(branch);
    }

    // Check if user's staff is assigned to this branch
    const staff = await prisma.staff.findUnique({
      where: { userId },
      include: {
        branchStaff: {
          where: { branchId: params.id },
        },
      },
    });

    if (staff && staff.branchStaff.length > 0) {
      return successResponse(branch);
    }

    return errorResponse("Access denied", 403);
  } catch (error: any) {
    console.error("Error fetching branch:", error);
    return errorResponse(error.message || "Failed to fetch branch", 500);
  }
}

// PUT /api/branches/:id
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

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
      return errorResponse("Access denied", 403);
    }

    const branch = await prisma.branch.findUnique({
      where: { id: params.id },
    });

    if (!branch) {
      return errorResponse("Branch not found", 404);
    }

    // Manager can only edit their own branch
    if (user.role === "MANAGER" && branch.managerId !== userId) {
      return errorResponse("Access denied", 403);
    }

    const body = await request.json();
    const { name, address, phone, email, managerId, isActive } = body;

    const updatedBranch = await prisma.branch.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(address !== undefined && { address }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(managerId !== undefined && { managerId }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return successResponse(updatedBranch, "Branch updated successfully");
  } catch (error: any) {
    console.error("Error updating branch:", error);
    return errorResponse(error.message || "Failed to update branch", 500);
  }
}

