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
    const { products, branchId } = body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return errorResponse("Danh sách sản phẩm không hợp lệ", 400);
    }

    // Get user to determine branch if not provided
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        branch: true,
      },
    });

    if (!user) {
      return errorResponse("User not found", 404);
    }

    // Determine branchId
    let finalBranchId = branchId;
    if (!finalBranchId) {
      // Try to get from user's branch
      if (user.branchId) {
        finalBranchId = user.branchId;
      } else {
        // Try to get default branch
        const defaultBranch = await prisma.branch.findFirst({
          where: { isActive: true },
          orderBy: { createdAt: "asc" },
        });
        if (defaultBranch) {
          finalBranchId = defaultBranch.id;
        } else {
          return errorResponse("Không tìm thấy chi nhánh. Vui lòng chọn chi nhánh trước khi import.", 400);
        }
      }
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

        // Check if product already exists (by name and category)
        let existingProduct = await prisma.product.findFirst({
          where: {
            name: { contains: product.name.trim(), mode: "insensitive" },
            category: product.category.trim(),
          },
        });

        let productToUse;
        if (existingProduct) {
          // Update existing product
          productToUse = await prisma.product.update({
            where: { id: existingProduct.id },
            data: {
              subCategory: product.subCategory?.trim() || existingProduct.subCategory || null,
              unit: product.unit.trim() || existingProduct.unit,
              capacity: product.capacity !== undefined && product.capacity !== null ? parseFloat(product.capacity.toString()) : existingProduct.capacity,
              capacityUnit: product.capacityUnit || existingProduct.capacityUnit || null,
              pricePerUnit: product.pricePerUnit !== undefined && product.pricePerUnit !== null ? parseFloat(product.pricePerUnit.toString()) : existingProduct.pricePerUnit,
              minStock: product.minStock !== undefined && product.minStock !== null ? parseFloat(product.minStock.toString()) : existingProduct.minStock,
              maxStock: product.maxStock !== undefined && product.maxStock !== null ? parseFloat(product.maxStock.toString()) : existingProduct.maxStock,
              supplier: product.supplier?.trim() || existingProduct.supplier || null,
              notes: notes || existingProduct.notes || null,
            },
          });
        } else {
          // Create new product
          productToUse = await prisma.product.create({
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
        }

        // Create or update ProductStock for the branch
        const initialQuantity = product.initialStock ? parseFloat(product.initialStock.toString()) : 0;
        
        const existingStock = await prisma.productStock.findFirst({
          where: {
            productId: productToUse.id,
            branchId: finalBranchId,
          },
        });

        if (existingStock) {
          // Update existing stock if initialStock is provided
          if (initialQuantity > 0) {
            await prisma.productStock.update({
              where: { id: existingStock.id },
              data: {
                quantity: initialQuantity,
              },
            });
          }
        } else {
          // Create new ProductStock
          await prisma.productStock.create({
            data: {
              productId: productToUse.id,
              branchId: finalBranchId,
              quantity: initialQuantity,
            },
          });
        }

        createdProducts.push(productToUse);
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
