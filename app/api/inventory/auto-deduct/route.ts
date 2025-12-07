import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { cookies } from "next/headers";
import { autoDeductForService } from "@/features/inventory/services/inventoryEngine";

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

// POST /api/inventory/auto-deduct
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

    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return errorResponse("Booking ID is required", 400);
    }

    // Auto-deduct is called automatically when service is completed
    // No permission check needed as it's system-triggered
    await autoDeductForService(bookingId, userId);

    return successResponse(null, "Stock deducted successfully");
  } catch (error: any) {
    console.error("Error auto-deducting stock:", error);
    return errorResponse(error.message || "Failed to deduct stock", 500);
  }
}

