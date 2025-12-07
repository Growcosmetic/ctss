// ============================================
// Service Cost - Analysis by Stylist
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const staffId = searchParams.get("staffId");
    const serviceId = searchParams.get("serviceId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Get mix logs (which contain staffId and serviceId)
    const mixLogWhere: any = {};
    if (staffId) mixLogWhere.staffId = staffId;
    if (serviceId) mixLogWhere.serviceId = serviceId;
    if (startDate || endDate) {
      mixLogWhere.createdAt = {};
      if (startDate) mixLogWhere.createdAt.gte = new Date(startDate);
      if (endDate) mixLogWhere.createdAt.lte = new Date(endDate);
    }

    const mixLogs = await prisma.mixLog.findMany({
      where: mixLogWhere,
      include: {
        product: true,
        staff: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Group by staff and service
    const staffAnalysis: Record<
      string,
      {
        staffId: string;
        staffName: string;
        services: Record<
          string,
          {
            serviceId: string;
            serviceName: string;
            count: number;
            totalCost: number;
            averageCost: number;
            totalQuantity: number;
            averageQuantity: number;
            wasteRate: number; // Hao hụt (nếu có expectedQty)
          }
        >;
        totalCost: number;
        averageCostPerService: number;
        totalServices: number;
      }
    > = {};

    for (const log of mixLogs) {
      const staffId = log.staffId;
      const serviceId = log.serviceId || "unknown";

      if (!staffAnalysis[staffId]) {
        staffAnalysis[staffId] = {
          staffId,
          staffName: log.staff.name,
          services: {},
          totalCost: 0,
          averageCostPerService: 0,
          totalServices: 0,
        };
      }

      if (!staffAnalysis[staffId].services[serviceId]) {
        staffAnalysis[staffId].services[serviceId] = {
          serviceId,
          serviceName: serviceId !== "unknown" ? serviceId : "Không xác định",
          count: 0,
          totalCost: 0,
          averageCost: 0,
          totalQuantity: 0,
          averageQuantity: 0,
          wasteRate: 0,
        };
      }

      const service = staffAnalysis[staffId].services[serviceId];
      service.count++;
      service.totalCost += log.cost;
      service.totalQuantity += log.actualQty;
      service.averageCost = service.totalCost / service.count;
      service.averageQuantity = service.totalQuantity / service.count;

      // Calculate waste rate if expectedQty exists
      if (log.expectedQty && log.expectedQty > 0) {
        const waste = log.actualQty - log.expectedQty;
        service.wasteRate =
          (service.wasteRate * (service.count - 1) +
            (waste / log.expectedQty) * 100) /
          service.count;
      }
    }

    // Calculate totals
    for (const staffId in staffAnalysis) {
      const staff = staffAnalysis[staffId];
      staff.totalServices = Object.keys(staff.services).length;
      staff.totalCost = Object.values(staff.services).reduce(
        (sum, s) => sum + s.totalCost,
        0
      );
      const totalServiceCount = Object.values(staff.services).reduce(
        (sum, s) => sum + s.count,
        0
      );
      staff.averageCostPerService =
        totalServiceCount > 0 ? staff.totalCost / totalServiceCount : 0;
    }

    // Get service names
    if (serviceId) {
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
        select: { name: true },
      });
      for (const staffId in staffAnalysis) {
        if (staffAnalysis[staffId].services[serviceId]) {
          staffAnalysis[staffId].services[serviceId].serviceName =
            service?.name || serviceId;
        }
      }
    }

    return NextResponse.json({
      success: true,
      analysis: Object.values(staffAnalysis),
      total: Object.keys(staffAnalysis).length,
    });
  } catch (err: any) {
    console.error("Service cost analysis error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to analyze service costs",
      },
      { status: 500 }
    );
  }
}

