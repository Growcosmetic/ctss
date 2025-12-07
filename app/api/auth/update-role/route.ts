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

// POST /api/auth/update-role (admin-only)
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return errorResponse("Not authenticated", 401);
    }

    const currentUserId = validateToken(token);
    if (!currentUserId) {
      return errorResponse("Invalid token", 401);
    }

    // Check if current user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
    });

    if (!currentUser || currentUser.role !== "ADMIN") {
      return errorResponse("Only admin can update roles", 403);
    }

    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return errorResponse("userId and role are required", 400);
    }

    // Validate role
    const validRoles = ["ADMIN", "MANAGER", "RECEPTIONIST", "STYLIST", "ASSISTANT"];
    if (!validRoles.includes(role)) {
      return errorResponse("Invalid role", 400);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    // Return user (without password)
    const { password: _, ...userWithoutPassword } = updatedUser;

    return successResponse(userWithoutPassword, "Role updated successfully");
  } catch (error: any) {
    return errorResponse(error.message || "Failed to update role", 500);
  }
}

