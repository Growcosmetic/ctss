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

// POST /api/inventory/suppliers/import - Import suppliers from Excel
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
    const { suppliers } = body;

    if (!suppliers || !Array.isArray(suppliers) || suppliers.length === 0) {
      return errorResponse("Danh sách nhà cung cấp không hợp lệ", 400);
    }

    const createdSuppliers = [];
    const errors = [];

    for (let i = 0; i < suppliers.length; i++) {
      const supplier = suppliers[i];
      try {
        // Validate required fields
        if (!supplier.name || !supplier.name.trim()) {
          errors.push(`Dòng ${i + 1}: Thiếu tên nhà cung cấp`);
          continue;
        }

        // Generate code if not provided
        let finalCode = supplier.code;
        if (!finalCode || finalCode.trim() === "") {
          const namePrefix = supplier.name
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, "")
            .substring(0, 6);
          const timestamp = Date.now().toString().slice(-6);
          finalCode = `NCC${namePrefix}${timestamp}`;
        }

        // Check if supplier already exists (by code or name)
        let existingSupplier = await prisma.supplier.findFirst({
          where: {
            OR: [
              { code: finalCode.toUpperCase().trim() },
              { name: { contains: supplier.name.trim(), mode: "insensitive" } },
            ],
          },
        });

        if (existingSupplier) {
          // Update existing supplier
          const updated = await prisma.supplier.update({
            where: { id: existingSupplier.id },
            data: {
              contactName: supplier.contactName?.trim() || existingSupplier.contactName,
              phone: supplier.phone?.trim() || existingSupplier.phone,
              email: supplier.email?.trim() || existingSupplier.email,
              address: supplier.address?.trim() || existingSupplier.address,
              city: supplier.city?.trim() || existingSupplier.city,
              province: supplier.province?.trim() || existingSupplier.province,
              taxCode: supplier.taxCode?.trim() || existingSupplier.taxCode,
              website: supplier.website?.trim() || existingSupplier.website,
              paymentTerms: supplier.paymentTerms?.trim() || existingSupplier.paymentTerms,
              notes: supplier.notes?.trim() || existingSupplier.notes,
            },
          });
          createdSuppliers.push(updated);
        } else {
          // Create new supplier
          const created = await prisma.supplier.create({
            data: {
              code: finalCode.toUpperCase().trim(),
              name: supplier.name.trim(),
              contactName: supplier.contactName?.trim() || null,
              phone: supplier.phone?.trim() || null,
              email: supplier.email?.trim() || null,
              address: supplier.address?.trim() || null,
              city: supplier.city?.trim() || null,
              province: supplier.province?.trim() || null,
              country: supplier.country?.trim() || "VN",
              taxCode: supplier.taxCode?.trim() || null,
              website: supplier.website?.trim() || null,
              paymentTerms: supplier.paymentTerms?.trim() || null,
              notes: supplier.notes?.trim() || null,
              isActive: true,
            },
          });
          createdSuppliers.push(created);
        }
      } catch (error: any) {
        console.error(`Error creating supplier at row ${i + 1}:`, error);
        if (error.code === "P2002") {
          errors.push(`Dòng ${i + 1}: Nhà cung cấp "${supplier.name}" đã tồn tại`);
        } else {
          errors.push(`Dòng ${i + 1}: ${error.message || "Lỗi không xác định"}`);
        }
      }
    }

    if (createdSuppliers.length === 0) {
      return errorResponse(
        `Không thể tạo nhà cung cấp nào. Lỗi:\n${errors.join("\n")}`,
        400
      );
    }

    return successResponse(
      {
        created: createdSuppliers.length,
        total: suppliers.length,
        errors: errors.length > 0 ? errors : undefined,
      },
      `Đã import thành công ${createdSuppliers.length}/${suppliers.length} nhà cung cấp`
    );
  } catch (error: any) {
    console.error("Error importing suppliers:", error);
    return errorResponse(error.message || "Không thể import nhà cung cấp", 500);
  }
}
