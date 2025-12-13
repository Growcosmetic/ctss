import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireSalonId, getSalonFilter } from "@/lib/api-helpers";

// GET /api/pos - Get all POS orders
export async function GET(request: NextRequest) {
  try {
    // Require salonId for multi-tenant isolation
    const salonId = await requireSalonId(request);

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const skip = (page - 1) * limit;

    const where: any = {
      ...getSalonFilter(salonId), // Filter by salonId
    };
    if (status) {
      where.status = status;
    }
    if (type) {
      where.type = type;
    }
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    const [orders, total] = await Promise.all([
      prisma.posOrder.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
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
          booking: {
            select: {
              id: true,
              bookingDate: true,
              bookingTime: true,
            },
          },
          posItems: {
            include: {
              service: true,
              product: true,
            },
          },
          payments: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.posOrder.count({ where }),
    ]);

    return successResponse({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return errorResponse(error.message || "Failed to fetch orders", 500);
  }
}

// POST /api/pos - Create a new POS order
export async function POST(request: NextRequest) {
  try {
    // Require salonId for multi-tenant isolation
    const salonId = await requireSalonId(request);

    const body = await request.json();
    const {
      customerId,
      staffId,
      bookingId,
      type,
      items,
      discount,
      tax,
      paymentMethod,
      notes,
      createdById,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return errorResponse("Items are required", 400);
    }

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => {
      return sum + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1) - (parseFloat(item.discount) || 0);
    }, 0);

    const finalDiscount = discount ? parseFloat(discount) : 0;
    const finalTax = tax ? parseFloat(tax) : 0;
    const total = subtotal - finalDiscount + finalTax;

    // Generate order number
    const orderNo = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const order = await prisma.posOrder.create({
      data: {
        salonId, // Multi-tenant: Assign to current salon
        orderNo,
        customerId,
        staffId,
        bookingId,
        type: type || "MIXED",
        status: "COMPLETED",
        subtotal,
        discount: finalDiscount,
        tax: finalTax,
        total,
        notes,
        createdById: createdById || "system",
        posItems: {
          create: items.map((item: any) => ({
            serviceId: item.serviceId,
            productId: item.productId,
            name: item.name,
            quantity: parseInt(item.quantity) || 1,
            price: parseFloat(item.price),
            discount: parseFloat(item.discount) || 0,
            subtotal: (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1) - (parseFloat(item.discount) || 0),
          })),
        },
        payments: paymentMethod
          ? {
              create: {
                amount: total,
                method: paymentMethod,
                status: "COMPLETED",
              },
            }
          : undefined,
      },
      include: {
        customer: true,
        staff: true,
        booking: true,
        posItems: {
          include: {
            service: true,
            product: true,
          },
        },
        payments: true,
      },
    });

    // Update inventory if products are sold
    for (const item of items) {
      if (item.productId && item.quantity) {
        await prisma.inventoryLog.create({
          data: {
            productId: item.productId,
            type: "SALE",
            quantity: -parseInt(item.quantity),
            unitPrice: parseFloat(item.price),
            reference: orderNo,
            notes: `Sale order ${orderNo}`,
          },
        });

        // Update product stock
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              decrement: parseInt(item.quantity),
            },
          },
        });
      }
    }

    return successResponse(order, "Order created successfully", 201);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to create order", 500);
  }
}
