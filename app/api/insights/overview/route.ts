import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireSalonId, getCurrentUserId } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subDays, subMonths, format } from "date-fns";

/**
 * Phase 10.1 - Operation Insights API
 * 
 * GET /api/insights/overview
 * 
 * Returns comprehensive insights for:
 * - Bookings (today, this month, trends)
 * - POS/Orders (revenue, transactions)
 * - CRM/Customers (growth, retention)
 * - Staff (performance, workload)
 * 
 * Access: OWNER/ADMIN only
 */

// Helper: Check if user is OWNER or ADMIN
async function requireOwnerOrAdmin(request: NextRequest, salonId: string): Promise<void> {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error("Authentication required");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, salonId: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.salonId !== salonId) {
    throw new Error("Access denied: User does not belong to this salon");
  }

  if (user.role !== "OWNER" && user.role !== "ADMIN") {
    throw new Error("Access denied: Only OWNER or ADMIN can access insights");
  }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const salonId = await requireSalonId(request);
    
    // Phase 10.1: Require OWNER or ADMIN
    await requireOwnerOrAdmin(request, salonId);

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get("period") || "month"; // day, week, month
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    // Calculate date ranges
    const now = new Date();
    let startDate: Date;
    let endDate: Date = endOfDay(now);

    if (startDateParam && endDateParam) {
      startDate = startOfDay(new Date(startDateParam));
      endDate = endOfDay(new Date(endDateParam));
    } else {
      switch (period) {
        case "day":
          startDate = startOfDay(now);
          break;
        case "week":
          startDate = startOfDay(subDays(now, 7));
          break;
        case "month":
        default:
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
          break;
      }
    }

    // Previous period for comparison
    const periodDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const previousStartDate = new Date(startDate.getTime() - periodDays * 24 * 60 * 60 * 1000);
    const previousEndDate = new Date(startDate.getTime() - 1);

    console.log(`[Insights] Fetching insights for salon ${salonId}, period: ${format(startDate, "yyyy-MM-dd")} to ${format(endDate, "yyyy-MM-dd")}`);

    // Fetch all data in parallel
    const [
      // Bookings
      bookingsCurrent,
      bookingsPrevious,
      bookingsByStatus,
      bookingsByStaff,
      
      // POS/Orders
      ordersCurrent,
      ordersPrevious,
      revenueByDay,
      topProducts,
      
      // CRM/Customers
      customersTotal,
      customersNew,
      customersPrevious,
      customersBySource,
      topCustomers,
      
      // Staff
      staffTotal,
      staffActive,
      staffPerformance,
    ] = await Promise.all([
      // Bookings - Current period
      prisma.booking.findMany({
        where: {
          salonId,
          date: { gte: startDate, lte: endDate },
        },
        select: {
          id: true,
          date: true,
          status: true,
          stylistId: true,
          customerId: true,
        },
      }),

      // Bookings - Previous period
      prisma.booking.findMany({
        where: {
          salonId,
          date: { gte: previousStartDate, lte: previousEndDate },
        },
        select: {
          id: true,
          status: true,
        },
      }),

      // Bookings by status
      prisma.booking.groupBy({
        by: ["status"],
        where: {
          salonId,
          date: { gte: startDate, lte: endDate },
        },
        _count: true,
      }),

      // Bookings by staff
      prisma.booking.groupBy({
        by: ["stylistId"],
        where: {
          salonId,
          date: { gte: startDate, lte: endDate },
          stylistId: { not: null },
        },
        _count: true,
      }),

      // Orders - Current period
      prisma.invoice.findMany({
        where: {
          salonId,
          date: { gte: startDate, lte: endDate },
        },
        select: {
          id: true,
          date: true,
          total: true,
          status: true,
        },
      }),

      // Orders - Previous period
      prisma.invoice.findMany({
        where: {
          salonId,
          date: { gte: previousStartDate, lte: previousEndDate },
        },
        select: {
          total: true,
        },
      }),

      // Revenue by day
      prisma.invoice.groupBy({
        by: ["date"],
        where: {
          salonId,
          date: { gte: startDate, lte: endDate },
        },
        _sum: {
          total: true,
        },
        _count: true,
      }),

      // Top products (from POS orders if available)
      prisma.invoice.findMany({
        where: {
          salonId,
          date: { gte: startDate, lte: endDate },
        },
        take: 10,
        orderBy: { total: "desc" },
        select: {
          id: true,
          total: true,
          date: true,
        },
      }),

      // Customers - Total
      prisma.customer.count({
        where: { salonId },
      }),

      // Customers - New in period
      prisma.customer.count({
        where: {
          salonId,
          createdAt: { gte: startDate, lte: endDate },
        },
      }),

      // Customers - Previous period
      prisma.customer.count({
        where: {
          salonId,
          createdAt: { gte: previousStartDate, lte: previousEndDate },
        },
      }),

      // Customers by source (if available in profile)
      prisma.customer.findMany({
        where: {
          salonId,
          createdAt: { gte: startDate, lte: endDate },
        },
        select: {
          id: true,
          profile: true,
        },
        take: 1000, // Limit for performance
      }),

      // Top customers by spending
      prisma.customer.findMany({
        where: { salonId },
        orderBy: { totalSpent: "desc" },
        take: 10,
        select: {
          id: true,
          name: true,
          totalSpent: true,
          totalVisits: true,
        },
      }),

      // Staff - Total
      prisma.user.count({
        where: {
          salonId,
          role: { not: "OWNER" },
        },
      }),

      // Staff - Active (has bookings in period)
      prisma.user.count({
        where: {
          salonId,
          role: { not: "OWNER" },
          bookings: {
            some: {
              date: { gte: startDate, lte: endDate },
            },
          },
        },
      }),

      // Staff performance
      prisma.user.findMany({
        where: {
          salonId,
          role: { not: "OWNER" },
        },
        select: {
          id: true,
          name: true,
          role: true,
          bookings: {
            where: {
              date: { gte: startDate, lte: endDate },
            },
            select: {
              id: true,
              status: true,
            },
          },
        },
      }),
    ]);

    // Process bookings data
    const bookingsTotal = bookingsCurrent.length;
    const bookingsCompleted = bookingsCurrent.filter((b) => b.status === "COMPLETED").length;
    const bookingsCancelled = bookingsCurrent.filter((b) => b.status === "CANCELLED").length;
    const bookingsNoShow = bookingsCurrent.filter((b) => b.status === "NO_SHOW").length;
    const bookingsPreviousTotal = bookingsPrevious.length;
    const bookingsChange = bookingsPreviousTotal > 0
      ? ((bookingsTotal - bookingsPreviousTotal) / bookingsPreviousTotal) * 100
      : bookingsTotal > 0 ? 100 : 0;

    // Process POS/Orders data
    const revenueTotal = ordersCurrent.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const revenuePrevious = ordersPrevious.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const revenueChange = revenuePrevious > 0
      ? ((revenueTotal - revenuePrevious) / revenuePrevious) * 100
      : revenueTotal > 0 ? 100 : 0;
    const transactionsTotal = ordersCurrent.length;
    const averageOrderValue = transactionsTotal > 0 ? revenueTotal / transactionsTotal : 0;

    // Process revenue by day
    const revenueChart = revenueByDay
      .map((item) => ({
        date: format(new Date(item.date), "MM/dd"),
        revenue: Number(item._sum.total || 0),
        transactions: item._count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Process customers data
    const customersChange = customersPrevious > 0
      ? ((customersNew - customersPrevious) / customersPrevious) * 100
      : customersNew > 0 ? 100 : 0;

    // Process customers by source
    const customersBySourceMap = new Map<string, number>();
    customersBySource.forEach((customer) => {
      const source = (customer.profile as any)?.preferences?.customerGroup || "Khác";
      customersBySourceMap.set(source, (customersBySourceMap.get(source) || 0) + 1);
    });
    const customersBySourceData = Array.from(customersBySourceMap.entries()).map(([source, count]) => ({
      source,
      count,
    }));

    // Process staff performance
    const staffPerformanceData = staffPerformance.map((staff) => {
      const bookings = staff.bookings || [];
      const completed = bookings.filter((b) => b.status === "COMPLETED").length;
      return {
        id: staff.id,
        name: staff.name || "Unknown",
        role: staff.role,
        totalBookings: bookings.length,
        completedBookings: completed,
        completionRate: bookings.length > 0 ? (completed / bookings.length) * 100 : 0,
      };
    }).sort((a, b) => b.totalBookings - a.totalBookings);

    // Process bookings by staff
    const bookingsByStaffData = await Promise.all(
      bookingsByStaff.map(async (item) => {
        if (!item.stylistId) return null;
        const staff = await prisma.user.findUnique({
          where: { id: item.stylistId },
          select: { name: true },
        });
        return {
          staffId: item.stylistId,
          staffName: staff?.name || "Unknown",
          bookings: item._count,
        };
      })
    );
    const bookingsByStaffFiltered = bookingsByStaffData.filter((item) => item !== null) as Array<{
      staffId: string;
      staffName: string;
      bookings: number;
    }>;

    const duration = Date.now() - startTime;
    console.log(`[Insights] Completed in ${duration}ms`);

    return successResponse({
      period: {
        start: format(startDate, "yyyy-MM-dd"),
        end: format(endDate, "yyyy-MM-dd"),
        type: period,
      },
      bookings: {
        total: bookingsTotal,
        completed: bookingsCompleted,
        cancelled: bookingsCancelled,
        noShow: bookingsNoShow,
        change: Math.round(bookingsChange * 100) / 100,
        byStatus: bookingsByStatus.map((item) => ({
          status: item.status,
          count: item._count,
        })),
        byStaff: bookingsByStaffFiltered,
      },
      revenue: {
        total: revenueTotal,
        change: Math.round(revenueChange * 100) / 100,
        transactions: transactionsTotal,
        averageOrderValue: Math.round(averageOrderValue),
        byDay: revenueChart,
      },
      customers: {
        total: customersTotal,
        new: customersNew,
        change: Math.round(customersChange * 100) / 100,
        bySource: customersBySourceData,
        topCustomers: topCustomers.map((c) => ({
          id: c.id,
          name: c.name || "Unknown",
          totalSpent: Number(c.totalSpent || 0),
          totalVisits: c.totalVisits || 0,
        })),
      },
      staff: {
        total: staffTotal,
        active: staffActive,
        performance: staffPerformanceData,
      },
      meta: {
        generatedAt: new Date().toISOString(),
        duration: duration,
      },
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`[Insights] Error after ${duration}ms:`, error);

    // Handle specific errors
    if (error.message?.includes("Access denied") || error.message?.includes("Authentication required")) {
      return errorResponse(error.message, 403);
    }

    if (error.message?.includes("Salon ID is required")) {
      return errorResponse(error.message, 401);
    }

    // Return mock data if database fails (for development)
    if (
      error.message?.includes("denied access") ||
      error.message?.includes("ECONNREFUSED") ||
      error.code === "P1001"
    ) {
      console.warn("[Insights] Database connection failed, returning mock data");
      return successResponse({
        period: {
          start: format(new Date(), "yyyy-MM-dd"),
          end: format(new Date(), "yyyy-MM-dd"),
          type: "month",
        },
        bookings: {
          total: 0,
          completed: 0,
          cancelled: 0,
          noShow: 0,
          change: 0,
          byStatus: [],
          byStaff: [],
        },
        revenue: {
          total: 0,
          change: 0,
          transactions: 0,
          averageOrderValue: 0,
          byDay: [],
        },
        customers: {
          total: 0,
          new: 0,
          change: 0,
          bySource: [],
          topCustomers: [],
        },
        staff: {
          total: 0,
          active: 0,
          performance: [],
        },
        meta: {
          generatedAt: new Date().toISOString(),
          duration: duration,
          mock: true,
        },
      });
    }

    return errorResponse(error.message || "Failed to get insights", 500);
  }
}

