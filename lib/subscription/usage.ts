/**
 * Phase 8 - Usage Tracking Helpers
 */

import { prisma } from "../prisma";
import { format, startOfMonth, endOfMonth } from "date-fns";

/**
 * Get usage for current month
 */
export async function getCurrentUsage(salonId: string) {
  const period = format(new Date(), "yyyyMM");
  const startDate = startOfMonth(new Date());
  const endDate = endOfMonth(new Date());

  // Get tracked usage
  const trackedUsage = await prisma.usageTracking.findMany({
    where: {
      salonId,
      period,
    },
  });

  // Get actual counts from database (for accuracy)
  const [bookingsCount, invoicesCount, customersCount, staffCount] = await Promise.all([
    prisma.booking.count({
      where: {
        salonId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    }),
    prisma.invoice.count({
      where: {
        salonId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    }),
    prisma.customer.count({
      where: {
        salonId,
      },
    }),
    prisma.user.count({
      where: {
        salonId,
        role: {
          not: "OWNER", // Don't count owner
        },
      },
    }),
  ]);

  return {
    bookings: bookingsCount,
    invoices: invoicesCount,
    customers: customersCount,
    staff: staffCount,
    tracked: trackedUsage.reduce((acc, u) => {
      acc[u.metric] = u.count;
      return acc;
    }, {} as Record<string, number>),
  };
}

/**
 * Sync usage tracking with actual database counts
 */
export async function syncUsage(salonId: string) {
  const period = format(new Date(), "yyyyMM");
  const startDate = startOfMonth(new Date());
  const endDate = endOfMonth(new Date());

  const [bookingsCount, invoicesCount, customersCount, staffCount] = await Promise.all([
    prisma.booking.count({
      where: {
        salonId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    }),
    prisma.invoice.count({
      where: {
        salonId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    }),
    prisma.customer.count({
      where: {
        salonId,
      },
    }),
    prisma.user.count({
      where: {
        salonId,
        role: {
          not: "OWNER",
        },
      },
    }),
  ]);

  // Update or create usage records
  await Promise.all([
    prisma.usageTracking.upsert({
      where: {
        salonId_period_metric: {
          salonId,
          period,
          metric: "bookings",
        },
      },
      update: { count: bookingsCount },
      create: {
        salonId,
        period,
        metric: "bookings",
        count: bookingsCount,
      },
    }),
    prisma.usageTracking.upsert({
      where: {
        salonId_period_metric: {
          salonId,
          period,
          metric: "invoices",
        },
      },
      update: { count: invoicesCount },
      create: {
        salonId,
        period,
        metric: "invoices",
        count: invoicesCount,
      },
    }),
    prisma.usageTracking.upsert({
      where: {
        salonId_period_metric: {
          salonId,
          period,
          metric: "customers",
        },
      },
      update: { count: customersCount },
      create: {
        salonId,
        period,
        metric: "customers",
        count: customersCount,
      },
    }),
    prisma.usageTracking.upsert({
      where: {
        salonId_period_metric: {
          salonId,
          period,
          metric: "staff",
        },
      },
      update: { count: staffCount },
      create: {
        salonId,
        period,
        metric: "staff",
        count: staffCount,
      },
    }),
  ]);
}

