import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { cookies } from "next/headers";
import { checkIn } from "@/features/salary/services/attendanceService";

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

// POST /api/salary/attendance/check-in
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
    const { location } = body; // { lat, lng } optional

    await checkIn(userId, location);

    return successResponse(null, "Checked in successfully");
  } catch (error: any) {
    console.error("Error checking in:", error);
    return errorResponse(error.message || "Failed to check in", 500);
  }
}

