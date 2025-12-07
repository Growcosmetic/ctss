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

// POST /api/partner/sop/enforce
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
      return errorResponse("Only HQ can enforce SOP", 403);
    }

    const body = await request.json();
    const { 
      sopId, 
      sopVersion, 
      partnerId, // null = apply to all
      branchId,  // null = apply to all branches
      enforcementLevel = "REQUIRED",
      effectiveDate,
      expiryDate 
    } = body;

    if (!sopId) {
      return errorResponse("SOP ID is required", 400);
    }

    // Verify SOP exists
    const sop = await prisma.serviceSOP.findUnique({
      where: { id: sopId },
    });

    if (!sop) {
      return errorResponse("SOP not found", 404);
    }

    // Create enforcement record
    const enforcement = await prisma.sOPEnforcement.create({
      data: {
        partnerId: partnerId || null,
        branchId: branchId || null,
        sopId,
        sopVersion: sopVersion || sop.version,
        enforcementLevel,
        effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
      },
    });

    // Create notification for affected partners
    if (!partnerId) {
      // Broadcast to all partners
      const partners = await prisma.partner.findMany({
        where: { isActive: true },
      });

      for (const partner of partners) {
        await prisma.hQNotification.create({
          data: {
            partnerId: partner.id,
            type: "SOP_UPDATE",
            priority: enforcementLevel === "REQUIRED" ? "HIGH" : "MEDIUM",
            title: `SOP mới: ${sop.serviceName}`,
            message: `HQ đã cập nhật SOP ${sop.serviceName} với mức độ áp dụng: ${enforcementLevel}`,
            actionUrl: `/sop/${sopId}`,
          },
        });
      }
    } else {
      // Send to specific partner
      await prisma.hQNotification.create({
        data: {
          partnerId,
          type: "SOP_UPDATE",
          priority: enforcementLevel === "REQUIRED" ? "HIGH" : "MEDIUM",
          title: `SOP mới: ${sop.serviceName}`,
          message: `HQ đã cập nhật SOP ${sop.serviceName} với mức độ áp dụng: ${enforcementLevel}`,
          actionUrl: `/sop/${sopId}`,
        },
      });
    }

    return successResponse(enforcement, "SOP enforcement created successfully", 201);
  } catch (error: any) {
    console.error("Error enforcing SOP:", error);
    return errorResponse(error.message || "Failed to enforce SOP", 500);
  }
}

