import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { addPoints, getBenefits } from "@/features/loyalty/services/loyaltyEngine";

// GET /api/pos/checkout?bookingId=xxx
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const bookingId = searchParams.get("bookingId");

    if (!bookingId) {
      return errorResponse("bookingId is required", 400);
    }

    // Find invoice by bookingId
    const invoice = await prisma.invoice.findUnique({
      where: { bookingId },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        booking: {
          select: {
            id: true,
            bookingDate: true,
            bookingTime: true,
          },
        },
        invoiceItems: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
              },
            },
            product: {
              select: {
                id: true,
                name: true,
              },
            },
            staff: {
              select: {
                id: true,
                employeeId: true,
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!invoice) {
      return successResponse(null, "No invoice found", 404);
    }

    return successResponse({
      invoice,
      invoiceItems: invoice.items,
    });
  } catch (error: any) {
    return errorResponse(error.message || "Failed to fetch checkout", 500);
  }
}

// POST /api/pos/checkout
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, items, discountAmount, paymentMethod, markAsPaid } = body;

    if (!bookingId) {
      return errorResponse("bookingId is required", 400);
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return errorResponse("Items are required", 400);
    }

    // Get booking to get customerId
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: {
          select: {
            id: true,
            phone: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!booking) {
      return errorResponse("Booking not found", 404);
    }

    // If customer doesn't exist, create one from booking customer info
    let customerId = booking.customerId;
    if (!customerId && booking.customer) {
      customerId = booking.customer.id;
    } else if (!customerId) {
      // Try to find customer by phone from booking notes or create new
      // For now, we'll require customerId to exist
      // In a real scenario, you might extract phone from booking notes or other fields
      return errorResponse("Customer not found. Please ensure booking has a customer.", 400);
    }

    // Calculate subtotal from items
    const subtotal = items.reduce((sum: number, item: any) => {
      return sum + parseFloat(item.unitPrice || 0) * (parseInt(item.quantity) || 1);
    }, 0);

    const discount = discountAmount ? parseFloat(discountAmount) : 0;
    const total = subtotal - discount;

    // Check if invoice exists
    const existingInvoice = await prisma.invoice.findUnique({
      where: { bookingId },
    });

    let invoice;
    let invoiceItems;

    if (existingInvoice && existingInvoice.status === "DRAFT") {
      // Update existing invoice
      invoice = await prisma.invoice.update({
        where: { id: existingInvoice.id },
        data: {
          subtotal,
          discountAmount: discount,
          total,
          paymentMethod: paymentMethod || null,
          status: markAsPaid ? "PAID" : "DRAFT",
          updatedAt: new Date(),
        },
      });

      // Delete old items
      await prisma.invoiceItem.deleteMany({
        where: { invoiceId: invoice.id },
      });

      // Create new items
      invoiceItems = await Promise.all(
        items.map((item: any) =>
          prisma.invoiceItem.create({
            data: {
              invoiceId: invoice.id,
              serviceId: item.serviceId || null,
              productId: item.productId || null,
              staffId: item.staffId || null,
              quantity: parseInt(item.quantity) || 1,
              unitPrice: parseFloat(item.unitPrice),
              lineTotal: parseFloat(item.unitPrice) * (parseInt(item.quantity) || 1),
            },
            include: {
              service: {
                select: {
                  id: true,
                  name: true,
                },
              },
              product: {
                select: {
                  id: true,
                  name: true,
                },
              },
              staff: {
                select: {
                  id: true,
                  employeeId: true,
                  user: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
          })
        )
      );
    } else {
      // Create new invoice
      invoice = await prisma.invoice.create({
        data: {
          bookingId,
          customerId: customerId,
          subtotal,
          discountAmount: discount,
          total,
          status: markAsPaid ? "PAID" : "DRAFT",
          paymentMethod: paymentMethod || null,
        },
      });

      // Create invoice items
      invoiceItems = await Promise.all(
        items.map((item: any) =>
          prisma.invoiceItem.create({
            data: {
              invoiceId: invoice.id,
              serviceId: item.serviceId || null,
              productId: item.productId || null,
              staffId: item.staffId || null,
              quantity: parseInt(item.quantity) || 1,
              unitPrice: parseFloat(item.unitPrice),
              lineTotal: parseFloat(item.unitPrice) * (parseInt(item.quantity) || 1),
            },
            include: {
              service: {
                select: {
                  id: true,
                  name: true,
                },
              },
              product: {
                select: {
                  id: true,
                  name: true,
                },
              },
              staff: {
                select: {
                  id: true,
                  employeeId: true,
                  user: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
          })
        )
      );
    }

    // If markAsPaid, update booking status
    if (markAsPaid) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: "COMPLETED" },
      });

      // Inventory: Auto-deduct chemicals for completed service
      try {
        const { autoDeductForService } = await import("@/features/inventory/services/inventoryEngine");
        const booking = await prisma.booking.findUnique({
          where: { id: bookingId },
          select: { branchId: true },
        });
        if (booking?.branchId) {
          // Get user ID from request (would need to extract from token)
          const systemUserId = "system"; // In production, extract from auth token
          await autoDeductForService(bookingId, systemUserId);
        }
      } catch (error) {
        console.error("Error auto-deducting inventory:", error);
        // Don't fail the payment if inventory deduction fails
      }

      // POS: Deduct retail products from stock
      for (const item of items) {
        if (item.productId) {
          try {
            const { removeStock } = await import("@/features/inventory/services/inventoryEngine");
            const booking = await prisma.booking.findUnique({
              where: { id: bookingId },
              select: { branchId: true },
            });
            if (booking?.branchId) {
              const systemUserId = "system"; // In production, extract from auth token
              await removeStock(
                item.productId,
                booking.branchId,
                item.quantity,
                systemUserId,
                "pos_sale",
                invoice.id,
                `POS sale: ${item.quantity} units`
              );
            }
          } catch (error) {
            console.error(`Error deducting product ${item.productId}:`, error);
            // Continue with other products
          }
        }
      }

      // Record commissions for staff (from booking stylist)
      try {
        const { recordCommission } = await import("@/features/salary/services/salaryEngine");
        // Get staff from booking
        const booking = await prisma.booking.findUnique({
          where: { id: bookingId },
          select: { stylistId: true },
        });
        if (booking?.stylistId) {
          await recordCommission(invoice.id, booking.stylistId);
        }
      } catch (error) {
        console.error("Error recording commissions:", error);
        // Don't fail the payment if commission recording fails
      }

      // Add loyalty points and check tier upgrade
      try {
        await addPoints(customerId, invoice.id);
        // Check tier upgrade (will trigger notification if upgraded)
        const { checkTierUpgrade } = await import("@/features/notifications/services/loyaltyTriggers");
        await checkTierUpgrade(customerId);
      } catch (error) {
        console.error("Error processing loyalty:", error);
        // Don't fail the payment if loyalty fails
      }
    }

    // Fetch full invoice with relations
    const fullInvoice = await prisma.invoice.findUnique({
      where: { id: invoice.id },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        booking: {
          select: {
            id: true,
            bookingDate: true,
            bookingTime: true,
          },
        },
      },
    });

    return successResponse(
      {
        invoice: fullInvoice,
        invoiceItems,
      },
      markAsPaid ? "Payment confirmed successfully" : "Draft saved successfully"
    );
  } catch (error: any) {
    console.error("Error saving checkout:", error);
    return errorResponse(error.message || "Failed to save checkout", 500);
  }
}

