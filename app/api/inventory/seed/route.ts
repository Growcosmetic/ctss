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

// POST /api/inventory/seed - Tạo dữ liệu mẫu cho kho hàng
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

    // Check permissions - chỉ ADMIN và MANAGER mới được seed
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return errorResponse("User not found", 404);
    }

    if (user.role !== "ADMIN" && user.role !== "MANAGER") {
      return errorResponse("Access denied", 403);
    }

    // Lấy branch đầu tiên hoặc tạo branch mặc định
    let branch = await prisma.branch.findFirst({
      where: { isActive: true },
    });

    if (!branch) {
      // Tạo branch mặc định nếu chưa có
      branch = await prisma.branch.create({
        data: {
          name: "Chi nhánh mặc định",
          address: "123 Đường ABC, Quận 1, TP.HCM",
          phone: "0901234567",
          email: "contact@salon.com",
          isActive: true,
        },
      });
    }

    const branchId = branch.id;

    // Import unit constants
    const { COUNTING_UNITS, CAPACITY_UNITS } = await import("@/core/inventory/productUnits");

    // Dữ liệu sản phẩm mẫu
    const sampleProducts = [
      // Chemical - Uốn nóng
      {
        name: "Thuốc uốn nóng Goldwell",
        category: "Chemical",
        subCategory: "Uốn nóng",
        unit: COUNTING_UNITS.TUBE,
        capacity: 100,
        capacityUnit: CAPACITY_UNITS.ML,
        pricePerUnit: 50000,
        minStock: 500,
        maxStock: 2000,
        supplier: "Goldwell Vietnam",
        notes: "Thuốc uốn nóng cao cấp",
      },
      {
        name: "Thuốc uốn nóng L'Oreal",
        category: "Chemical",
        subCategory: "Uốn nóng",
        unit: "ml",
        pricePerUnit: 45000,
        minStock: 500,
        maxStock: 2000,
        supplier: "L'Oreal Vietnam",
        notes: "Thuốc uốn nóng phổ biến",
      },
      // Chemical - Uốn lạnh
      {
        name: "Thuốc uốn lạnh Wella",
        category: "Chemical",
        subCategory: "Uốn lạnh",
        unit: COUNTING_UNITS.BOTTLE,
        capacity: 500,
        capacityUnit: CAPACITY_UNITS.ML,
        pricePerUnit: 60000,
        minStock: 300,
        maxStock: 1500,
        supplier: "Wella Vietnam",
        notes: "Thuốc uốn lạnh chuyên nghiệp",
      },
      {
        name: "Thuốc uốn lạnh Schwarzkopf",
        category: "Chemical",
        subCategory: "Uốn lạnh",
        unit: COUNTING_UNITS.BOTTLE,
        capacity: 500,
        capacityUnit: CAPACITY_UNITS.ML,
        pricePerUnit: 55000,
        minStock: 300,
        maxStock: 1500,
        supplier: "Schwarzkopf Vietnam",
        notes: "Thuốc uốn lạnh chất lượng cao",
      },
      // Nhuộm
      {
        name: "Thuốc nhuộm màu đen",
        category: "Nhuộm",
        subCategory: "Màu cơ bản",
        unit: COUNTING_UNITS.TUBE,
        capacity: 60,
        capacityUnit: CAPACITY_UNITS.ML,
        pricePerUnit: 40000,
        minStock: 1000,
        maxStock: 3000,
        supplier: "Goldwell Vietnam",
        notes: "Thuốc nhuộm màu đen phổ biến",
      },
      {
        name: "Thuốc nhuộm màu nâu",
        category: "Nhuộm",
        subCategory: "Màu cơ bản",
        unit: COUNTING_UNITS.TUBE,
        capacity: 60,
        capacityUnit: CAPACITY_UNITS.ML,
        pricePerUnit: 40000,
        minStock: 800,
        maxStock: 2500,
        supplier: "L'Oreal Vietnam",
        notes: "Thuốc nhuộm màu nâu",
      },
      {
        name: "Thuốc nhuộm màu vàng",
        category: "Nhuộm",
        subCategory: "Màu sáng",
        unit: COUNTING_UNITS.TUBE,
        capacity: 60,
        capacityUnit: CAPACITY_UNITS.ML,
        pricePerUnit: 45000,
        minStock: 500,
        maxStock: 2000,
        supplier: "Wella Vietnam",
        notes: "Thuốc nhuộm màu vàng",
      },
      {
        name: "Thuốc nhuộm màu đỏ",
        category: "Nhuộm",
        subCategory: "Màu đặc biệt",
        unit: COUNTING_UNITS.TUBE,
        capacity: 60,
        capacityUnit: CAPACITY_UNITS.ML,
        pricePerUnit: 50000,
        minStock: 300,
        maxStock: 1500,
        supplier: "Schwarzkopf Vietnam",
        notes: "Thuốc nhuộm màu đỏ",
      },
      // Care - Treatment
      {
        name: "Dầu dưỡng tóc Goldwell",
        category: "Care",
        subCategory: "Treatment",
        unit: COUNTING_UNITS.BOTTLE,
        capacity: 250,
        capacityUnit: CAPACITY_UNITS.ML,
        pricePerUnit: 35000,
        minStock: 1000,
        maxStock: 3000,
        supplier: "Goldwell Vietnam",
        notes: "Dầu dưỡng tóc cao cấp",
      },
      {
        name: "Kem ủ tóc L'Oreal",
        category: "Care",
        subCategory: "Treatment",
        unit: COUNTING_UNITS.BAG,
        capacity: 500,
        capacityUnit: CAPACITY_UNITS.G,
        pricePerUnit: 30000,
        minStock: 500,
        maxStock: 2000,
        supplier: "L'Oreal Vietnam",
        notes: "Kem ủ tóc phục hồi",
      },
      {
        name: "Serum dưỡng tóc Wella",
        category: "Care",
        subCategory: "Treatment",
        unit: COUNTING_UNITS.BOTTLE,
        capacity: 100,
        capacityUnit: CAPACITY_UNITS.ML,
        pricePerUnit: 40000,
        minStock: 800,
        maxStock: 2500,
        supplier: "Wella Vietnam",
        notes: "Serum dưỡng tóc chuyên sâu",
      },
      // Care - Styling
      {
        name: "Gel tạo kiểu",
        category: "Care",
        subCategory: "Styling",
        unit: COUNTING_UNITS.TUBE,
        capacity: 200,
        capacityUnit: CAPACITY_UNITS.G,
        pricePerUnit: 25000,
        minStock: 200,
        maxStock: 1000,
        supplier: "Goldwell Vietnam",
        notes: "Gel tạo kiểu tóc",
      },
      {
        name: "Sáp vuốt tóc",
        category: "Care",
        subCategory: "Styling",
        unit: COUNTING_UNITS.BOX,
        capacity: 100,
        capacityUnit: CAPACITY_UNITS.G,
        pricePerUnit: 20000,
        minStock: 150,
        maxStock: 800,
        supplier: "L'Oreal Vietnam",
        notes: "Sáp vuốt tóc nam",
      },
      {
        name: "Keo xịt tóc",
        category: "Care",
        subCategory: "Styling",
        unit: COUNTING_UNITS.BOTTLE,
        capacity: 300,
        capacityUnit: CAPACITY_UNITS.ML,
        pricePerUnit: 30000,
        minStock: 300,
        maxStock: 1200,
        supplier: "Wella Vietnam",
        notes: "Keo xịt tóc giữ nếp",
      },
      // Sản phẩm sắp hết (để test cảnh báo)
      {
        name: "Thuốc tẩy tóc",
        category: "Chemical",
        subCategory: "Tẩy",
        unit: COUNTING_UNITS.BOTTLE,
        capacity: 1000,
        capacityUnit: CAPACITY_UNITS.ML,
        pricePerUnit: 70000,
        minStock: 500,
        maxStock: 2000,
        supplier: "Schwarzkopf Vietnam",
        notes: "Thuốc tẩy tóc chuyên nghiệp",
      },
      {
        name: "Thuốc nhuộm màu xanh",
        category: "Nhuộm",
        subCategory: "Màu đặc biệt",
        unit: COUNTING_UNITS.TUBE,
        capacity: 60,
        capacityUnit: CAPACITY_UNITS.ML,
        pricePerUnit: 55000,
        minStock: 200,
        maxStock: 1000,
        supplier: "Goldwell Vietnam",
        notes: "Thuốc nhuộm màu xanh",
      },
    ];

    // Tạo sản phẩm và tồn kho
    const createdProducts = [];
    const stockQuantities = [
      1500, 1200, 800, 600, 2000, 1800, 1000, 500, 2500, 1500, 2000, 600, 400, 500, 150, 100, // Có một số sản phẩm sắp hết
    ];

    for (let i = 0; i < sampleProducts.length; i++) {
      const productData = sampleProducts[i];
      const stockQty = stockQuantities[i] || 1000;

      // Kiểm tra xem sản phẩm đã tồn tại chưa (theo tên và category)
      let product = await prisma.product.findFirst({
        where: {
          name: productData.name,
          category: productData.category,
        },
      });

      // Nếu chưa có, tạo mới
      if (!product) {
        product = await prisma.product.create({
          data: {
            name: productData.name,
            category: productData.category,
            subCategory: productData.subCategory,
            unit: productData.unit,
            capacity: productData.capacity || null,
            capacityUnit: productData.capacityUnit || null,
            pricePerUnit: productData.pricePerUnit || null,
            minStock: productData.minStock || null,
            maxStock: productData.maxStock || null,
            supplier: productData.supplier || null,
            notes: productData.notes || null,
            stock: stockQty,
            branchAware: true,
          },
        });
      } else {
        // Nếu đã có, cập nhật thông tin
        product = await prisma.product.update({
          where: { id: product.id },
          data: {
            name: productData.name,
            category: productData.category,
            subCategory: productData.subCategory,
            unit: productData.unit,
            capacity: productData.capacity || null,
            capacityUnit: productData.capacityUnit || null,
            pricePerUnit: productData.pricePerUnit || null,
            minStock: productData.minStock || null,
            maxStock: productData.maxStock || null,
            supplier: productData.supplier || null,
            notes: productData.notes || null,
            stock: stockQty,
          },
        });
      }

      // Tạo tồn kho cho branch (kiểm tra xem đã có chưa)
      const existingStock = await prisma.productStock.findFirst({
        where: {
          productId: product.id,
          branchId: branchId,
        },
      });

      if (existingStock) {
        await prisma.productStock.update({
          where: { id: existingStock.id },
          data: { quantity: stockQty },
        });
      } else {
        await prisma.productStock.create({
          data: {
            productId: product.id,
            branchId: branchId,
            quantity: stockQty,
          },
        });
      }

      // Tạo một số giao dịch mẫu
      const transactionTypes = ["IN", "OUT", "ADJUST"];
      const reasons = ["Nhập hàng", "Xuất kho", "Điều chỉnh", "Pha chế", "Sử dụng dịch vụ"];

      // Tạo 3-5 giao dịch ngẫu nhiên cho mỗi sản phẩm
      const numTransactions = Math.floor(Math.random() * 3) + 3;
      for (let j = 0; j < numTransactions; j++) {
        const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
        const quantity = type === "IN" 
          ? Math.floor(Math.random() * 500) + 100
          : type === "OUT"
          ? Math.floor(Math.random() * 200) + 50
          : Math.floor(Math.random() * 100) - 50;
        const reason = reasons[Math.floor(Math.random() * reasons.length)];
        const daysAgo = Math.floor(Math.random() * 30); // Trong 30 ngày qua

        await prisma.stockTransaction.create({
          data: {
            productId: product.id,
            branchId: branchId,
            type: type,
            quantity: quantity,
            reason: reason,
            createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
          },
        });
      }

      createdProducts.push(product);
    }

    return successResponse({
      message: `Đã tạo ${createdProducts.length} sản phẩm mẫu và dữ liệu tồn kho`,
      products: createdProducts.length,
      branchId: branchId,
      branchName: branch.name,
    });
  } catch (error: any) {
    console.error("Error seeding inventory data:", error);
    return errorResponse(
      error.message || "Failed to seed inventory data",
      500
    );
  }
}
