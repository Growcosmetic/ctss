import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

// GET /api/bookings/[id] - Get booking by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        staff: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        bookingServices: {
          include: {
            service: true,
          },
        },
        posOrders: {
          take: 5,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!booking) {
      return errorResponse("Booking not found", 404);
    }

    return successResponse(booking);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to fetch booking", 500);
  }
}

// PUT /api/bookings/[id] - Update booking
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
        staffId,
        bookingDate: bookingDate ? new Date(bookingDate) : undefined,
        bookingTime: bookingTime ? new Date(bookingTime) : undefined,
        duration,
        status,
        notes,
      },
      include: {
        customer: true,
        staff: true,
        bookingServices: {
          include: {
            service: true,
          },
        },
      },
    });

    return successResponse(booking, "Booking updated successfully");
  } catch (error: any) {
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
    const body = await request.json();
    const { cancelledBy } = body;

    const booking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
        cancelledBy: cancelledBy || "system",
      },
    });

    return successResponse(booking, "Booking cancelled successfully");
  } catch (error: any) {
    if (error.code === "P2025") {
      return errorResponse("Booking not found", 404);
    }
    return errorResponse(error.message || "Failed to cancel booking", 500);
  }
}

