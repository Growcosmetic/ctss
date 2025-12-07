import { prisma } from "@/lib/prisma";
import { callOpenAIJSON } from "./openai";

export interface StaffPerformanceAnalysis {
  staffId: string;
  employeeId: string;
  period: string;
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  revenueAnalysis: {
    totalRevenue: number;
    averageOrderValue: number;
    growth: number;
  };
  bookingAnalysis: {
    totalBookings: number;
    completionRate: number;
    averageRating?: number;
  };
  comparison: {
    rank: number;
    percentile: number;
  };
  insights: string[];
}

/**
 * Get AI-powered staff performance analysis
 */
export async function getStaffPerformanceAnalysis(
  staffId: string,
  period: "WEEKLY" | "MONTHLY" | "YEARLY" = "MONTHLY"
): Promise<StaffPerformanceAnalysis | null> {
  try {
    // Fetch staff data
    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        posOrders: {
          where: {
            createdAt: {
              gte: getPeriodStart(period),
            },
            status: "COMPLETED",
          },
          include: {
            posItems: true,
          },
        },
        bookings: {
          where: {
            bookingDate: {
              gte: getPeriodStart(period),
            },
          },
        },
        staffKpis: {
          where: {
            period,
            periodDate: {
              gte: getPeriodStart(period),
            },
          },
          orderBy: { periodDate: "desc" },
          take: 3,
        },
      },
    });

    if (!staff) {
      throw new Error("Staff not found");
    }

    // Get all staff for comparison
    const allStaff = await prisma.staff.findMany({
      include: {
        posOrders: {
          where: {
            createdAt: {
              gte: getPeriodStart(period),
            },
            status: "COMPLETED",
          },
        },
        bookings: {
          where: {
            bookingDate: {
              gte: getPeriodStart(period),
            },
          },
        },
      },
    });

    // Calculate metrics
    const totalRevenue = staff.posOrders.reduce(
      (sum, order) => sum + Number(order.total),
      0
    );
    const totalBookings = staff.bookings.length;
    const completedBookings = staff.bookings.filter(
      (b) => b.status === "COMPLETED"
    ).length;
    const completionRate =
      totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;
    const averageOrderValue =
      staff.posOrders.length > 0 ? totalRevenue / staff.posOrders.length : 0;

    // Calculate rank
    const staffRevenues = allStaff.map((s) => ({
      id: s.id,
      revenue: s.posOrders.reduce((sum, o) => sum + Number(o.total), 0),
    }));
    staffRevenues.sort((a, b) => b.revenue - a.revenue);
    const rank =
      staffRevenues.findIndex((s) => s.id === staffId) + 1 || allStaff.length;
    const percentile = ((allStaff.length - rank) / allStaff.length) * 100;

    // Build prompt for OpenAI
    const prompt = `
Analyze staff performance and provide comprehensive insights.

Staff Information:
- Name: ${staff.user.firstName} ${staff.user.lastName}
- Employee ID: ${staff.employeeId}
- Position: ${staff.position || "N/A"}
- Period: ${period}

Performance Metrics:
- Total Revenue: ${totalRevenue}₫
- Total Bookings: ${totalBookings}
- Completed Bookings: ${completedBookings}
- Completion Rate: ${completionRate.toFixed(1)}%
- Average Order Value: ${averageOrderValue.toFixed(0)}₫
- Rank: ${rank}/${allStaff.length}
- Percentile: ${percentile.toFixed(1)}%

KPI History:
${JSON.stringify(staff.staffKpis, null, 2)}

Booking Patterns:
- Total: ${totalBookings}
- Completed: ${completedBookings}
- Cancelled: ${staff.bookings.filter((b) => b.status === "CANCELLED").length}

Provide:
1. Overall performance score (0-100)
2. Key strengths (3-5 items)
3. Areas for improvement (3-5 items)
4. Actionable recommendations
5. Revenue analysis insights
6. Booking analysis insights
7. Comparison insights

Return JSON with all analysis fields.
`;

    const systemPrompt = `You are an expert HR and performance analyst.
Analyze staff performance data and provide actionable insights for improvement.
Always respond with valid JSON format.`;

    const response = await callOpenAIJSON<StaffPerformanceAnalysis>(
      prompt,
      systemPrompt
    );

    if (response.success && response.data) {
      return {
        ...response.data,
        staffId: staff.id,
        employeeId: staff.employeeId,
        period,
        revenueAnalysis: {
          totalRevenue,
          averageOrderValue,
          growth: 0, // Would calculate from previous period
        },
        bookingAnalysis: {
          totalBookings,
          completionRate,
        },
        comparison: {
          rank,
          percentile,
        },
      };
    }

    // Fallback analysis
    return generateFallbackAnalysis(staff, totalRevenue, totalBookings, completionRate, rank, percentile);
  } catch (error: any) {
    console.error("Error getting staff performance analysis:", error);
    return null;
  }
}

function getPeriodStart(period: "WEEKLY" | "MONTHLY" | "YEARLY"): Date {
  const now = new Date();
  switch (period) {
    case "WEEKLY":
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 7);
      return weekStart;
    case "MONTHLY":
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case "YEARLY":
      return new Date(now.getFullYear(), 0, 1);
    default:
      return new Date(now.getFullYear(), now.getMonth(), 1);
  }
}

function generateFallbackAnalysis(
  staff: any,
  totalRevenue: number,
  totalBookings: number,
  completionRate: number,
  rank: number,
  percentile: number
): StaffPerformanceAnalysis {
  const overallScore = Math.min(
    100,
    Math.round((completionRate * 0.4 + percentile * 0.6))
  );

  return {
    staffId: staff.id,
    employeeId: staff.employeeId,
    period: "MONTHLY",
    overallScore,
    strengths: [
      "Hoàn thành tốt các lịch hẹn",
      "Doanh thu ổn định",
    ],
    weaknesses: [
      "Có thể cải thiện tỷ lệ hoàn thành",
      "Tăng số lượng đơn hàng",
    ],
    recommendations: [
      "Tập trung vào upsell để tăng giá trị đơn hàng",
      "Cải thiện kỹ năng giao tiếp với khách hàng",
    ],
    revenueAnalysis: {
      totalRevenue,
      averageOrderValue: totalRevenue / Math.max(totalBookings, 1),
      growth: 0,
    },
    bookingAnalysis: {
      totalBookings,
      completionRate,
    },
    comparison: {
      rank,
      percentile,
    },
    insights: [
      `Xếp hạng ${rank} trong đội ngũ nhân viên`,
      `Tỷ lệ hoàn thành ${completionRate.toFixed(1)}%`,
    ],
  };
}

