import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { cookies } from "next/headers";
import { computeMonthlySalary } from "@/features/salary/services/salaryEngine";

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

// POST /api/salary/compute
export async function POST(request: NextRequest) {
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

    // Check permissions (Admin or Manager only)
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return errorResponse("User not found", 404);
    }

    if (user.role !== "ADMIN" && user.role !== "MANAGER") {
      return errorResponse("Access denied", 403);
    }

    const body = await request.json();
    const { staffId, month } = body;

    if (!staffId || !month) {
      return errorResponse("Staff ID and month are required", 400);
    }

    const result = await computeMonthlySalary(staffId, month);

    return successResponse(result);
  } catch (error: any) {
    console.error("Error computing salary:", error);
    return errorResponse(error.message || "Failed to compute salary", 500);
  }
}

