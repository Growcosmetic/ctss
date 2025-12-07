// ============================================
// MOCK ME - For testing without database
// ============================================

import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { cookies } from "next/headers";

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

// GET /api/auth/me-mock
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

    // Return mock user based on token
    // In real app, this would query database
    const mockUser = {
      id: userId,
      email: userId.includes("admin") ? "admin@ctss.com" : 
             userId.includes("manager") ? "manager@ctss.com" :
             userId.includes("reception") ? "reception@ctss.com" :
             userId.includes("stylist") ? "stylist@ctss.com" :
             "assistant@ctss.com",
      firstName: userId.includes("admin") ? "Admin" : 
                 userId.includes("manager") ? "Manager" :
                 userId.includes("reception") ? "Reception" :
                 userId.includes("stylist") ? "Stylist" :
                 "Assistant",
      lastName: "User",
      role: userId.includes("admin") ? "ADMIN" : 
            userId.includes("manager") ? "MANAGER" :
            userId.includes("reception") ? "RECEPTIONIST" :
            userId.includes("stylist") ? "STYLIST" :
            "ASSISTANT",
      phone: "0900000001",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return successResponse(mockUser);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to get user", 500);
  }
}

