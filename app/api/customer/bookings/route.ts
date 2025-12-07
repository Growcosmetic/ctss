import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { cookies } from "next/headers";

// Simple token validation
function validateCustomerToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [customerId] = decoded.split(":");
    return customerId || null;
  } catch {
    return null;
  }
}

// GET /api/customer/bookings
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("customer-token")?.value;

    if (!token) {
      return errorResponse("Not authenticated", 401);
    }

    const customerId = validateCustomerToken(token);
    if (!customerId) {
      return errorResponse("Invalid token", 401);
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status"); // "upcoming" | "history" | null (all)

    const where: any = {
      customerId,
    };

    if (status === "upcoming") {
      where.status = {
        in: ["PENDING", "CONFIRMED", "IN_PROGRESS"],
      };
      where.bookingTime = {
        gte: new Date(),
      };
    } else if (status === "history") {
      where.status = {
        in: ["COMPLETED", "CANCELLED", "NO_SHOW"],
      };
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        bookingServices: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
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
      },
      orderBy: {
        bookingTime: status === "upcoming" ? "asc" : "desc",
      },
    });

    const formattedBookings = bookings.map((booking) => ({
      id: booking.id,
      bookingDate: booking.bookingDate.toISOString(),
      bookingTime: booking.bookingTime.toISOString(),
      duration: booking.duration,
      status: booking.status,
      services: booking.bookingServices.map((bs) => ({
        id: bs.service.id,
        name: bs.service.name,
        price: Number(bs.price),
      })),
      stylist: booking.staff
        ? {
            id: booking.staff.id,
            name: `${booking.staff.user.firstName} ${booking.staff.user.lastName}`,
          }
        : null,
      totalAmount: Number(booking.totalAmount),
      notes: booking.notes,
    }));

    return successResponse(formattedBookings);
  } catch (error: any) {
    console.error("Error fetching customer bookings:", error);
    return errorResponse(error.message || "Failed to fetch bookings", 500);
  }
}

