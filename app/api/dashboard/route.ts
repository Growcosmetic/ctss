import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

// GET /api/dashboard - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startDate = dateFrom ? new Date(dateFrom) : today;
    const endDate = dateTo ? new Date(dateTo) : tomorrow;

    // Today's revenue
    const todayRevenue = await prisma.posOrder.aggregate({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
        status: "COMPLETED",
      },
      _sum: {
        total: true,
      },
    });

    // Today's bookings
    const todayBookings = await prisma.booking.count({
      where: {
        bookingDate: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // New customers today
    const newCustomersToday = await prisma.customer.count({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // Active staff today
    const activeStaffToday = await prisma.staffShift.count({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
        status: {
          in: ["CONFIRMED", "IN_PROGRESS"],
        },
      },
    });

    // Recent bookings
    const recentBookings = await prisma.booking.findMany({
      take: 5,
          orderBy: { date: "desc" },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
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
      },
    });

    // Revenue chart data (last 30 days)
    const revenueChartData = [];
    const bookingChartData = [];
    const customerChartData = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const [revenue, bookings, customerBookings] = await Promise.all([
        prisma.posOrder.aggregate({
          where: {
            createdAt: {
              gte: date,
              lt: nextDate,
            },
            status: "COMPLETED",
          },
          _sum: {
            total: true,
          },
        }),
        prisma.booking.count({
          where: {
            bookingDate: {
              gte: date,
              lt: nextDate,
            },
          },
        }),
        prisma.booking.findMany({
          where: {
            bookingDate: {
              gte: date,
              lt: nextDate,
            },
          },
          select: {
            customerId: true,
          },
        }),
      ]);

      // Calculate unique customers
      const uniqueCustomers = new Set(
        customerBookings.map((b) => b.customerId).filter((id) => id !== null)
      );
      const customers = uniqueCustomers.size;

      revenueChartData.push({
        date: date.toISOString().split("T")[0],
        revenue: Number(revenue._sum.total || 0),
      });

      bookingChartData.push({
        date: date.toISOString().split("T")[0],
        bookings,
      });

      customerChartData.push({
        date: date.toISOString().split("T")[0],
        customers: customers,
      });
    }

    // Top services (by booking count)
    const topServices = await prisma.bookingService.groupBy({
      by: ["serviceId"],
      _count: {
        serviceId: true,
      },
      orderBy: {
        _count: {
          serviceId: "desc",
        },
      },
      take: 5,
    });

    const topServicesWithDetails = await Promise.all(
      topServices.map(async (item) => {
        const service = await prisma.service.findUnique({
          where: { id: item.serviceId },
          include: {
            category: true,
            servicePrices: {
              where: { isActive: true },
              orderBy: { effectiveFrom: "desc" },
              take: 1,
            },
          },
        });
        return {
          service,
          count: item._count.serviceId,
        };
      })
    );

    // Top stylists (by revenue)
    const topStylists = await prisma.staff.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        posOrders: {
          where: {
            createdAt: {
              gte: new Date(new Date().setDate(new Date().getDate() - 30)),
            },
            status: "COMPLETED",
          },
        },
      },
      take: 5,
    });

    const topStylistsWithStats = topStylists.map((staff) => ({
      id: staff.id,
      employeeId: staff.employeeId,
      name: `${staff.user.firstName} ${staff.user.lastName}`,
      avatar: staff.user.avatar,
      totalRevenue: staff.posOrders.reduce((sum, o) => sum + Number(o.total), 0),
      totalOrders: staff.posOrders.length,
    })).sort((a, b) => b.totalRevenue - a.totalRevenue);

    // Additional stats
    const totalCustomers = await prisma.customer.count();
    const totalRevenue = await prisma.posOrder.aggregate({
      where: {
        status: "COMPLETED",
      },
      _sum: {
        total: true,
      },
    });

    return successResponse({
      stats: {
        todayRevenue: Number(todayRevenue._sum.total || 0),
        todayBookings,
        newCustomersToday,
        activeStaffToday,
        totalCustomers,
        totalRevenue: Number(totalRevenue._sum.total || 0),
      },
      recentBookings,
      revenueChart: revenueChartData,
      bookingChart: bookingChartData,
      customerChart: customerChartData,
      topServices: topServicesWithDetails,
      topStylists: topStylistsWithStats,
    });
  } catch (error: any) {
    console.error("Dashboard API Error:", error);
    console.error("Error stack:", error.stack);
    
    // Return default/mock data if database is not available
    // This allows the UI to still render during development
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Generate empty chart data
    const revenueChartData = [];
    const customerChartData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      revenueChartData.push({
        date: date.toISOString().split("T")[0],
        revenue: 0,
      });
      customerChartData.push({
        date: date.toISOString().split("T")[0],
        customers: 0,
      });
    }
    
    return successResponse({
      stats: {
        todayRevenue: 0,
        todayBookings: 0,
        newCustomersToday: 0,
        activeStaffToday: 0,
        totalCustomers: 0,
        totalRevenue: 0,
      },
      recentBookings: [],
      revenueChart: revenueChartData,
      bookingChart: revenueChartData.map(item => ({ date: item.date, bookings: 0 })),
      customerChart: customerChartData,
      topServices: [],
      topStylists: [],
    });
  }
}

