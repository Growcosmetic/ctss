import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { cookies } from "next/headers";
import { detectChurnRisk } from "@/features/mina/services/minaEngine";
import { subDays } from "date-fns";

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

// GET /api/dashboard/alerts
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

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return errorResponse("User not found", 404);
    }

    const alerts: any[] = [];

    // 1. High churn-risk customers (from Mina)
    if (user.role === "ADMIN" || user.role === "MANAGER") {
      // Get customers who have visits (recent customers)
      const recentCustomers = await prisma.customer.findMany({
        where: {
          visits: {
            some: {}, // Has at least one visit
          },
        },
        take: 50, // Check recent 50 customers
      });

      for (const customer of recentCustomers) {
        try {
          const risk = await detectChurnRisk(customer.id);
          if (risk.level === "HIGH") {
            alerts.push({
              id: `churn-${customer.id}`,
              type: "churn-risk",
              priority: "high",
              title: "Khách hàng có rủi ro cao",
              message: `${customer.name} có dấu hiệu không quay lại. ${risk.reason}`,
              icon: "🔥",
              actionUrl: `/crm?customerId=${customer.id}`,
              data: {
                customerId: customer.id,
              },
            });
          }
        } catch (error) {
          // Skip if error
        }
      }
    }

    // 2. Important customer notes (recent)
    // Note: customerNote model may not exist, skip if error
    let recentNotes: any[] = [];
    try {
      // @ts-ignore - customerNote may not be generated yet
      recentNotes = await prisma.customerNote.findMany({
      where: {
        createdAt: {
          gte: subDays(new Date(), 7), // Last 7 days
        },
      },
      include: {
        customer: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      });
    } catch (error) {
      // Skip if model doesn't exist
      recentNotes = [];
    }

    recentNotes.forEach((note: any) => {
      if (note.note?.toLowerCase().includes("quan trọng") || 
          note.note?.toLowerCase().includes("lưu ý") ||
          note.note?.toLowerCase().includes("phàn nàn")) {
        alerts.push({
          id: `note-${note.id}`,
          type: "customer-note",
          priority: "medium",
          title: "Ghi chú khách hàng",
          message: `${note.customer?.name || "Khách hàng"}: ${note.note?.substring(0, 100) || ""}...`,
          icon: "📝",
          actionUrl: `/crm?customerId=${note.customerId}`,
          data: {
            customerId: note.customerId,
          },
        });
      }
    });

    // 3. System notifications (unread, high priority)
    const systemNotifications = await prisma.notification.findMany({
      where: {
        userId: user.id,
        status: "UNREAD",
        type: {
          in: [
            "SYSTEM_ALERT",
            "CHURN_RISK_ALERT",
            "CUSTOMER_RISK",
            "BOOKING_NO_SHOW",
          ],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

    systemNotifications.forEach((notif) => {
      alerts.push({
        id: `notif-${notif.id}`,
        type: "system",
        priority: notif.type === "CHURN_RISK_ALERT" || notif.type === "CUSTOMER_RISK" ? "high" : "medium",
        title: notif.title,
        message: notif.message,
        icon: "⚠️",
        data: notif.data as any,
      });
    });

    // 4. Revenue alerts (if revenue dropped significantly)
    if (user.role === "ADMIN" || user.role === "MANAGER") {
      const today = new Date();
      const todayStart = new Date(today.setHours(0, 0, 0, 0));
      const todayEnd = new Date(today.setHours(23, 59, 59, 999));
      const yesterdayStart = new Date(todayStart);
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);
      const yesterdayEnd = new Date(todayEnd);
      yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);

      const todayRevenue = await prisma.invoice.aggregate({
        where: {
          status: "PAID",
          createdAt: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
        _sum: {
          total: true,
        },
      });

      const yesterdayRevenue = await prisma.invoice.aggregate({
        where: {
          status: "PAID",
          createdAt: {
            gte: yesterdayStart,
            lte: yesterdayEnd,
          },
        },
        _sum: {
          total: true,
        },
      });

      const todayTotal = Number(todayRevenue._sum.total || 0);
      const yesterdayTotal = Number(yesterdayRevenue._sum.total || 0);

      if (yesterdayTotal > 0 && todayTotal < yesterdayTotal * 0.7) {
        // Revenue dropped more than 30%
        alerts.push({
          id: "revenue-drop",
          type: "revenue",
          priority: "high",
          title: "Cảnh báo doanh thu",
          message: `Doanh thu hôm nay giảm ${Math.round(((yesterdayTotal - todayTotal) / yesterdayTotal) * 100)}% so với hôm qua.`,
          icon: "📉",
          actionUrl: "/reports",
        });
      }
    }

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    alerts.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return successResponse(alerts.slice(0, 10)); // Return top 10
  } catch (error: any) {
    // Return empty alerts if database fails
    if (error.message?.includes("denied access") || error.message?.includes("ECONNREFUSED") || error.code === "P1001") {
      return successResponse([]);
    }
    return errorResponse(error.message || "Failed to get alerts", 500);
  }
}
