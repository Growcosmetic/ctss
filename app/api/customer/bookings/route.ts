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
        service: {
          select: {
            id: true,
            name: true,
          },
        },
        stylist: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        date: status === "upcoming" ? "asc" : "desc",
      },
    });

    const formattedBookings = bookings.map((booking) => ({
      id: booking.id,
      bookingDate: booking.date.toISOString().split("T")[0],
      bookingTime: booking.date.toISOString(),
      duration: 0, // Duration not available in Booking model
      status: booking.status,
      services: booking.service ? [{
        id: booking.service.id,
        name: booking.service.name,
        price: 0, // Price not available in Booking model
      }] : [],
      stylist: booking.stylist
        ? {
            id: booking.stylist.id,
            name: booking.stylist.name,
          }
        : null,
      totalAmount: 0, // Total amount not available in Booking model
      notes: booking.notes,
    }));

    return successResponse(formattedBookings);
  } catch (error: any) {
    console.error("Error fetching customer bookings:", error);
    return errorResponse(error.message || "Failed to fetch bookings", 500);
  }
}

