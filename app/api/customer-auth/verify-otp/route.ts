import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { cookies } from "next/headers";

// POST /api/customer-auth/verify-otp
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, otpCode } = body;

    if (!phone || !otpCode) {
      return errorResponse("Phone and OTP code are required", 400);
    }

    // Find customer by phone - customerAuthToken model not available
    const customer = await prisma.customer.findFirst({
      where: { phone },
    });

    if (!customer) {
      return errorResponse("Customer not found", 404);
    }

    // TODO: Implement proper OTP validation with customerAuthToken model
    // For now, accept any OTP in development
    if (process.env.NODE_ENV === "production") {
      return errorResponse("OTP verification not implemented yet", 501);
    }

    // Generate session token
    const sessionToken = Buffer.from(
      `${customer.id}:${Date.now()}`
    ).toString("base64");

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("customer-token", sessionToken, {
      httpOnly: true,
      secure: (process.env.NODE_ENV as string) === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return successResponse(
      {
        token: sessionToken,
        customer: {
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
        },
      },
      "OTP verified successfully"
    );
  } catch (error: any) {
    console.error("Error verifying OTP:", error);
    return errorResponse(error.message || "Failed to verify OTP", 500);
  }
}
