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

// POST /api/inventory/issues - Create stock issue
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
    const { branchId, reason, staffId, recipientId, recipientName, items, date, notes, status } = body;

    if (!branchId || !reason || !items || !Array.isArray(items) || items.length === 0) {
      return errorResponse("branchId, reason và items là bắt buộc", 400);
    }

    // Validate reason (accept all valid reasons)
    const validReasons = [
      "XUAT_TIEU_HAO", "XUAT_DAO_TAO", "XUAT_BAN_HOC_VIEN", "XUAT_TRA_HANG_NCC",
      "XUAT_HUY_HONG_HOC", "XUAT_CHO_TANG", "XUAT_DONG_GOI", "XUAT_HANG_SVC",
      "XUAT_KHAC", "BAN_HANG", "SU_DUNG", "BAN_NHAN_VIEN", "KHÁC"
    ];
    if (!validReasons.includes(reason)) {
      return errorResponse(`reason không hợp lệ`, 400);
    }

    // Validate branch exists
    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
    });

    if (!branch) {
      return errorResponse("Chi nhánh không tồn tại", 404);
    }

    // Manager can only create issues for their branch
    if (user.role === "MANAGER" && user.branchId !== branchId) {
      return errorResponse("Bạn chỉ có thể tạo phiếu xuất cho chi nhánh của mình", 403);
    }

    // Validate staff if provided
    if (staffId) {
      const staff = await prisma.user.findUnique({
        where: { id: staffId },
      });
      if (!staff) {
        return errorResponse("Nhân viên không tồn tại", 404);
      }
    }

    // Validate items, check stock availability, and calculate total
    let totalAmount = 0;
    for (const item of items) {
      const { productId, quantity, unitPrice } = item;

      if (!productId || !quantity || quantity <= 0) {
        return errorResponse("Mỗi sản phẩm phải có productId và quantity > 0", 400);
      }

      // Validate product exists
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        return errorResponse(`Sản phẩm với ID ${productId} không tồn tại`, 404);
      }

      // Check stock availability
      if (product.stock < quantity) {
        return errorResponse(
          `Không đủ tồn kho cho sản phẩm "${product.name}". Tồn kho hiện tại: ${product.stock} ${product.unit}`,
          400
        );
      }

      // Calculate price (use unitPrice if provided, otherwise use product price)
      const price = unitPrice !== undefined && unitPrice !== null ? unitPrice : (product.pricePerUnit || 0);
      item.unitPrice = price;
      item.totalPrice = quantity * price;
      totalAmount += item.totalPrice;
    }

    // Generate issue number
    const issueDate = date ? new Date(date) : new Date();
    const year = issueDate.getFullYear();
    const month = String(issueDate.getMonth() + 1).padStart(2, "0");
    const count = await prisma.stockIssue.count({
      where: {
        issueNumber: {
          startsWith: `PX-${year}-${month}`,
        },
      },
    });
    const issueNumber = `PX-${year}-${month}-${String(count + 1).padStart(4, "0")}`;

    // Create issue
    const issue = await prisma.stockIssue.create({
      data: {
        issueNumber,
        branchId,
        reason,
        recipientId: recipientId || null,
        recipientName: recipientName || null,
        staffId: staffId || null,
        date: issueDate,
        status: status || "DRAFT",
        totalAmount,
        createdBy: userId,
        notes: notes || null,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
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
        staff: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    // If status is COMPLETED, update stock
    if (issue.status === "COMPLETED") {
      for (const item of items) {
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
            branchId,
            type: "OUT",
            quantity: -item.quantity, // Negative for OUT
            reason: `Phiếu xuất ${issueNumber} - ${reason}`,
            referenceId: issue.id,
          },
        });
      }
    }

    return successResponse(issue, "Phiếu xuất kho đã được tạo thành công", 201);
  } catch (error: any) {
    console.error("Error creating issue:", error);
    return errorResponse(error.message || "Không thể tạo phiếu xuất kho", 500);
  }
}

// GET /api/inventory/issues - List stock issues
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
    const reason = searchParams.get("reason");
    const issueNumber = searchParams.get("issueNumber");
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

    // Manager can only see issues for their branch
    if (user.role === "MANAGER" && user.branchId) {
      where.branchId = user.branchId;
    } else if (branchId) {
      where.branchId = branchId;
    }

    if (status) {
      where.status = status;
    }

    if (reason) {
      where.reason = reason;
    }

    if (issueNumber) {
      where.issueNumber = {
        contains: issueNumber,
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

    const [issues, total] = await Promise.all([
      prisma.stockIssue.findMany({
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
          staff: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip: offset,
      }),
      prisma.stockIssue.count({ where }),
    ]);

    return successResponse({
      issues,
      total,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error("Error fetching issues:", error);
    return errorResponse(error.message || "Failed to fetch issues", 500);
  }
}
