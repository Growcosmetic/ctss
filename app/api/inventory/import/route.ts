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

// POST /api/inventory/import - Import products from Excel
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

    const body = await request.json();
    const { products } = body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return errorResponse("Danh sách sản phẩm không hợp lệ", 400);
    }

    const createdProducts = [];
    const errors = [];

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      try {
        // Validate required fields
        if (!product.name || !product.category || !product.unit) {
          errors.push(`Dòng ${i + 1}: Thiếu tên sản phẩm, nhóm sản phẩm hoặc đơn vị tính`);
          continue;
        }

        // Generate SKU if not provided
        let sku = product.sku;
        if (!sku || sku.trim() === "") {
          const namePrefix = product.name
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, "")
            .substring(0, 6);
          const timestamp = Date.now().toString().slice(-6);
          sku = `${namePrefix}${timestamp}`;
        }

        // Build notes field
        let notes = product.notes || "";
        if (product.sku && !notes.includes("SKU:")) {
          notes = `SKU: ${product.sku}\n${notes}`.trim();
        }
        if (product.brand && !notes.includes("Thương hiệu:")) {
          notes = `Thương hiệu: ${product.brand}\n${notes}`.trim();
        }

        // Create product
        const created = await prisma.product.create({
          data: {
            name: product.name.trim(),
            category: product.category.trim(),
            subCategory: product.subCategory?.trim() || null,
            unit: product.unit.trim(),
            capacity: product.capacity ? parseFloat(product.capacity.toString()) : null,
            capacityUnit: product.capacityUnit || null,
            pricePerUnit: product.pricePerUnit ? parseFloat(product.pricePerUnit.toString()) : null,
            minStock: product.minStock ? parseFloat(product.minStock.toString()) : null,
            maxStock: product.maxStock ? parseFloat(product.maxStock.toString()) : null,
            supplier: product.supplier?.trim() || null,
            notes: notes || null,
            branchAware: true,
          },
        });

        createdProducts.push(created);
      } catch (error: any) {
        console.error(`Error creating product at row ${i + 1}:`, error);
        if (error.code === "P2002") {
          errors.push(`Dòng ${i + 1}: Sản phẩm "${product.name}" đã tồn tại`);
        } else {
          errors.push(`Dòng ${i + 1}: ${error.message || "Lỗi không xác định"}`);
        }
      }
    }

    if (createdProducts.length === 0) {
      return errorResponse(
        `Không thể tạo sản phẩm nào. Lỗi:\n${errors.join("\n")}`,
        400
      );
    }

    return successResponse(
      {
        created: createdProducts.length,
        total: products.length,
        errors: errors.length > 0 ? errors : undefined,
      },
      `Đã import thành công ${createdProducts.length}/${products.length} sản phẩm`
    );
  } catch (error: any) {
    console.error("Error importing products:", error);
    return errorResponse(error.message || "Không thể import sản phẩm", 500);
  }
}
