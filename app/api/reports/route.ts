import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

// GET /api/reports - Get reports or generate report data
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    if (!type) {
      return errorResponse("Report type is required", 400);
    }

    const dateFromObj = dateFrom ? new Date(dateFrom) : new Date(new Date().setDate(1)); // First day of current month
    const dateToObj = dateTo ? new Date(dateTo) : new Date();

    let reportData: any = {};

    switch (type) {
      case "SALES":
        reportData = await getSalesReport(dateFromObj, dateToObj);
        break;
      case "REVENUE":
        reportData = await getRevenueReport(dateFromObj, dateToObj);
        break;
      case "STAFF_PERFORMANCE":
        reportData = await getStaffPerformanceReport(dateFromObj, dateToObj);
        break;
      case "CUSTOMER_ANALYTICS":
        reportData = await getCustomerAnalyticsReport(dateFromObj, dateToObj);
        break;
      case "INVENTORY":
        reportData = await getInventoryReport();
        break;
      case "BOOKING":
        reportData = await getBookingReport(dateFromObj, dateToObj);
        break;
      default:
        return errorResponse("Invalid report type", 400);
    }

    return successResponse(reportData);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to generate report", 500);
  }
}

// POST /api/reports - Save a report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, title, filters, data, generatedBy } = body;

    if (!type || !title) {
      return errorResponse("Type and title are required", 400);
    }

    const report = await prisma.report.create({
      data: {
        type,
        title,
        filters: filters || {},
        data: data || {},
        generatedBy: generatedBy || "system",
      },
    });

    return successResponse(report, "Report saved successfully", 201);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to save report", 500);
  }
}

// Helper functions for different report types
async function getSalesReport(dateFrom: Date, dateTo: Date) {
  const orders = await prisma.posOrder.findMany({
    where: {
      createdAt: {
        gte: dateFrom,
        lte: dateTo,
      },
      status: "COMPLETED",
    },
    include: {
      posItems: true,
    },
  });

  const totalSales = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const totalOrders = orders.length;
  const averageOrder = totalOrders > 0 ? totalSales / totalOrders : 0;

  return {
    period: { from: dateFrom, to: dateTo },
    totalSales,
    totalOrders,
    averageOrder,
    orders: orders.length,
  };
}

async function getRevenueReport(dateFrom: Date, dateTo: Date) {
  const orders = await prisma.posOrder.findMany({
    where: {
      createdAt: {
        gte: dateFrom,
        lte: dateTo,
      },
      status: "COMPLETED",
    },
  });

  const revenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const byType = orders.reduce((acc: any, o) => {
    acc[o.type] = (acc[o.type] || 0) + Number(o.total);
    return acc;
  }, {});

  return {
    period: { from: dateFrom, to: dateTo },
    totalRevenue: revenue,
    byType,
  };
}

async function getStaffPerformanceReport(dateFrom: Date, dateTo: Date) {
  const staffPerformance = await prisma.staff.findMany({
    include: {
      posOrders: {
        where: {
          createdAt: {
            gte: dateFrom,
            lte: dateTo,
          },
          status: "COMPLETED",
        },
      },
      bookings: {
        where: {
          bookingDate: {
            gte: dateFrom,
            lte: dateTo,
          },
        },
      },
    },
  });

  return staffPerformance.map((staff) => ({
    staffId: staff.id,
    employeeId: staff.employeeId,
    totalSales: staff.posOrders.reduce((sum, o) => sum + Number(o.total), 0),
    totalBookings: staff.bookings.length,
    completedBookings: staff.bookings.filter((b) => b.status === "COMPLETED").length,
  }));
}

async function getCustomerAnalyticsReport(dateFrom: Date, dateTo: Date) {
  const customers = await prisma.customer.findMany({
    include: {
      posOrders: {
        where: {
          createdAt: {
            gte: dateFrom,
            lte: dateTo,
          },
          status: "COMPLETED",
        },
      },
      bookings: {
        where: {
          bookingDate: {
            gte: dateFrom,
            lte: dateTo,
          },
        },
      },
    },
  });

  return {
    totalCustomers: customers.length,
    activeCustomers: customers.filter((c) => c.status === "ACTIVE").length,
    newCustomers: customers.filter((c) => c.createdAt >= dateFrom).length,
    topCustomers: customers
      .map((c) => ({
        id: c.id,
        name: `${c.firstName} ${c.lastName}`,
        totalSpent: Number(c.totalSpent),
        totalVisits: c.totalVisits,
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10),
  };
}

async function getInventoryReport() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
    },
  });

  const lowStock = products.filter(
    (p) => p.stockQuantity <= p.minStockLevel
  );

  const totalValue = products.reduce(
    (sum, p) => sum + Number(p.cost) * p.stockQuantity,
    0
  );

  return {
    totalProducts: products.length,
    activeProducts: products.filter((p) => p.isActive).length,
    lowStockCount: lowStock.length,
    lowStockItems: lowStock.map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      stockQuantity: p.stockQuantity,
      minStockLevel: p.minStockLevel,
    })),
    totalInventoryValue: totalValue,
  };
}

async function getBookingReport(dateFrom: Date, dateTo: Date) {
  const bookings = await prisma.booking.findMany({
    where: {
      bookingDate: {
        gte: dateFrom,
        lte: dateTo,
      },
    },
  });

  const byStatus = bookings.reduce((acc: any, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});

  return {
    period: { from: dateFrom, to: dateTo },
    totalBookings: bookings.length,
    byStatus,
    completed: bookings.filter((b) => b.status === "COMPLETED").length,
    cancelled: bookings.filter((b) => b.status === "CANCELLED").length,
  };
}

