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

// GET /api/staff/checklist?bookingId=xxx
export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const bookingId = searchParams.get("bookingId");

    if (!bookingId) {
      return errorResponse("bookingId is required", 400);
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

    // Get checklist from booking metadata or return null
    // For now, we'll store checklist in a JSON field or separate table
    // This is a simplified version - in production, you'd have a Checklist model
    const checklist = (booking as any).checklist || null;

    return successResponse(checklist);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to get checklist", 500);
  }
}

// POST /api/staff/checklist
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
    const { bookingId, checklist } = body;

    if (!bookingId || !checklist) {
      return errorResponse("bookingId and checklist are required", 400);
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

    // Save checklist (in production, use a Checklist model)
    // For now, we'll update booking metadata
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        // Store in notes or create a Checklist model
        notes: JSON.stringify({ checklist }),
      },
    });

    return successResponse(checklist, "Checklist saved successfully");
  } catch (error: any) {
    return errorResponse(error.message || "Failed to save checklist", 500);
  }
}

