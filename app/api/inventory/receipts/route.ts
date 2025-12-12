import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { cookies } from "next/headers";
import { addStock } from "@/features/inventory/services/inventoryEngine";

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

// POST /api/inventory/receipts - Create stock receipt
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { branchId, supplierId, items, date, notes, status, importType, totalDiscount, discountPercent } = body;

    if (!branchId || !items || !Array.isArray(items) || items.length === 0) {
      return errorResponse("branchId và items là bắt buộc", 400);
    }

    // Validate branch exists
    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
    });

    if (!branch) {
      return errorResponse("Chi nhánh không tồn tại", 404);
    }

    // Manager can only create receipts for their branch
    if (user.role === "MANAGER" && user.branchId !== branchId) {
      return errorResponse("Bạn chỉ có thể tạo phiếu nhập cho chi nhánh của mình", 403);
    }

    // Validate supplier if provided
    if (supplierId) {
      const supplier = await prisma.supplier.findUnique({
        where: { id: supplierId },
      });
      if (!supplier) {
        return errorResponse("Nhà cung cấp không tồn tại", 404);
      }
    }

    // Validate items and calculate total
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

    // Calculate final amount with total discount
    const finalTotalDiscount = totalDiscount || (discountPercent ? (totalAmount * discountPercent) / 100 : 0);
    const finalAmount = totalAmount - finalTotalDiscount;

    // Generate receipt number
    const receiptDate = date ? new Date(date) : new Date();
    const year = receiptDate.getFullYear();
    const month = String(receiptDate.getMonth() + 1).padStart(2, "0");
    const count = await prisma.stockReceipt.count({
      where: {
        receiptNumber: {
          startsWith: `PN-${year}-${month}`,
        },
      },
    });
    const receiptNumber = `PN-${year}-${month}-${String(count + 1).padStart(4, "0")}`;

    // Create receipt
    const receipt = await prisma.stockReceipt.create({
      data: {
        receiptNumber,
        branchId,
        supplierId: supplierId || null,
        date: receiptDate,
        status: status || "DRAFT",
        importType: importType || null,
        totalAmount: totalAmount,
        totalDiscount: finalTotalDiscount,
        discountPercent: discountPercent || null,
        finalAmount: finalAmount,
        createdBy: userId,
        notes: notes || null,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discountPercent: item.discountPercent || null,
            discountAmount: item.discountAmount || null,
            totalPrice: item.totalPrice,
            notes: item.notes || null,
          })),
        },
      },
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

    // If status is COMPLETED, update stock
    if (receipt.status === "COMPLETED") {
      for (const item of items) {
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
            branchId,
            type: "IN",
            quantity: item.quantity,
            reason: `Phiếu nhập ${receiptNumber}`,
            referenceId: receipt.id,
          },
        });
      }
    }

    return successResponse(receipt, "Phiếu nhập kho đã được tạo thành công", 201);
  } catch (error: any) {
    console.error("Error creating receipt:", error);
    return errorResponse(error.message || "Không thể tạo phiếu nhập kho", 500);
  }
}

// GET /api/inventory/receipts - List stock receipts
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
    const branchId = searchParams.get("branchId");
    const status = searchParams.get("status");
    const supplierId = searchParams.get("supplierId");
    const importType = searchParams.get("importType");
    const receiptNumber = searchParams.get("receiptNumber");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

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

    const where: any = {};

    // Manager can only see receipts for their branch
    if (user.role === "MANAGER" && user.branchId) {
      where.branchId = user.branchId;
    } else if (branchId) {
      where.branchId = branchId;
    }

    if (status) {
      where.status = status;
    }

    if (supplierId) {
      where.supplierId = supplierId;
    }

    if (importType) {
      where.importType = importType;
    }

    if (receiptNumber) {
      where.receiptNumber = {
        contains: receiptNumber,
        mode: "insensitive",
      };
    }

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) {
        where.date.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.date.lte = new Date(dateTo);
      }
    }

    const [receipts, total] = await Promise.all([
      prisma.stockReceipt.findMany({
        where,
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
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip: offset,
      }),
      prisma.stockReceipt.count({ where }),
    ]);

    return successResponse({
      receipts,
      total,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error("Error fetching receipts:", error);
    return errorResponse(error.message || "Failed to fetch receipts", 500);
  }
}
