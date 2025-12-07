import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { successResponse } from "@/lib/api-response";

// POST /api/auth/logout
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("auth-token");

    return successResponse(null, "Logged out successfully");
  } catch (error: any) {
    return successResponse(null, "Logged out successfully");
  }
}

