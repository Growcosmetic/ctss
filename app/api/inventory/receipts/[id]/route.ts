import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { cookies } from "next/headers";

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

// GET /api/inventory/receipts/[id] - Get receipt by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const receipt = await prisma.stockReceipt.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                unit: true,
                costPrice: true,
              },
            },
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
        supplier: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!receipt) {
      return errorResponse("Phiếu nhập không tồn tại", 404);
    }

    return successResponse(receipt);
  } catch (error: any) {
    console.error("Error fetching receipt:", error);
    return errorResponse(error.message || "Failed to fetch receipt", 500);
  }
}

// PUT /api/inventory/receipts/[id] - Update receipt
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check permissions
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return errorResponse("User not found", 404);
    }

    if (user.role !== "ADMIN" && user.role !== "MANAGER") {
      return errorResponse("Access denied", 403);
    }

    const receipt = await prisma.stockReceipt.findUnique({
      where: { id: params.id },
    });

    if (!receipt) {
      return errorResponse("Phiếu nhập không tồn tại", 404);
    }

    // Only allow updates if status is DRAFT
    if (receipt.status !== "DRAFT") {
      return errorResponse("Chỉ có thể sửa phiếu nhập ở trạng thái DRAFT", 400);
    }

    const body = await request.json();
    const { supplierId, items, date, notes, status, importType, totalDiscount, discountPercent } = body;

    // If updating items, recalculate total
    let updateData: any = {};
    if (items && Array.isArray(items)) {
      let totalAmount = 0;
      for (const item of items) {
        const { productId, quantity, unitPrice, discountPercent, discountAmount } = item;

        if (!productId || !quantity || quantity <= 0 || unitPrice === null || unitPrice === undefined || unitPrice < 0) {
          return errorResponse("Mỗi sản phẩm phải có productId, quantity > 0 và unitPrice >= 0", 400);
        }

        // Validate product exists
        const product = await prisma.product.findUnique({
          where: { id: productId },
        });

        if (!product) {
          return errorResponse(`Sản phẩm với ID ${productId} không tồn tại`, 404);
        }

        const itemSubtotal = quantity * unitPrice;
        const itemDiscount = discountAmount || (discountPercent ? (itemSubtotal * discountPercent) / 100 : 0);
        item.totalPrice = itemSubtotal - itemDiscount;
        totalAmount += item.totalPrice;
      }

      const finalTotalDiscount = totalDiscount || (discountPercent ? (totalAmount * discountPercent) / 100 : 0);
      const finalAmount = totalAmount - finalTotalDiscount;

      updateData.totalAmount = totalAmount;
      updateData.totalDiscount = finalTotalDiscount;
      updateData.discountPercent = discountPercent || null;
      updateData.finalAmount = finalAmount;
      updateData.items = {
        deleteMany: {},
        create: items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountPercent: item.discountPercent || null,
          discountAmount: item.discountAmount || null,
          totalPrice: item.totalPrice,
          notes: item.notes || null,
        })),
      };
    }

    if (supplierId !== undefined) {
      if (supplierId) {
        const supplier = await prisma.supplier.findUnique({
          where: { id: supplierId },
        });
        if (!supplier) {
          return errorResponse("Nhà cung cấp không tồn tại", 404);
        }
      }
      updateData.supplierId = supplierId || null;
    }

    if (importType !== undefined) {
      updateData.importType = importType || null;
    }

    if (date) {
      updateData.date = new Date(date);
    }

    if (notes !== undefined) {
      updateData.notes = notes || null;
    }

    if (status) {
      updateData.status = status;
      
      // If status changed to COMPLETED, update stock
      if (status === "COMPLETED" && receipt.status !== "COMPLETED") {
        const receiptWithItems = await prisma.stockReceipt.findUnique({
          where: { id: params.id },
          include: { items: true },
        });

        if (receiptWithItems) {
          for (const item of receiptWithItems.items) {
            // Update product stock
            await prisma.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  increment: item.quantity,
                },
                costPrice: item.unitPrice, // Update latest cost price
              },
            });

            // Create stock transaction
            await prisma.stockTransaction.create({
              data: {
                productId: item.productId,
                branchId: receipt.branchId,
                type: "IN",
                quantity: item.quantity,
                reason: `Phiếu nhập ${receipt.receiptNumber}`,
                referenceId: receipt.id,
              },
            });
          }
        }
      }
    }

    const updatedReceipt = await prisma.stockReceipt.update({
      where: { id: params.id },
      data: updateData,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                unit: true,
              },
            },
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
        supplier: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    return successResponse(updatedReceipt, "Phiếu nhập đã được cập nhật thành công");
  } catch (error: any) {
    console.error("Error updating receipt:", error);
    return errorResponse(error.message || "Không thể cập nhật phiếu nhập", 500);
  }
}

// DELETE /api/inventory/receipts/[id] - Delete receipt
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check permissions
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return errorResponse("User not found", 404);
    }

    if (user.role !== "ADMIN" && user.role !== "MANAGER") {
      return errorResponse("Access denied", 403);
    }

    const receipt = await prisma.stockReceipt.findUnique({
      where: { id: params.id },
    });

    if (!receipt) {
      return errorResponse("Phiếu nhập không tồn tại", 404);
    }

    // Only allow deletion if status is DRAFT
    if (receipt.status !== "DRAFT") {
      return errorResponse("Chỉ có thể xóa phiếu nhập ở trạng thái DRAFT", 400);
    }

    await prisma.stockReceipt.delete({
      where: { id: params.id },
    });

    return successResponse(null, "Phiếu nhập đã được xóa thành công");
  } catch (error: any) {
    console.error("Error deleting receipt:", error);
    return errorResponse(error.message || "Không thể xóa phiếu nhập", 500);
  }
}
