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

// GET /api/branches/:id/staff
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

    if (user.role !== "ADMIN" && user.role !== "MANAGER") {
      return errorResponse("Access denied", 403);
    }

    if (user.role === "MANAGER" && branch.managerId !== userId) {
      return errorResponse("Access denied", 403);
    }

    const branchStaff = await prisma.branchStaffAssignment.findMany({
      where: {
        branchId: params.id,
        isActive: true,
      },
      include: {
        staff: {
          select: {
            id: true,
            name: true,
            phone: true,
            role: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return successResponse(branchStaff);
  } catch (error: any) {
    console.error("Error fetching branch staff:", error);
    return errorResponse(error.message || "Failed to fetch branch staff", 500);
  }
}

