// ============================================
// Operations - Get Dashboard Data
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date"); // Format: YYYY-MM-DD
    const role = searchParams.get("role");

    // Calculate date range
    const startDate = date
      ? new Date(date + "T00:00:00.000Z")
      : new Date(new Date().setHours(0, 0, 0, 0));
    const endDate = date
      ? new Date(date + "T23:59:59.999Z")
      : new Date(new Date().setHours(23, 59, 59, 999));

    // Build where clause
    const where: any = {
      timestamp: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (role) {
      where.role = role;
    }

    // Get logs
    const logs = await prisma.operationLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: { timestamp: "desc" },
      take: 200,
    });

    // Calculate KPIs
    const totalActions = logs.length;
    const receptionistCount = logs.filter((l) => l.role === "receptionist").length;
    const stylistCount = logs.filter((l) => l.role === "stylist").length;
    const assistantCount = logs.filter((l) => l.role === "assistant").length;
    const onlineCount = logs.filter((l) => l.role === "online").length;

    // Count by SOP step
    const stepCounts: Record<number, number> = {};
    logs.forEach((log) => {
      stepCounts[log.sopStep] = (stepCounts[log.sopStep] || 0) + 1;
    });

    // Get active customers (customers with logs in last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const activeCustomers = await prisma.operationLog.findMany({
      where: {
        timestamp: {
          gte: oneHourAgo,
        },
        customerId: {
          not: null,
        },
      },
      select: {
        customerId: true,
        role: true,
        sopStep: true,
        action: true,
      },
      distinct: ["customerId"],
    });

    // Group by role and step
    const byRoleAndStep: Record<string, Record<number, number>> = {};
    logs.forEach((log) => {
      if (!byRoleAndStep[log.role]) {
        byRoleAndStep[log.role] = {};
      }
      byRoleAndStep[log.role][log.sopStep] =
        (byRoleAndStep[log.role][log.sopStep] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      logs,
      kpi: {
        totalActions,
        receptionist: receptionistCount,
        stylist: stylistCount,
        assistant: assistantCount,
        online: onlineCount,
        stepCounts,
        byRoleAndStep,
      },
      activeCustomers: activeCustomers.length,
      date: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
    });
  } catch (err: any) {
    console.error("Get dashboard data error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get dashboard data",
      },
      { status: 500 }
    );
  }
}

