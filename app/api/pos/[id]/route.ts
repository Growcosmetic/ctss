import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireSalonId, verifySalonAccess } from "@/lib/api-helpers";

// GET /api/pos/[id] - Get POS order by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require salonId for multi-tenant isolation
    const salonId = await requireSalonId(request);

    // Verify order belongs to current salon
    await verifySalonAccess(salonId, "posOrder", params.id);

    const order = await prisma.posOrder.findUnique({
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

    if (!order) {
      return errorResponse("Order not found", 404);
    }

    return successResponse(order);
  } catch (error: any) {
    if (error.statusCode === 404 || error.statusCode === 401) {
      return errorResponse(error.message || "Order not found", error.statusCode);
    }
    return errorResponse(error.message || "Failed to fetch order", 500);
  }
}

// PUT /api/pos/[id] - Update POS order
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require salonId for multi-tenant isolation
    const salonId = await requireSalonId(request);

    // Verify order belongs to current salon
    await verifySalonAccess(salonId, "posOrder", params.id);

    const body = await request.json();
    const {
      status,
      discount,
      tax,
      notes,
    } = body;

    const order = await prisma.posOrder.findUnique({
      where: { id: params.id },
      include: { posItems: true },
    });

    if (!order) {
      return errorResponse("Order not found", 404);
    }

    // Recalculate total if discount or tax changed
    let total = order.total;
    if (discount !== undefined || tax !== undefined) {
      const subtotal = order.subtotal;
      const finalDiscount = discount !== undefined ? parseFloat(discount) : order.discount;
      const finalTax = tax !== undefined ? parseFloat(tax) : order.tax;
      total = subtotal - finalDiscount + finalTax;
    }

    const updatedOrder = await prisma.posOrder.update({
      where: { id: params.id },
      data: {
        status,
        discount: discount !== undefined ? parseFloat(discount) : undefined,
        tax: tax !== undefined ? parseFloat(tax) : undefined,
        total,
        notes,
      },
      include: {
        customer: true,
        staff: true,
        posItems: {
          include: {
            service: true,
            product: true,
          },
        },
        payments: true,
      },
    });

    return successResponse(updatedOrder, "Order updated successfully");
  } catch (error: any) {
    if (error.statusCode === 404 || error.statusCode === 401) {
      return errorResponse(error.message || "Order not found", error.statusCode);
    }
    if (error.code === "P2025") {
      return errorResponse("Order not found", 404);
    }
    return errorResponse(error.message || "Failed to update order", 500);
  }
}

// DELETE /api/pos/[id] - Cancel POS order
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require salonId for multi-tenant isolation
    const salonId = await requireSalonId(request);

    // Verify order belongs to current salon
    await verifySalonAccess(salonId, "posOrder", params.id);

    const order = await prisma.posOrder.findUnique({
      where: { id: params.id },
      include: { posItems: true },
    });

    if (!order) {
      return errorResponse("Order not found", 404);
    }

    // If order is completed, restore inventory
    if (order.status === "COMPLETED") {
      for (const item of order.posItems) {
        if (item.productId) {
          await prisma.inventoryLog.create({
            data: {
              productId: item.productId,
              type: "RETURN",
              quantity: item.quantity,
              unitPrice: Number(item.price),
              reference: order.orderNo,
              notes: `Order cancellation ${order.orderNo}`,
            },
          });

          await prisma.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: {
                increment: item.quantity,
              },
            },
          });
        }
      }
    }

    const cancelledOrder = await prisma.posOrder.update({
      where: { id: params.id },
      data: {
        status: "CANCELLED",
      },
    });

    return successResponse(cancelledOrder, "Order cancelled successfully");
  } catch (error: any) {
    if (error.statusCode === 404 || error.statusCode === 401) {
      return errorResponse(error.message || "Order not found", error.statusCode);
    }
    if (error.code === "P2025") {
      return errorResponse("Order not found", 404);
    }
    return errorResponse(error.message || "Failed to cancel order", 500);
  }
}
