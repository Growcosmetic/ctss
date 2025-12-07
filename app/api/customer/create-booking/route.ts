import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { cookies } from "next/headers";
import { parseISO, setHours, setMinutes } from "date-fns";

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

    const body = await request.json();
    const { serviceIds, staffId, bookingDate, bookingTime, notes } = body;

    if (!serviceIds || !Array.isArray(serviceIds) || serviceIds.length === 0) {
      return errorResponse("Service IDs are required", 400);
    }

    if (!bookingDate || !bookingTime) {
      return errorResponse("Booking date and time are required", 400);
    }

    // Get services to calculate duration and total
    const services = await prisma.service.findMany({
      where: {
        id: { in: serviceIds },
      },
      include: {
        servicePrices: {
          where: {
            isActive: true,
          },
          orderBy: {
            effectiveFrom: "desc",
          },
          take: 1,
        },
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
      const price = service.servicePrices[0]?.price || 0;
      totalAmount += Number(price);
    }

    // Parse booking date and time
    const bookingDateTime = parseISO(`${bookingDate}T${bookingTime}`);
    const bookingDateOnly = new Date(bookingDate);

    // Get system user for createdBy (or use a default system user)
    const systemUser = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (!systemUser) {
      return errorResponse("System user not found", 500);
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        customerId,
        staffId: staffId || null,
        bookingDate: bookingDateOnly,
        bookingTime: bookingDateTime,
        duration: totalDuration,
        status: "PENDING",
        notes: notes || null,
        totalAmount,
        createdById: systemUser.id,
        bookingServices: {
          create: services.map((service) => ({
            serviceId: service.id,
            price: service.servicePrices[0]?.price || 0,
            duration: service.duration,
          })),
        },
      },
      include: {
        bookingServices: {
          include: {
            service: true,
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
    });

    return successResponse(booking, "Booking created successfully");
  } catch (error: any) {
    console.error("Error creating booking:", error);
    return errorResponse(error.message || "Failed to create booking", 500);
  }
}

