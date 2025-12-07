import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

// GET /api/bookings - Get all bookings
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const customerId = searchParams.get("customerId");
    const staffId = searchParams.get("staffId");
    const date = searchParams.get("date");

    const skip = (page - 1) * limit;

    const where: any = {};
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
    const body = await request.json();
    const {
      customerId,
      staffId,
      bookingDate,
      bookingTime,
      duration,
      notes,
      items,
      createdById,
    } = body;

    if (!customerId || !bookingDate || !bookingTime || !items || !Array.isArray(items) || items.length === 0) {
      return errorResponse("Customer, booking date, time, and items are required", 400);
    }

    // Calculate total amount
    const totalAmount = items.reduce((sum: number, item: any) => {
      return sum + (parseFloat(item.price) || 0);
    }, 0);

    const booking = await prisma.booking.create({
      data: {
        customerId,
        stylistId: staffId,
        date: new Date(bookingDate),
        // bookingTime: new Date(bookingTime),
        // duration: duration || items.reduce((sum: number, item: any) => sum + (item.duration || 0), 0),
        status: "PENDING",
        branchId: "default-branch-id", // TODO: Get from request or context
        // totalAmount,
        // createdById: createdById || "system",
        // bookingServices: {
        //   create: items.map((item: any) => ({
        //     serviceId: item.serviceId,
        //     price: item.price,
        //     duration: item.duration,
        //     notes: item.notes,
        //   })),
        // },
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

    return successResponse(booking, "Booking created successfully", 201);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to create booking", 500);
  }
}

