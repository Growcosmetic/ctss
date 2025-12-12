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

// GET /api/inventory/issues/[id] - Get issue by ID
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

    const issue = await prisma.stockIssue.findUnique({
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
                pricePerUnit: true,
                stock: true,
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
        staff: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    if (!issue) {
      return errorResponse("Phiếu xuất không tồn tại", 404);
    }

    return successResponse(issue);
  } catch (error: any) {
    console.error("Error fetching issue:", error);
    return errorResponse(error.message || "Failed to fetch issue", 500);
  }
}

// PUT /api/inventory/issues/[id] - Update issue
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

    const issue = await prisma.stockIssue.findUnique({
      where: { id: params.id },
    });

    if (!issue) {
      return errorResponse("Phiếu xuất không tồn tại", 404);
    }

    // Only allow updates if status is DRAFT
    if (issue.status !== "DRAFT") {
      return errorResponse("Chỉ có thể sửa phiếu xuất ở trạng thái DRAFT", 400);
    }

    const body = await request.json();
    const { reason, staffId, recipientId, recipientName, items, date, notes, status } = body;

    // If updating items, recalculate total and validate stock
    let updateData: any = {};
    if (items && Array.isArray(items)) {
      let totalAmount = 0;
      for (const item of items) {
        const { productId, quantity, unitPrice } = item;

        if (!productId || !quantity || quantity <= 0) {
          return errorResponse("Mỗi sản phẩm phải có productId và quantity > 0", 400);
        }

        // Validate product exists and check stock
        const product = await prisma.product.findUnique({
          where: { id: productId },
        });

        if (!product) {
          return errorResponse(`Sản phẩm với ID ${productId} không tồn tại`, 404);
        }

        if (product.stock < quantity) {
          return errorResponse(
            `Không đủ tồn kho cho sản phẩm "${product.name}". Tồn kho hiện tại: ${product.stock} ${product.unit}`,
            400
          );
        }

        // Calculate price
        const price = unitPrice !== undefined && unitPrice !== null ? unitPrice : (product.pricePerUnit || 0);
        item.unitPrice = price;
        item.totalPrice = quantity * price;
        totalAmount += item.totalPrice;
      }

      updateData.totalAmount = totalAmount;
      updateData.items = {
        deleteMany: {},
        create: items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          notes: item.notes || null,
        })),
      };
    }

    if (reason) {
      updateData.reason = reason;
    }

    if (recipientId !== undefined) {
      updateData.recipientId = recipientId || null;
    }

    if (recipientName !== undefined) {
      updateData.recipientName = recipientName || null;
    }

    if (staffId !== undefined) {
      if (staffId) {
        const staff = await prisma.user.findUnique({
          where: { id: staffId },
        });
        if (!staff) {
          return errorResponse("Nhân viên không tồn tại", 404);
        }
      }
      updateData.staffId = staffId || null;
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
      if (status === "COMPLETED" && issue.status !== "COMPLETED") {
        const issueWithItems = await prisma.stockIssue.findUnique({
          where: { id: params.id },
          include: { items: true },
        });

        if (issueWithItems) {
          for (const item of issueWithItems.items) {
            // Update product stock
            await prisma.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
            });

            // Create stock transaction
            await prisma.stockTransaction.create({
              data: {
                productId: item.productId,
                branchId: issue.branchId,
                type: "OUT",
                quantity: -item.quantity, // Negative for OUT
                reason: `Phiếu xuất ${issue.issueNumber} - ${issue.reason}`,
                referenceId: issue.id,
              },
            });
          }
        }
      }
    }

    const updatedIssue = await prisma.stockIssue.update({
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
        staff: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    return successResponse(updatedIssue, "Phiếu xuất đã được cập nhật thành công");
  } catch (error: any) {
    console.error("Error updating issue:", error);
    return errorResponse(error.message || "Không thể cập nhật phiếu xuất", 500);
  }
}

// DELETE /api/inventory/issues/[id] - Delete issue
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

    const issue = await prisma.stockIssue.findUnique({
      where: { id: params.id },
    });

    if (!issue) {
      return errorResponse("Phiếu xuất không tồn tại", 404);
    }

    // Only allow deletion if status is DRAFT
    if (issue.status !== "DRAFT") {
      return errorResponse("Chỉ có thể xóa phiếu xuất ở trạng thái DRAFT", 400);
    }

    await prisma.stockIssue.delete({
      where: { id: params.id },
    });

    return successResponse(null, "Phiếu xuất đã được xóa thành công");
  } catch (error: any) {
    console.error("Error deleting issue:", error);
    return errorResponse(error.message || "Không thể xóa phiếu xuất", 500);
  }
}
