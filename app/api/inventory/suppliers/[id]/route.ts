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

// GET /api/inventory/suppliers/[id] - Get a single supplier
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

    const supplier = await prisma.supplier.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { products: true },
        },
        products: {
          take: 10,
          select: {
            id: true,
            name: true,
            category: true,
            unit: true,
          },
        },
      },
    });

    if (!supplier) {
      return errorResponse("Nhà cung cấp không tồn tại", 404);
    }

    return successResponse(supplier);
  } catch (error: any) {
    console.error("Error fetching supplier:", error);
    return errorResponse(error.message || "Failed to fetch supplier", 500);
  }
}

// PUT /api/inventory/suppliers/[id] - Update a supplier
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

    const body = await request.json();
    const {
      code,
      name,
      contactName,
      phone,
      email,
      address,
      city,
      province,
      country,
      taxCode,
      website,
      paymentTerms,
      notes,
      isActive,
    } = body;

    // Get existing supplier
    const existing = await prisma.supplier.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return errorResponse("Nhà cung cấp không tồn tại", 404);
    }

    // Check if code is being changed and if it conflicts
    if (code && code.toUpperCase().trim() !== existing.code) {
      const codeExists = await prisma.supplier.findUnique({
        where: { code: code.toUpperCase().trim() },
      });

      if (codeExists) {
        return errorResponse("Mã nhà cung cấp đã tồn tại", 409);
      }
    }

    const supplier = await prisma.supplier.update({
      where: { id: params.id },
      data: {
        code: code ? code.toUpperCase().trim() : undefined,
        name: name ? name.trim() : undefined,
        contactName: contactName !== undefined ? (contactName?.trim() || null) : undefined,
        phone: phone !== undefined ? (phone?.trim() || null) : undefined,
        email: email !== undefined ? (email?.trim() || null) : undefined,
        address: address !== undefined ? (address?.trim() || null) : undefined,
        city: city !== undefined ? (city?.trim() || null) : undefined,
        province: province !== undefined ? (province?.trim() || null) : undefined,
        country: country !== undefined ? (country?.trim() || "VN") : undefined,
        taxCode: taxCode !== undefined ? (taxCode?.trim() || null) : undefined,
        website: website !== undefined ? (website?.trim() || null) : undefined,
        paymentTerms: paymentTerms !== undefined ? (paymentTerms?.trim() || null) : undefined,
        notes: notes !== undefined ? (notes?.trim() || null) : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
    });

    return successResponse(supplier, "Nhà cung cấp đã được cập nhật thành công");
  } catch (error: any) {
    console.error("Error updating supplier:", error);
    if (error.code === "P2002") {
      return errorResponse("Mã nhà cung cấp đã tồn tại", 409);
    }
    return errorResponse(error.message || "Không thể cập nhật nhà cung cấp", 500);
  }
}

// DELETE /api/inventory/suppliers/[id] - Delete a supplier (soft delete)
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

    // Get existing supplier
    const existing = await prisma.supplier.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!existing) {
      return errorResponse("Nhà cung cấp không tồn tại", 404);
    }

    // Check if supplier has products
    if (existing._count.products > 0) {
      // Soft delete - set isActive to false
      const supplier = await prisma.supplier.update({
        where: { id: params.id },
        data: {
          isActive: false,
        },
      });

      return successResponse(supplier, "Nhà cung cấp đã được vô hiệu hóa (có sản phẩm liên kết)");
    }

    // Hard delete if no products
    await prisma.supplier.delete({
      where: { id: params.id },
    });

    return successResponse(null, "Nhà cung cấp đã được xóa thành công");
  } catch (error: any) {
    console.error("Error deleting supplier:", error);
    return errorResponse(error.message || "Không thể xóa nhà cung cấp", 500);
  }
}
