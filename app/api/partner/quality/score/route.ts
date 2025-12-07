import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

function successResponse(data: any, message: string = "Success", status: number = 200) {
  return Response.json({ success: true, data, message }, { status });
}

function errorResponse(message: string, status: number = 400) {
  return Response.json({ success: false, error: message }, { status });
}

function validateToken(token: string): string | null {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return payload.userId || null;
  } catch {
    return null;
  }
}

// POST /api/partner/quality/score
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return errorResponse("Not authenticated", 401);
    }

    const userId = validateToken(token);
    if (!userId) {
      return errorResponse("Invalid token", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== "ADMIN") {
      return errorResponse("Only HQ can score partner quality", 403);
    }

    const body = await request.json();
    const { partnerId, periodStart, periodEnd } = body;

    if (!partnerId) {
      return errorResponse("Partner ID is required", 400);
    }

    const startDate = periodStart ? new Date(periodStart) : new Date();
    const endDate = periodEnd ? new Date(periodEnd) : new Date();

    // Get partner branches
    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
      include: {
        branches: true,
      },
    });

    if (!partner) {
      return errorResponse("Partner not found", 404);
    }

    const branchIds = partner.branches.map(b => b.id);

    // Get bookings first
    const bookings = await prisma.booking.findMany({
      where: {
        branchId: { in: branchIds },
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: { id: true },
    });

    const bookingIds = bookings.map(b => b.id);

    // Get quality scores
    const qualityScores = await prisma.qualityScore.findMany({
      where: {
        bookingId: { in: bookingIds },
        capturedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const overallScore = qualityScores.length > 0
      ? qualityScores.reduce((sum, s) => sum + s.overallScore, 0) / qualityScores.length
      : 0;

    const technicalScore = qualityScores.filter(s => s.technicalScore).length > 0
      ? qualityScores.reduce((sum, s) => sum + (s.technicalScore || 0), 0) / qualityScores.filter(s => s.technicalScore).length
      : null;

    // Get SOP violations
    const errors = await prisma.errorDetection.findMany({
      where: {
        bookingId: { in: bookingIds },
        detectedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalBookings = await prisma.booking.count({
      where: {
        branchId: { in: branchIds },
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const sopCompliance = totalBookings > 0
      ? ((totalBookings - errors.length) / totalBookings) * 100
      : 100;

    // Error analysis
    const errorTypes: Record<string, number> = {};
    errors.forEach(error => {
      errorTypes[error.errorType] = (errorTypes[error.errorType] || 0) + 1;
    });

    const criticalErrors = errors.filter(e => e.severity === "CRITICAL" || e.severity === "HIGH").length;

    // AI Analysis (simplified)
    const aiAnalysis = `Partner ${partner.salonName} có điểm chất lượng tổng thể ${overallScore.toFixed(1)}/100. Tỷ lệ tuân thủ SOP: ${sopCompliance.toFixed(1)}%. ${criticalErrors > 0 ? `Có ${criticalErrors} lỗi nghiêm trọng cần xử lý.` : 'Không có lỗi nghiêm trọng.'}`;

    const recommendations: string[] = [];
    if (overallScore < 80) {
      recommendations.push("Cần cải thiện chất lượng dịch vụ");
    }
    if (sopCompliance < 90) {
      recommendations.push("Tăng cường tuân thủ SOP");
    }
    if (criticalErrors > 0) {
      recommendations.push("Xử lý các lỗi nghiêm trọng ngay lập tức");
    }

    // Create quality score record
    const qualityScore = await prisma.partnerQualityScore.create({
      data: {
        partnerId,
        periodStart: startDate,
        periodEnd: endDate,
        overallScore,
        technicalScore: technicalScore || undefined,
        sopCompliance,
        errorCount: errors.length,
        errorTypes: errorTypes as any,
        criticalErrors,
        aiAnalysis,
        recommendations,
      },
    });

    return successResponse(qualityScore);
  } catch (error: any) {
    console.error("Error scoring partner quality:", error);
    return errorResponse(error.message || "Failed to score quality", 500);
  }
}

