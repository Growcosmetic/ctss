import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireSalonId, verifySalonAccess } from "@/lib/api-helpers";

// GET /api/bookings/[id] - Get booking by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require salonId for multi-tenant isolation
    const salonId = await requireSalonId(request);

    // Verify booking belongs to current salon
    await verifySalonAccess(salonId, "booking", params.id);

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        stylist: {
          select: {
            name: true,
          },
        },
        // bookingServices: {
        //   include: {
        //     service: true,
        //   },
        // },
        // posOrders: {
        //   take: 5,
        //   orderBy: { createdAt: "desc" },
        // },
      },
    });

    if (!booking) {
      return errorResponse("Booking not found", 404);
    }

    return successResponse(booking);
  } catch (error: any) {
    if (error.statusCode === 404 || error.statusCode === 401) {
      return errorResponse(error.message || "Booking not found", error.statusCode);
    }
    return errorResponse(error.message || "Failed to fetch booking", 500);
  }
}

// PUT /api/bookings/[id] - Update booking
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require salonId for multi-tenant isolation
    const salonId = await requireSalonId(request);

    // Verify booking belongs to current salon
    await verifySalonAccess(salonId, "booking", params.id);

    const body = await request.json();
    const {
      staffId,
      bookingDate,
      bookingTime,
      duration,
      status,
      notes,
    } = body;

    const booking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        stylistId: staffId,
        // bookingDate: bookingDate ? new Date(bookingDate) : undefined,
        // bookingTime: bookingTime ? new Date(bookingTime) : undefined,
        date: bookingDate ? new Date(bookingDate) : undefined,
        // duration,
        status,
        notes,
      },
      include: {
        customer: true,
        stylist: true,
        // bookingServices: {
        //   include: {
        //     service: true,
        //   },
        // },
      },
    });

    return successResponse(booking, "Booking updated successfully");
  } catch (error: any) {
    if (error.statusCode === 404 || error.statusCode === 401) {
      return errorResponse(error.message || "Booking not found", error.statusCode);
    }
    if (error.code === "P2025") {
      return errorResponse("Booking not found", 404);
    }
    return errorResponse(error.message || "Failed to update booking", 500);
  }
}

// DELETE /api/bookings/[id] - Cancel booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require salonId for multi-tenant isolation
    const salonId = await requireSalonId(request);

    // Verify booking belongs to current salon
    await verifySalonAccess(salonId, "booking", params.id);

    const body = await request.json();
    const { cancelledBy } = body;

    const booking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        status: "CANCELLED",
        // cancelledAt: new Date(),
        // cancelledBy: cancelledBy || "system",
      },
    });

    return successResponse(booking, "Booking cancelled successfully");
  } catch (error: any) {
    if (error.statusCode === 404 || error.statusCode === 401) {
      return errorResponse(error.message || "Booking not found", error.statusCode);
    }
    if (error.code === "P2025") {
      return errorResponse("Booking not found", 404);
    }
    return errorResponse(error.message || "Failed to cancel booking", 500);
  }
}

