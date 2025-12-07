// ============================================
// AI Manager Data Engine
// ============================================

export { getInventoryKPIs, getInventoryForecasts } from "./inventoryKPIs";

import { prisma } from "@/lib/prisma";
import {
  BranchKPIs,
  StaffKPIs,
  ServiceKPIs,
  CustomerTrends,
  ChurnAnalysis,
  MarketingKPIs,
} from "../types";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
  subWeeks,
  subMonths,
  format,
} from "date-fns";

/**
 * Get comprehensive KPIs for a branch
 */
export async function getBranchKPIs(
  branchId: string,
  timeRange: "today" | "week" | "month" | "year" = "week"
): Promise<BranchKPIs> {
  const now = new Date();
  let startDate: Date;
  let endDate: Date = now;
  let previousStartDate: Date;
  let previousEndDate: Date;

  switch (timeRange) {
    case "today":
      startDate = startOfDay(now);
      endDate = endOfDay(now);
      previousStartDate = startOfDay(subDays(now, 1));
      previousEndDate = endOfDay(subDays(now, 1));
      break;
    case "week":
      startDate = startOfWeek(now, { weekStartsOn: 1 });
      endDate = endOfWeek(now, { weekStartsOn: 1 });
      previousStartDate = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
      previousEndDate = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
      break;
    case "month":
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
      previousStartDate = startOfMonth(subMonths(now, 1));
      previousEndDate = endOfMonth(subMonths(now, 1));
      break;
    case "year":
      startDate = startOfYear(now);
      endDate = endOfYear(now);
      previousStartDate = startOfYear(subMonths(now, 12));
      previousEndDate = endOfYear(subMonths(now, 12));
      break;
  }

  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
    select: { name: true },
  });

  if (!branch) {
    throw new Error("Branch not found");
  }

  // Current period revenue
  const currentRevenue = await prisma.invoice.aggregate({
    where: {
      branchId,
      status: "PAID",
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    _sum: {
      total: true,
    },
  });

  // Previous period revenue
  const previousRevenue = await prisma.invoice.aggregate({
    where: {
      branchId,
      status: "PAID",
      createdAt: {
        gte: previousStartDate,
        lte: previousEndDate,
      },
    },
    _sum: {
      total: true,
    },
  });

  const currentRevenueTotal = Number(currentRevenue._sum.total || 0);
  const previousRevenueTotal = Number(previousRevenue._sum.total || 0);
  const revenueTrend =
    previousRevenueTotal > 0
      ? ((currentRevenueTotal - previousRevenueTotal) / previousRevenueTotal) * 100
      : 0;

  // Revenue by day
  const revenueByDay = await prisma.invoice.groupBy({
    by: ["createdAt"],
    where: {
      branchId,
      status: "PAID",
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    _sum: {
      total: true,
    },
  });

  // Bookings
  const currentBookings = await prisma.booking.count({
    where: {
      branchId,
      bookingDate: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  const previousBookings = await prisma.booking.count({
    where: {
      branchId,
      bookingDate: {
        gte: previousStartDate,
        lte: previousEndDate,
      },
    },
  });

  const bookingsTrend =
    previousBookings > 0
      ? ((currentBookings - previousBookings) / previousBookings) * 100
      : 0;

  // Bookings by day
  const bookingsByDay = await prisma.booking.groupBy({
    by: ["bookingDate"],
    where: {
      branchId,
      bookingDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    _count: {
      id: true,
    },
  });

  // Customer counts
  const customerCount = await prisma.booking.findMany({
    where: {
      branchId,
      bookingDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      customerId: true,
    },
    distinct: ["customerId"],
  });

  // New vs returning customers
  const allCustomerIds = customerCount.map((b) => b.customerId);
  const previousCustomerIds = await prisma.booking.findMany({
    where: {
      branchId,
      bookingDate: {
        gte: previousStartDate,
        lte: previousEndDate,
      },
    },
    select: {
      customerId: true,
    },
    distinct: ["customerId"],
  });

  const previousCustomerIdSet = new Set(
    previousCustomerIds.map((b) => b.customerId)
  );
  const newCustomers = allCustomerIds.filter(
    (id) => !previousCustomerIdSet.has(id)
  ).length;
  const returningCustomers = allCustomerIds.length - newCustomers;

  const averageTicket =
    currentBookings > 0 ? currentRevenueTotal / currentBookings : 0;

  return {
    branchId,
    branchName: branch.name,
    timeRange,
    revenue: {
      total: currentRevenueTotal,
      trend: revenueTrend,
      byDay: revenueByDay.map((r) => ({
        date: format(new Date(r.createdAt), "yyyy-MM-dd"),
        revenue: Number(r._sum.total || 0),
      })),
    },
    bookings: {
      total: currentBookings,
      trend: bookingsTrend,
      byDay: bookingsByDay.map((b) => ({
        date: format(new Date(b.bookingDate), "yyyy-MM-dd"),
        count: b._count.id,
      })),
    },
    averageTicket,
    customerCount: allCustomerIds.length,
    newCustomers,
    returningCustomers,
  };
}

/**
 * Get staff performance KPIs for a branch
 */
export async function getStaffKPIs(branchId: string): Promise<StaffKPIs[]> {
  const thirtyDaysAgo = subDays(new Date(), 30);

  const staffList = await prisma.branchStaff.findMany({
    where: {
      branchId,
      isActive: true,
    },
    include: {
      staff: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          bookings: {
            where: {
              branchId,
              bookingDate: {
                gte: thirtyDaysAgo,
              },
            },
          },
        },
      },
    },
  });

  const staffKPIs: StaffKPIs[] = [];

  for (const branchStaff of staffList) {
    const bookings = branchStaff.staff.bookings;
    const completed = bookings.filter((b) => b.status === "COMPLETED").length;
    const cancelled = bookings.filter((b) => b.status === "CANCELLED").length;
    const noShow = bookings.filter((b) => b.status === "NO_SHOW").length;

    const revenueResult = await prisma.invoice.aggregate({
      where: {
        branchId,
        invoiceItems: {
          some: {
            staffId: branchStaff.staffId,
          },
        },
        status: "PAID",
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      _sum: {
        total: true,
      },
    });

    const totalRevenue = Number(revenueResult._sum.total || 0);
    const averageTicket = completed > 0 ? totalRevenue / completed : 0;

    // Calculate workload (bookings per day average)
    const workload = bookings.length / 30; // percentage of capacity (assuming 8 bookings/day max)
    const workloadPercent = Math.min(100, (workload / 8) * 100);

    staffKPIs.push({
      staffId: branchStaff.staffId,
      staffName: `${branchStaff.staff.user.firstName} ${branchStaff.staff.user.lastName}`,
      branchId,
      bookings: {
        total: bookings.length,
        completed,
        cancelled,
        noShow,
      },
      revenue: {
        total: totalRevenue,
        averageTicket,
      },
      workload: workloadPercent,
    });
  }

  return staffKPIs;
}

/**
 * Get service performance KPIs for a branch
 */
export async function getServiceKPIs(branchId: string): Promise<ServiceKPIs[]> {
  const thirtyDaysAgo = subDays(new Date(), 60);
  const sixtyDaysAgo = subDays(new Date(), 60);

  const services = await prisma.service.findMany({
    where: { isActive: true },
  });

  const serviceKPIs: ServiceKPIs[] = [];

  for (const service of services) {
    // Current period (last 30 days)
    const currentBookings = await prisma.bookingService.count({
      where: {
        serviceId: service.id,
        booking: {
          branchId,
          bookingDate: {
            gte: thirtyDaysAgo,
          },
        },
      },
    });

    // Previous period (30-60 days ago)
    const previousBookings = await prisma.bookingService.count({
      where: {
        serviceId: service.id,
        booking: {
          branchId,
          bookingDate: {
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo,
          },
        },
      },
    });

    const bookingsTrend =
      previousBookings > 0
        ? ((currentBookings - previousBookings) / previousBookings) * 100
        : 0;

    // Revenue
    const revenueResult = await prisma.bookingService.aggregate({
      where: {
        serviceId: service.id,
        booking: {
          branchId,
          bookingDate: {
            gte: thirtyDaysAgo,
          },
        },
      },
      _sum: {
        price: true,
      },
      _avg: {
        price: true,
      },
    });

    const previousRevenueResult = await prisma.bookingService.aggregate({
      where: {
        serviceId: service.id,
        booking: {
          branchId,
          bookingDate: {
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo,
          },
        },
      },
      _sum: {
        price: true,
      },
    });

    const currentRevenue = Number(revenueResult._sum.price || 0);
    const previousRevenue = Number(previousRevenueResult._sum.price || 0);
    const revenueTrend =
      previousRevenue > 0
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
        : 0;

    // Determine popularity
    const avgBookings = await prisma.bookingService.groupBy({
      by: ["serviceId"],
      where: {
        booking: {
          branchId,
          bookingDate: {
            gte: thirtyDaysAgo,
          },
        },
      },
      _count: {
        id: true,
      },
    });

    const avgBookingCount =
      avgBookings.reduce((sum, s) => sum + s._count.id, 0) / avgBookings.length;

    let popularity: "HOT" | "NORMAL" | "COLD";
    if (currentBookings > avgBookingCount * 1.5) {
      popularity = "HOT";
    } else if (currentBookings < avgBookingCount * 0.5) {
      popularity = "COLD";
    } else {
      popularity = "NORMAL";
    }

    serviceKPIs.push({
      serviceId: service.id,
      serviceName: service.name,
      branchId,
      bookings: {
        total: currentBookings,
        trend: bookingsTrend,
      },
      revenue: {
        total: currentRevenue,
        averagePrice: Number(revenueResult._avg.price || 0),
        trend: revenueTrend,
      },
      popularity,
    });
  }

  return serviceKPIs;
}

/**
 * Get customer trends for a branch
 */
export async function getCustomerTrends(
  branchId: string
): Promise<CustomerTrends> {
  const thirtyDaysAgo = subDays(new Date(), 30);
  const sixtyDaysAgo = subDays(new Date(), 60);

  // New customers (first visit in last 30 days)
  const allBookings = await prisma.booking.findMany({
    where: {
      branchId,
      bookingDate: {
        gte: sixtyDaysAgo,
      },
    },
    select: {
      customerId: true,
      bookingDate: true,
    },
    orderBy: {
      bookingDate: "asc",
    },
  });

  const customerFirstVisit = new Map<string, Date>();
  for (const booking of allBookings) {
    if (!customerFirstVisit.has(booking.customerId)) {
      customerFirstVisit.set(booking.customerId, booking.bookingDate);
    }
  }

  const newCustomers = Array.from(customerFirstVisit.entries()).filter(
    ([_, firstVisit]) => firstVisit >= thirtyDaysAgo
  ).length;

  // Returning customers
  const recentCustomers = await prisma.booking.findMany({
    where: {
      branchId,
      bookingDate: {
        gte: thirtyDaysAgo,
      },
    },
    select: {
      customerId: true,
    },
    distinct: ["customerId"],
  });

  const returningCustomers = recentCustomers.filter(
    (c) => !customerFirstVisit.has(c.customerId) || customerFirstVisit.get(c.customerId)! < thirtyDaysAgo
  ).length;

  // Average return days
  const customerVisits = new Map<string, Date[]>();
  for (const booking of allBookings) {
    if (!customerVisits.has(booking.customerId)) {
      customerVisits.set(booking.customerId, []);
    }
    customerVisits.get(booking.customerId)!.push(booking.bookingDate);
  }

  let totalReturnDays = 0;
  let returnCount = 0;
  for (const [_, visits] of customerVisits.entries()) {
    if (visits.length > 1) {
      visits.sort((a, b) => a.getTime() - b.getTime());
      for (let i = 1; i < visits.length; i++) {
        const daysDiff =
          (visits[i].getTime() - visits[i - 1].getTime()) / (1000 * 60 * 60 * 24);
        totalReturnDays += daysDiff;
        returnCount++;
      }
    }
  }

  const averageReturnDays = returnCount > 0 ? totalReturnDays / returnCount : 0;

  // Top customers
  const topCustomersData = await prisma.booking.groupBy({
    by: ["customerId"],
    where: {
      branchId,
      bookingDate: {
        gte: thirtyDaysAgo,
      },
    },
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: "desc",
      },
    },
    take: 10,
  });

  const topCustomers = await Promise.all(
    topCustomersData.map(async (item) => {
      const customer = await prisma.customer.findUnique({
        where: { id: item.customerId },
        select: { firstName: true, lastName: true },
      });

      const revenueResult = await prisma.invoice.aggregate({
        where: {
          branchId,
          customerId: item.customerId,
          status: "PAID",
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
        _sum: {
          total: true,
        },
      });

      return {
        customerId: item.customerId,
        customerName: customer
          ? `${customer.firstName} ${customer.lastName}`
          : "Unknown",
        visits: item._count.id,
        revenue: Number(revenueResult._sum.total || 0),
      };
    })
  );

  // Churn rate (customers who haven't returned in expected time)
  const churnRate = 0; // Simplified - would need more complex logic

  return {
    branchId,
    newCustomers,
    returningCustomers,
    churnRate,
    averageReturnDays,
    topCustomers,
  };
}

/**
 * Get churn analysis for a branch
 */
export async function getChurnAnalysis(
  branchId: string
): Promise<ChurnAnalysis> {
  const ninetyDaysAgo = subDays(new Date(), 90);

  // Get customers with last visit
  const customerLastVisits = await prisma.booking.findMany({
    where: {
      branchId,
      bookingDate: {
        gte: ninetyDaysAgo,
      },
    },
    select: {
      customerId: true,
      bookingDate: true,
    },
    orderBy: {
      bookingDate: "desc",
    },
  });

  const lastVisitMap = new Map<string, Date>();
  for (const booking of customerLastVisits) {
    if (!lastVisitMap.has(booking.customerId)) {
      lastVisitMap.set(booking.customerId, booking.bookingDate);
    }
  }

  // Get predicted return dates (simplified - would use Mina engine)
  const highRiskCustomers = [];
  const now = new Date();

  for (const [customerId, lastVisit] of lastVisitMap.entries()) {
    const daysSinceLastVisit = Math.floor(
      (now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Simplified: assume average return is 30 days
    const predictedReturnDate = new Date(lastVisit);
    predictedReturnDate.setDate(predictedReturnDate.getDate() + 30);

    const daysOverdue = Math.max(0, daysSinceLastVisit - 30);

    if (daysOverdue > 7) {
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
        select: { firstName: true, lastName: true },
      });

      let riskLevel: "HIGH" | "MEDIUM" | "LOW";
      if (daysOverdue > 30) {
        riskLevel = "HIGH";
      } else if (daysOverdue > 14) {
        riskLevel = "MEDIUM";
      } else {
        riskLevel = "LOW";
      }

      highRiskCustomers.push({
        customerId,
        customerName: customer
          ? `${customer.firstName} ${customer.lastName}`
          : "Unknown",
        lastVisit,
        predictedReturnDate,
        daysOverdue,
        riskLevel,
      });
    }
  }

  // Calculate churn rate
  const totalCustomers = lastVisitMap.size;
  const churnedCustomers = highRiskCustomers.filter(
    (c) => c.riskLevel === "HIGH"
  ).length;
  const churnRate = totalCustomers > 0 ? (churnedCustomers / totalCustomers) * 100 : 0;

  return {
    branchId,
    highRiskCustomers: highRiskCustomers.slice(0, 20), // Top 20
    churnRate,
    trend: 0, // Would calculate from historical data
  };
}

/**
 * Get marketing KPIs for a branch
 */
export async function getMarketingKPIs(
  branchId: string
): Promise<MarketingKPIs> {
  const thirtyDaysAgo = subDays(new Date(), 30);

  // Loyalty impact
  const tierUpgrades = await prisma.customerLoyalty.count({
    where: {
      customer: {
        invoices: {
          some: {
            branchId,
            createdAt: {
              gte: thirtyDaysAgo,
            },
          },
        },
      },
    },
  });

  const pointsRedeemed = await prisma.loyaltyPoint.aggregate({
    where: {
      type: "REDEEMED",
      invoice: {
        branchId,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    },
    _sum: {
      points: true,
    },
  });

  const revenueFromLoyalty = await prisma.invoice.aggregate({
    where: {
      branchId,
      status: "PAID",
      customer: {
        customerLoyalty: {
          isNot: null,
        },
      },
      createdAt: {
        gte: thirtyDaysAgo,
      },
    },
    _sum: {
      total: true,
    },
  });

  return {
    branchId,
    campaigns: [], // Would integrate with marketing campaigns if available
    loyaltyImpact: {
      tierUpgrades,
      pointsRedeemed: Math.abs(Number(pointsRedeemed._sum.points || 0)),
      revenueFromLoyalty: Number(revenueFromLoyalty._sum.total || 0),
    },
  };
}

