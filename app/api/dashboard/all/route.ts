import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";

// GET /api/dashboard/all
export async function GET(request: NextRequest) {
  try {
    // Fetch all dashboard data in parallel
    const baseUrl = request.nextUrl.origin;

    const [statsRes, staffRes, timelineRes, alertsRes] = await Promise.all([
      fetch(`${baseUrl}/api/dashboard/stats`, {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      }),
      fetch(`${baseUrl}/api/dashboard/staff-performance`, {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      }),
      fetch(`${baseUrl}/api/dashboard/timeline`, {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      }),
      fetch(`${baseUrl}/api/dashboard/alerts`, {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      }),
    ]);

    if (!statsRes.ok || !staffRes.ok || !timelineRes.ok || !alertsRes.ok) {
      throw new Error("Failed to fetch dashboard data");
    }

    const [statsData, staffData, timelineData, alertsData] = await Promise.all([
      statsRes.json(),
      staffRes.json(),
      timelineRes.json(),
      alertsRes.json(),
    ]);

    return successResponse({
      stats: statsData.data,
      staffPerformance: staffData.data,
      timeline: timelineData.data,
      alerts: alertsData.data,
    });
  } catch (error: any) {
    // Return mock data if all sub-APIs fail
    return successResponse({
      stats: {
        totalRevenue: 0,
        totalBookings: 0,
        completedBookings: 0,
        noShowCount: 0,
        newCustomers: 0,
        revenueChange: 0,
      },
      staffPerformance: [],
      timeline: [],
      alerts: [],
    });
  }
}
