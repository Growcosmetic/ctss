import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { parseISO } from "date-fns";
import { checkBookingConflicts } from "@/lib/bookingUtils";
import { requireSalonId, getSalonFilter } from "@/lib/api-helpers";

// GET /api/bookings - Get all bookings
export async function GET(request: NextRequest) {
  try {
    // Require salonId for multi-tenant isolation
    const salonId = await requireSalonId(request);
    
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const customerId = searchParams.get("customerId");
    const staffId = searchParams.get("staffId");
    const date = searchParams.get("date");

    const skip = (page - 1) * limit;

    const where: any = {
      ...getSalonFilter(salonId), // Filter by salonId
    };
    if (status) {
      where.status = status;
    }
    if (customerId) {
      where.customerId = customerId;
    }
    if (staffId) {
      where.stylistId = staffId;
    }
    if (date) {
      where.date = new Date(date);
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
          stylist: {
            select: {
              id: true,
              name: true,
            },
          },
          // bookingServices: {
          //   include: {
          //     service: true,
          //   },
          // },
        },
        orderBy: { date: "desc" },
      }),
      prisma.booking.count({ where }),
    ]);

    return successResponse({
      bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return errorResponse(error.message || "Failed to fetch bookings", 500);
  }
}

// POST /api/bookings - Create a new booking
export async function POST(request: NextRequest) {
  try {
    // Require salonId for multi-tenant isolation
    const salonId = await requireSalonId(request);
    
    const body = await request.json();
    const {
      customerId,
      staffId,
      bookingDate,
      bookingTime,
      duration,
      bufferTime = 10, // Default 10 minutes buffer
      notes,
      items,
      createdById,
    } = body;

    // Validation
    if (!customerId || !bookingDate || !bookingTime) {
      return errorResponse("Customer, booking date, and time are required", 400);
    }

    if (!staffId) {
      return errorResponse("Staff ID is required", 400);
    }

    // Verify customer belongs to current salon
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { salonId: true },
    });

    if (!customer) {
      return errorResponse("Customer not found", 404);
    }

    if (customer.salonId !== salonId) {
      return errorResponse("Access denied: Customer does not belong to your salon", 403);
    }

    // Verify staff belongs to current salon
    const staff = await prisma.user.findUnique({
      where: { id: staffId },
      select: { salonId: true },
    });

    if (!staff) {
      return errorResponse("Staff not found", 404);
    }

    if (staff.salonId !== salonId) {
      return errorResponse("Access denied: Staff does not belong to your salon", 403);
    }

    // Get service duration if items provided
    let totalDuration = duration;
    if (!totalDuration && items && Array.isArray(items) && items.length > 0) {
      // Try to get duration from items
      totalDuration = items.reduce((sum: number, item: any) => sum + (item.duration || 0), 0);
      
      // If still no duration, fetch from service
      if (!totalDuration && items[0]?.serviceId) {
        const service = await prisma.service.findUnique({
          where: { id: items[0].serviceId },
          select: { duration: true },
        });
        totalDuration = service?.duration || 60; // Default 60 minutes
      }
    }

    if (!totalDuration) {
      totalDuration = 60; // Default 60 minutes if still not found
    }

    // Parse booking date and time
    const startDateTime = parseISO(`${bookingDate}T${bookingTime}`);
    const endDateTime = new Date(startDateTime.getTime() + totalDuration * 60 * 1000);

    // Validate buffer time
    const bufferMinutes = Math.max(0, Math.min(60, Number(bufferTime) || 10));

    // Check for conflicts with buffer time
    const conflicts = await checkBookingConflicts(
      staffId,
      startDateTime,
      endDateTime,
      bufferMinutes,
      undefined, // excludeBookingId
      salonId // Multi-tenant: Pass salonId
    );

    if (conflicts) {
      const conflictDetails = conflicts.map(c => 
        c.customerName ? `khách hàng ${c.customerName}` : "một lịch hẹn khác"
      ).join(", ");
      
      return errorResponse(
        `Khung giờ này đã được đặt (có buffer ${bufferMinutes} phút) với ${conflictDetails}. Vui lòng chọn thời gian khác.`,
        409
      );
    }

    // Create booking in transaction to avoid race condition
    const booking = await prisma.$transaction(async (tx) => {
      // Double-check conflicts within transaction
      const recheckConflicts = await checkBookingConflicts(
        staffId,
        startDateTime,
        endDateTime,
        bufferMinutes,
        undefined, // excludeBookingId
        salonId // Multi-tenant: Pass salonId
      );

      if (recheckConflicts) {
        throw new Error("Booking conflict detected during transaction");
      }

      // Calculate total amount if items provided
      const totalAmount = items && Array.isArray(items)
        ? items.reduce((sum: number, item: any) => sum + (parseFloat(item.price) || 0), 0)
        : 0;

      // Create booking
      return await tx.booking.create({
        data: {
          salonId, // Multi-tenant: Assign to current salon
          customerId,
          stylistId: staffId,
          date: startDateTime,
          status: "PENDING",
          branchId: "default-branch-id", // TODO: Get from request or context
          serviceId: items && items.length > 0 ? items[0].serviceId : null,
          notes: notes || null,
        },
        include: {
          customer: true,
          stylist: true,
          service: {
            select: {
              id: true,
              name: true,
              duration: true,
            },
          },
        },
      });
    });

    return successResponse(booking, "Booking created successfully", 201);
  } catch (error: any) {
    if (error.message?.includes("conflict")) {
      return errorResponse(
        "Khung giờ này đã được đặt. Vui lòng chọn thời gian khác.",
        409
      );
    }
    return errorResponse(error.message || "Failed to create booking", 500);
  }
}

