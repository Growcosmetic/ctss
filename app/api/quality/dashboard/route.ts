// ============================================
// Quality Control - QC Dashboard
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.capturedAt = {};
      if (startDate) dateFilter.capturedAt.gte = new Date(startDate);
      if (endDate) dateFilter.capturedAt.lte = new Date(endDate);
    }

    // Get quality scores
    const qualityScores = await prisma.qualityScore.findMany({
      where: dateFilter,
    });

    // Get errors
    const errors = await prisma.errorDetection.findMany({
      where: dateFilter,
    });

    // Get audits
    const audits = await prisma.postServiceAudit.findMany({
      where: dateFilter,
    });

    // Calculate quality by staff
    const staffQuality: Record<
      string,
      {
        staffId: string;
        avgScore: number;
        totalServices: number;
        errorCount: number;
        auditAvgScore: number;
      }
    > = {};

    for (const score of qualityScores) {
      const staffId = score.staffId || "unknown";
      if (!staffQuality[staffId]) {
        staffQuality[staffId] = {
          staffId,
          avgScore: 0,
          totalServices: 0,
          errorCount: 0,
          auditAvgScore: 0,
        };
      }
      staffQuality[staffId].avgScore += score.overallScore;
      staffQuality[staffId].totalServices++;
    }

    for (const error of errors) {
      const staffId = error.staffId || "unknown";
      if (!staffQuality[staffId]) {
        staffQuality[staffId] = {
          staffId,
          avgScore: 0,
          totalServices: 0,
          errorCount: 0,
          auditAvgScore: 0,
        };
      }
      staffQuality[staffId].errorCount++;
    }

    for (const audit of audits) {
      const staffId = audit.staffId || "unknown";
      if (!staffQuality[staffId]) {
        staffQuality[staffId] = {
          staffId,
          avgScore: 0,
          totalServices: 0,
          errorCount: 0,
          auditAvgScore: 0,
        };
      }
      staffQuality[staffId].auditAvgScore += audit.auditScore;
    }

    // Calculate averages
    for (const staffId in staffQuality) {
      const staff = staffQuality[staffId];
      if (staff.totalServices > 0) {
        staff.avgScore = Math.round((staff.avgScore / staff.totalServices) * 100) / 100;
      }
      const auditCount = audits.filter((a) => (a.staffId || "unknown") === staffId).length;
      if (auditCount > 0) {
        staff.auditAvgScore = Math.round((staff.auditAvgScore / auditCount) * 100) / 100;
      }
    }

    // Error statistics
    const errorStats = {
      total: errors.length,
      byType: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
      byService: {} as Record<string, number>,
    };

    for (const error of errors) {
      errorStats.byType[error.errorType] = (errorStats.byType[error.errorType] || 0) + 1;
      errorStats.bySeverity[error.severity] = (errorStats.bySeverity[error.severity] || 0) + 1;
      
      if (error.serviceId) {
        const serviceId = error.serviceId;
        errorStats.byService[serviceId] = (errorStats.byService[serviceId] || 0) + 1;
      }
    }

    // Service quality statistics
    const serviceQuality: Record<
      string,
      {
        serviceId: string;
        avgScore: number;
        errorCount: number;
        totalServices: number;
      }
    > = {};

    for (const score of qualityScores) {
      if (score.serviceId) {
        const serviceId = score.serviceId;
        if (!serviceQuality[serviceId]) {
          serviceQuality[serviceId] = {
            serviceId,
            avgScore: 0,
            errorCount: 0,
            totalServices: 0,
          };
        }
        serviceQuality[serviceId].avgScore += score.overallScore;
        serviceQuality[serviceId].totalServices++;
      }
    }

    for (const error of errors) {
      if (error.serviceId) {
        const serviceId = error.serviceId;
        if (!serviceQuality[serviceId]) {
          serviceQuality[serviceId] = {
            serviceId,
            avgScore: 0,
            errorCount: 0,
            totalServices: 0,
          };
        }
        serviceQuality[serviceId].errorCount++;
      }
    }

    // Calculate averages
    for (const serviceId in serviceQuality) {
      const service = serviceQuality[serviceId];
      if (service.totalServices > 0) {
        service.avgScore = Math.round((service.avgScore / service.totalServices) * 100) / 100;
      }
    }

    // Overall statistics
    const overallAvgScore =
      qualityScores.length > 0
        ? qualityScores.reduce((sum, s) => sum + s.overallScore, 0) / qualityScores.length
        : 0;

    const overallAuditScore =
      audits.length > 0
        ? audits.reduce((sum, a) => sum + a.auditScore, 0) / audits.length
        : 0;

    // Trend analysis (simplified - can be enhanced)
    const recentScores = qualityScores
      .slice(-10)
      .map((s) => s.overallScore);
    const olderScores = qualityScores
      .slice(-20, -10)
      .map((s) => s.overallScore);

    const recentAvg = recentScores.length > 0
      ? recentScores.reduce((sum, s) => sum + s, 0) / recentScores.length
      : 0;
    const olderAvg = olderScores.length > 0
      ? olderScores.reduce((sum, s) => sum + s, 0) / olderScores.length
      : 0;

    const trend = recentAvg > olderAvg ? "IMPROVING" : recentAvg < olderAvg ? "DECLINING" : "STABLE";

    return NextResponse.json({
      success: true,
      dashboard: {
        overall: {
          avgQualityScore: Math.round(overallAvgScore * 100) / 100,
          avgAuditScore: Math.round(overallAuditScore * 100) / 100,
          totalServices: qualityScores.length,
          totalErrors: errors.length,
          errorRate: qualityScores.length > 0
            ? (errors.length / qualityScores.length) * 100
            : 0,
          trend,
        },
        staffPerformance: Object.values(staffQuality),
        serviceQuality: Object.values(serviceQuality),
        errorStatistics: errorStats,
        topErrors: Object.entries(errorStats.byType)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([type, count]) => ({ type, count })),
        recentAudits: audits.slice(0, 10),
      },
    });
  } catch (err: any) {
    console.error("Get QC dashboard error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get dashboard",
      },
      { status: 500 }
    );
  }
}

