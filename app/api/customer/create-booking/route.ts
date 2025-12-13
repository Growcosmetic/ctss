import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { cookies } from "next/headers";
import { parseISO, setHours, setMinutes } from "date-fns";
import { getCurrentSalonId } from "@/lib/api-helpers";

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

// POST /api/customer/create-booking
export async function POST(request: NextRequest) {
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

    // Get salonId from customer
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { salonId: true },
    });

    if (!customer) {
      return errorResponse("Customer not found", 404);
    }

    const salonId = customer.salonId;

    const body = await request.json();
    const { serviceIds, staffId, bookingDate, bookingTime, notes, branchId } = body;

    if (!serviceIds || !Array.isArray(serviceIds) || serviceIds.length === 0) {
      return errorResponse("Service IDs are required", 400);
    }

    if (!bookingDate || !bookingTime) {
      return errorResponse("Booking date and time are required", 400);
    }

    // Get services to calculate duration and total (filter by salonId)
    const services = await prisma.service.findMany({
      where: {
        id: { in: serviceIds },
        salonId, // Multi-tenant: Filter by salonId
      },
    });

    if (services.length !== serviceIds.length) {
      return errorResponse("Some services not found", 400);
    }

    // Calculate total duration and amount
    let totalDuration = 0;
    let totalAmount = 0;

    for (const service of services) {
      totalDuration += service.duration;
      const price = service.price || 0;
      totalAmount += Number(price);
    }

    // Parse booking date and time
    const bookingDateTime = parseISO(`${bookingDate}T${bookingTime}`);
    const bookingDateOnly = new Date(bookingDate);
    const endDateTime = new Date(bookingDateTime.getTime() + totalDuration * 60 * 1000);

    // Check for conflicts with buffer time (default 10 minutes)
    const bufferTime = 10;
    if (staffId) {
      const { checkBookingConflicts } = await import("@/lib/bookingUtils");
      const conflicts = await checkBookingConflicts(
        staffId,
        bookingDateTime,
        endDateTime,
        bufferTime,
        undefined, // excludeBookingId
        salonId // Multi-tenant: Pass salonId
      );

      if (conflicts) {
        return errorResponse(
          `Khung giờ này đã được đặt (có buffer ${bufferTime} phút). Vui lòng chọn thời gian khác.`,
          409
        );
      }
    }

    // Create booking in transaction to avoid race condition
    const booking = await prisma.$transaction(async (tx) => {
      // Double-check conflicts within transaction
      if (staffId) {
        const { checkBookingConflicts } = await import("@/lib/bookingUtils");
        const recheckConflicts = await checkBookingConflicts(
          staffId,
          bookingDateTime,
          endDateTime,
          bufferTime,
          undefined, // excludeBookingId
          salonId // Multi-tenant: Pass salonId
        );

        if (recheckConflicts) {
          throw new Error("Booking conflict detected during transaction");
        }
      }

      return await tx.booking.create({
      data: {
        salonId, // Multi-tenant: Assign to customer's salon
        customerId,
        stylistId: staffId || null,
        date: bookingDateTime,
        status: "PENDING",
        notes: notes || null,
        branchId: branchId || (await prisma.branch.findFirst({ where: { isActive: true } }))?.id || "", // Get first active branch or require branchId
        serviceId: services[0]?.id || null, // Only first service, Booking model doesn't support multiple services
      },
      include: {
        service: true,
        stylist: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    });

    return successResponse(booking, "Booking created successfully");
  } catch (error: any) {
    console.error("Error creating booking:", error);
    if (error.message?.includes("conflict")) {
      return errorResponse(
        "Khung giờ này đã được đặt. Vui lòng chọn thời gian khác.",
        409
      );
    }
    return errorResponse(error.message || "Failed to create booking", 500);
  }
}

