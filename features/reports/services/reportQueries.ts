// ============================================
// Report Queries - Optimized Prisma Queries
// ============================================

import { prisma } from "@/lib/prisma";
import { RevenueSummary, ServiceReport, StaffReport, BookingBehavior } from "../types";

/**
 * Get revenue summary for date range
 */
export async function getRevenueSummary(
  startDate: Date,
  endDate: Date
): Promise<RevenueSummary> {
  // Get all paid invoices in date range
  const invoices = await prisma.invoice.findMany({
    where: {
      status: "PAID",
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      total: true,
      discountAmount: true,
      paymentMethod: true,
      createdAt: true,
    },
  });

  // Calculate totals
  const totalRevenue = invoices.reduce((sum, inv) => sum + Number(inv.total), 0);
  const totalDiscount = invoices.reduce((sum, inv) => sum + Number(inv.discountAmount), 0);
  const totalInvoices = invoices.length;

  // Revenue by payment method
  const revenueByPaymentMethod = {
    CASH: 0,
    TRANSFER: 0,
    CARD: 0,
    OTHER: 0,
  };

  invoices.forEach((inv) => {
    const method = inv.paymentMethod || "OTHER";
    if (method in revenueByPaymentMethod) {
      revenueByPaymentMethod[method as keyof typeof revenueByPaymentMethod] += Number(inv.total);
    } else {
      revenueByPaymentMethod.OTHER += Number(inv.total);
    }
  });

  // Revenue by day
  const revenueByDayMap = new Map<string, { revenue: number; count: number }>();

  invoices.forEach((inv) => {
    const dateKey = inv.createdAt.toISOString().split("T")[0];
    const existing = revenueByDayMap.get(dateKey) || { revenue: 0, count: 0 };
    revenueByDayMap.set(dateKey, {
      revenue: existing.revenue + Number(inv.total),
      count: existing.count + 1,
    });
  });

  const revenueByDay = Array.from(revenueByDayMap.entries())
    .map(([date, data]) => ({
      date,
      revenue: data.revenue,
      count: data.count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalRevenue,
    totalDiscount,
    totalInvoices,
    revenueByPaymentMethod,
    revenueByDay,
  };
}

/**
 * Get service report for date range
 */
export async function getServiceReport(
  startDate: Date,
  endDate: Date
): Promise<ServiceReport[]> {
  // Get invoice items with services in date range
  const invoiceItems = await prisma.invoiceItem.findMany({
    where: {
      serviceId: {
        not: null,
      },
      invoice: {
        status: "PAID",
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    },
    include: {
      service: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Group by service
  const serviceMap = new Map<
    string,
    { serviceId: string; serviceName: string; count: number; totalRevenue: number }
  >();

  invoiceItems.forEach((item) => {
    if (!item.service) return;

    const existing = serviceMap.get(item.serviceId || "");
    if (existing) {
      existing.count += item.quantity;
      existing.totalRevenue += Number(item.lineTotal);
    } else {
      serviceMap.set(item.serviceId || "", {
        serviceId: item.service.id,
        serviceName: item.service.name,
        count: item.quantity,
        totalRevenue: Number(item.lineTotal),
      });
    }
  });

  // Convert to array and calculate averages
  const services: ServiceReport[] = Array.from(serviceMap.values()).map((s) => ({
    serviceId: s.serviceId,
    serviceName: s.serviceName,
    count: s.count,
    totalRevenue: s.totalRevenue,
    averagePrice: s.totalRevenue / s.count,
  }));

  // Sort by total revenue descending
  return services.sort((a, b) => b.totalRevenue - a.totalRevenue);
}

/**
 * Get staff report for date range
 */
export async function getStaffReport(
  startDate: Date,
  endDate: Date
): Promise<StaffReport[]> {
  // Get invoice items with staff in date range
  const invoiceItems = await prisma.invoiceItem.findMany({
    where: {
      staffId: {
        not: null,
      },
      invoice: {
        status: "PAID",
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
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
        },
      },
      invoice: {
        select: {
          customerId: true,
        },
      },
    },
  });

  // Group by staff
  const staffMap = new Map<
    string,
    {
      staffId: string;
      staffName: string;
      totalRevenue: number;
      customerIds: Set<string>;
    }
  >();

  invoiceItems.forEach((item) => {
    if (!item.staff) return;

    const existing = staffMap.get(item.staffId || "");
    const staffName = `${item.staff.user.firstName} ${item.staff.user.lastName}`;

    if (existing) {
      existing.totalRevenue += Number(item.lineTotal);
      if (item.invoice.customerId) {
        existing.customerIds.add(item.invoice.customerId);
      }
    } else {
      staffMap.set(item.staffId || "", {
        staffId: item.staff.id,
        staffName,
        totalRevenue: Number(item.lineTotal),
        customerIds: item.invoice.customerId ? new Set([item.invoice.customerId]) : new Set(),
      });
    }
  });

  // Convert to array and calculate averages
  const staff: StaffReport[] = Array.from(staffMap.values()).map((s) => ({
    staffId: s.staffId,
    staffName: s.staffName,
    totalRevenue: s.totalRevenue,
    customersServed: s.customerIds.size,
    avgTicket: s.totalRevenue / Math.max(s.customerIds.size, 1),
  }));

  // Sort by total revenue descending
  return staff.sort((a, b) => b.totalRevenue - a.totalRevenue);
}

/**
 * Get booking behavior for date range
 */
export async function getBookingBehavior(
  startDate: Date,
  endDate: Date
): Promise<BookingBehavior> {
  // Get all bookings in date range
  const bookings = await prisma.booking.findMany({
    where: {
      bookingDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      customer: {
        select: {
          id: true,
          createdAt: true,
        },
      },
    },
  });

  // Calculate new vs returning customers
  const customerFirstBookingMap = new Map<string, Date>();
  let newCustomers = 0;
  let returningCustomers = 0;

  bookings.forEach((booking) => {
    const customerId = booking.customerId;
    const bookingDate = new Date(booking.bookingDate);

    if (!customerFirstBookingMap.has(customerId)) {
      // Check if this is the customer's first booking ever
      const customerCreatedAt = new Date(booking.customer.createdAt);
      if (bookingDate.getTime() - customerCreatedAt.getTime() < 7 * 24 * 60 * 60 * 1000) {
        // Within 7 days of customer creation
        newCustomers++;
      } else {
        returningCustomers++;
      }
      customerFirstBookingMap.set(customerId, bookingDate);
    } else {
      returningCustomers++;
    }
  });

  // Count no-shows
  const noShowCount = bookings.filter((b) => b.status === "NO_SHOW").length;

  // Booking by day
  const bookingByDayMap = new Map<
    string,
    { count: number; confirmed: number; completed: number; cancelled: number; noShow: number }
  >();

  bookings.forEach((booking) => {
    const dateKey = booking.bookingDate.toISOString().split("T")[0];
    const existing = bookingByDayMap.get(dateKey) || {
      count: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      noShow: 0,
    };

    existing.count++;
    if (booking.status === "CONFIRMED") existing.confirmed++;
    if (booking.status === "COMPLETED") existing.completed++;
    if (booking.status === "CANCELLED") existing.cancelled++;
    if (booking.status === "NO_SHOW") existing.noShow++;

    bookingByDayMap.set(dateKey, existing);
  });

  const bookingByDay = Array.from(bookingByDayMap.entries())
    .map(([date, data]) => ({
      date,
      ...data,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    newCustomers,
    returningCustomers,
    noShowCount,
    bookingByDay,
  };
}

