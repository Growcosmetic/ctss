import { prisma } from "@/lib/prisma";
import { callOpenAIJSON } from "./openai";

export interface BusinessInsight {
  type: "revenue" | "customer" | "staff" | "inventory" | "booking" | "general";
  title: string;
  message: string;
  priority: "low" | "medium" | "high";
  actionable: boolean;
  actionItems?: string[];
  metrics?: {
    current: number;
    target?: number;
    trend?: "up" | "down" | "stable";
  };
  confidence: number;
}

/**
 * Get AI-powered business insights
 */
export async function getBusinessInsights(): Promise<BusinessInsight[]> {
  try {
    // Fetch comprehensive business data
    const [
      totalRevenue,
      totalCustomers,
      totalBookings,
      activeStaff,
      lowStockProducts,
      recentOrders,
      recentBookings,
    ] = await Promise.all([
      prisma.posOrder.aggregate({
        where: {
          createdAt: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30)),
          },
          status: "COMPLETED",
        },
        _sum: { total: true },
      }),
      prisma.customer.count(),
      prisma.booking.count({
        where: {
          bookingDate: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30)),
          },
        },
      }),
      prisma.staff.count({ where: { isActive: true } }),
      prisma.product.findMany({
        where: {
          stockQuantity: {
            lte: prisma.product.fields.minStockLevel,
          },
        },
        take: 10,
      }),
      prisma.posOrder.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          posItems: true,
        },
      }),
      prisma.booking.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          customer: true,
          bookingServices: true,
        },
      }),
    ]);

    // Calculate trends (simplified - would compare with previous period)
    const revenue = Number(totalRevenue._sum.total || 0);
    const avgOrderValue =
      recentOrders.length > 0
        ? recentOrders.reduce((sum, o) => sum + Number(o.total), 0) /
          recentOrders.length
        : 0;

    // Build prompt for OpenAI
    const prompt = `
Analyze this business data and provide actionable insights and recommendations.

Business Metrics (Last 30 Days):
- Total Revenue: ${revenue}₫
- Total Customers: ${totalCustomers}
- Total Bookings: ${totalBookings}
- Active Staff: ${activeStaff}
- Low Stock Products: ${lowStockProducts.length}
- Average Order Value: ${avgOrderValue.toFixed(0)}₫

Recent Orders (last 10):
${JSON.stringify(
  recentOrders.map((o) => ({
    total: o.total,
    items: o.posItems.length,
    date: o.createdAt,
  })),
  null,
  2
)}

Recent Bookings (last 10):
${JSON.stringify(
  recentBookings.map((b) => ({
    status: b.status,
    totalAmount: b.totalAmount,
    services: b.bookingServices.length,
    date: b.bookingDate,
  })),
  null,
  2
)}

Low Stock Products:
${lowStockProducts.map((p) => `- ${p.name}: ${p.stockQuantity}/${p.minStockLevel}`).join("\n")}

Provide 5-8 business insights covering:
1. Revenue opportunities
2. Customer growth strategies
3. Staff performance optimization
4. Inventory management
5. Booking optimization
6. General business health

For each insight, provide:
- type: "revenue" | "customer" | "staff" | "inventory" | "booking" | "general"
- title: concise title
- message: detailed explanation
- priority: "low" | "medium" | "high"
- actionable: boolean
- actionItems: array of specific actions (if actionable)
- metrics: current value and trend
- confidence: 0-100

Return JSON array of insights.
`;

    const systemPrompt = `You are an expert business analyst for a beauty salon.
Analyze business metrics and provide actionable insights to improve performance.
Always respond with valid JSON array format.`;

    const response = await callOpenAIJSON<BusinessInsight[]>(
      prompt,
      systemPrompt
    );

    if (response.success && response.data) {
      return response.data;
    }

    // Fallback insights
    return generateFallbackInsights(
      revenue,
      totalCustomers,
      totalBookings,
      lowStockProducts.length
    );
  } catch (error: any) {
    console.error("Error getting business insights:", error);
    return [];
  }
}

function generateFallbackInsights(
  revenue: number,
  customers: number,
  bookings: number,
  lowStockCount: number
): BusinessInsight[] {
  const insights: BusinessInsight[] = [];

  // Revenue insight
  if (revenue > 0) {
    insights.push({
      type: "revenue",
      title: "Doanh thu ổn định",
      message: `Doanh thu 30 ngày qua đạt ${revenue.toLocaleString("vi-VN")}₫. Có thể tăng trưởng bằng cách tăng giá trị đơn hàng trung bình.`,
      priority: "medium",
      actionable: true,
      actionItems: [
        "Tập trung vào upsell dịch vụ cao cấp",
        "Tạo gói dịch vụ combo",
        "Khuyến khích khách hàng mua sản phẩm chăm sóc",
      ],
      metrics: {
        current: revenue,
        trend: "stable",
      },
      confidence: 75,
    });
  }

  // Customer insight
  insights.push({
    type: "customer",
    title: "Tăng trưởng khách hàng",
    message: `Hiện có ${customers} khách hàng. Tập trung vào retention và referral program để tăng trưởng bền vững.`,
    priority: "high",
    actionable: true,
    actionItems: [
      "Triển khai chương trình loyalty points",
      "Khuyến khích khách hàng giới thiệu bạn bè",
      "Gửi nhắc nhở cho khách hàng lâu không đến",
    ],
    metrics: {
      current: customers,
      trend: "up",
    },
    confidence: 80,
  });

  // Inventory insight
  if (lowStockCount > 0) {
    insights.push({
      type: "inventory",
      title: "Cảnh báo tồn kho",
      message: `Có ${lowStockCount} sản phẩm sắp hết hàng. Cần đặt hàng sớm để tránh gián đoạn dịch vụ.`,
      priority: "high",
      actionable: true,
      actionItems: [
        "Kiểm tra và đặt hàng các sản phẩm sắp hết",
        "Điều chỉnh mức tồn kho tối thiểu",
        "Thiết lập cảnh báo tự động",
      ],
      metrics: {
        current: lowStockCount,
        trend: "up",
      },
      confidence: 90,
    });
  }

  // Booking insight
  insights.push({
    type: "booking",
    title: "Tối ưu lịch hẹn",
    message: `Có ${bookings} lịch hẹn trong 30 ngày qua. Phân tích thời gian cao điểm để tối ưu nhân sự.`,
    priority: "medium",
    actionable: true,
      actionItems: [
        "Phân tích thời gian cao điểm",
        "Tăng nhân viên vào giờ cao điểm",
        "Khuyến khích đặt lịch vào giờ thấp điểm",
      ],
    metrics: {
      current: bookings,
      trend: "stable",
    },
    confidence: 70,
  });

  return insights;
}

