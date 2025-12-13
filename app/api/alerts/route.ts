import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireSalonId } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { AlertStatus, AlertSeverity } from "@prisma/client";

/**
 * Phase 10.2 - Alerts API
 * 
 * GET /api/alerts - Get alerts for current salon
 * POST /api/alerts/:id/acknowledge - Acknowledge an alert
 * POST /api/alerts/:id/resolve - Resolve an alert
 * POST /api/alerts/:id/dismiss - Dismiss an alert
 */

// GET /api/alerts - Get alerts
export async function GET(request: NextRequest) {
  try {
    const salonId = await requireSalonId(request);

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") as AlertStatus | null;
    const severity = searchParams.get("severity") as AlertSeverity | null;
    const limit = parseInt(searchParams.get("limit") || "50");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const where: any = {
      salonId,
    };

    if (status) {
      where.status = status;
    } else if (unreadOnly) {
      where.status = "ACTIVE";
    }

    if (severity) {
      where.severity = severity;
    }

    const alerts = await prisma.systemAlert.findMany({
      where,
      orderBy: [
        { severity: "desc" }, // CRITICAL first
        { createdAt: "desc" },
      ],
      take: limit,
    });

    // Count by status
    const counts = await Promise.all([
      prisma.systemAlert.count({
        where: { salonId, status: "ACTIVE" },
      }),
      prisma.systemAlert.count({
        where: { salonId, severity: "CRITICAL", status: "ACTIVE" },
      }),
      prisma.systemAlert.count({
        where: { salonId, severity: "HIGH", status: "ACTIVE" },
      }),
    ]);

    return successResponse({
      alerts,
      counts: {
        active: counts[0],
        critical: counts[1],
        high: counts[2],
      },
    });
  } catch (error: any) {
    console.error("[Alerts API] Error:", error);
    return errorResponse(error.message || "Failed to get alerts", 500);
  }
}

