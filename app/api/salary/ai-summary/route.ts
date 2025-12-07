import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { cookies } from "next/headers";
import { generateSalarySummary, detectSalaryAnomalies } from "@/features/salary/services/salaryAI";

// Simple token validation
function validateToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [userId] = decoded.split(":");
    return userId || null;
  } catch {
    return null;
  }
}

// GET /api/salary/ai-summary
export async function GET(request: NextRequest) {
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

    // Check permissions
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return errorResponse("User not found", 404);
    }

    if (user.role !== "ADMIN" && user.role !== "MANAGER") {
      return errorResponse("Access denied", 403);
    }

    const searchParams = request.nextUrl.searchParams;
    const staffId = searchParams.get("staffId");
    const month = searchParams.get("month");
    const branchId = searchParams.get("branchId");

    if (staffId && month) {
      // Single staff summary
      const summary = await generateSalarySummary(staffId, month);
      return successResponse(summary);
    } else if (branchId && month) {
      // Anomalies for all staff in branch
      const anomalies = await detectSalaryAnomalies(branchId, month);
      return successResponse(anomalies);
    } else {
      return errorResponse("staffId+month or branchId+month required", 400);
    }
  } catch (error: any) {
    console.error("Error generating AI summary:", error);
    return errorResponse(error.message || "Failed to generate summary", 500);
  }
}

