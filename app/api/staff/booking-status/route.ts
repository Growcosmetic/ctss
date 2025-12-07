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

// POST /api/staff/booking-status
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
    const { bookingId, status } = body;

    if (!bookingId || !status) {
      return errorResponse("bookingId and status are required", 400);
    }

    // Check if booking belongs to this staff
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        staff: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!booking || booking.staff?.userId !== userId) {
      return errorResponse("Unauthorized", 403);
    }

    // Update booking status
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: status,
      },
    });

    // If status is COMPLETED, auto-deduct inventory
    if (status === "COMPLETED") {
      try {
        const { autoDeductForService } = await import("@/features/inventory/services/inventoryEngine");
        await autoDeductForService(bookingId, userId);
      } catch (error) {
        console.error("Error auto-deducting inventory:", error);
        // Don't fail the status update if inventory deduction fails
      }
    }

    return successResponse(null, "Booking status updated successfully");
  } catch (error: any) {
    return errorResponse(error.message || "Failed to update booking status", 500);
  }
}

