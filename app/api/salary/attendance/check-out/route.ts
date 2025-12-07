import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { cookies } from "next/headers";
import { checkOut } from "@/features/salary/services/attendanceService";

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

// POST /api/salary/attendance/check-out
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

    // User is the staff (direct relation)
    const body = await request.json();
    const { notes } = body;

    await checkOut(userId, notes);

    return successResponse(null, "Checked out successfully");
  } catch (error: any) {
    console.error("Error checking out:", error);
    return errorResponse(error.message || "Failed to check out", 500);
  }
}

