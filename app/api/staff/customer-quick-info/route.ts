import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { cookies } from "next/headers";
import {
  generateCustomerSummary,
  detectChurnRisk,
  suggestServices,
} from "@/features/mina/services/minaEngine";

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

// GET /api/staff/customer-quick-info?customerId=xxx
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
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return errorResponse("customerId is required", 400);
    }

    // Get customer info
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        bookings: {
          include: {
            bookingServices: {
              include: {
                service: true,
              },
            },
          },
          orderBy: {
            bookingDate: "desc",
          },
          take: 3,
        },
        customerNotes: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    if (!customer) {
      return errorResponse("Customer not found", 404);
    }

    // Get last 3 services
    const lastServices = customer.bookings.map((booking) => ({
      date: booking.bookingDate.toISOString(),
      serviceName:
        booking.bookingServices[0]?.service?.name || "Dịch vụ",
    }));

    // Get Mina summary
    let minaSummary = null;
    let churnRisk = null;
    try {
      minaSummary = await generateCustomerSummary(customerId);
      churnRisk = await detectChurnRisk(customerId);
    } catch (error) {
      console.error("Error getting Mina data:", error);
    }

    // Get latest note
    const notes = customer.customerNotes[0]?.note || customer.notes || undefined;

    return successResponse({
      customerId: customer.id,
      name: `${customer.firstName} ${customer.lastName}`,
      phone: customer.phone,
      lastServices,
      minaSummary,
      churnRisk,
      notes,
      preferences: customer.preferences,
    });
  } catch (error: any) {
    return errorResponse(error.message || "Failed to get customer quick info", 500);
  }
}

