import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { isPast } from "date-fns";
import { cookies } from "next/headers";

// POST /api/customer-auth/verify-otp
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, otpCode } = body;

    if (!phone || !otpCode) {
      return errorResponse("Phone and OTP code are required", 400);
    }

    // Find auth token
    const authToken = await prisma.customerAuthToken.findFirst({
      where: { phone },
      include: { customer: true },
    });

    if (!authToken) {
      return errorResponse("OTP không hợp lệ hoặc đã hết hạn", 401);
    }

    // Check OTP
    if (authToken.otpCode !== otpCode) {
      return errorResponse("Mã OTP không đúng", 401);
    }

    // Check expiration
    if (!authToken.otpExpiresAt || isPast(authToken.otpExpiresAt)) {
      return errorResponse("Mã OTP đã hết hạn", 401);
    }

    // Generate session token
    const sessionToken = Buffer.from(
      `${authToken.customerId}:${Date.now()}`
    ).toString("base64");

    // Update auth token
    await prisma.customerAuthToken.update({
      where: { id: authToken.id },
      data: {
        token: sessionToken,
        otpCode: null, // Clear OTP after successful verification
        otpExpiresAt: null,
      },
    });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("customer-token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return successResponse(
      {
        token: sessionToken,
        customer: {
          id: authToken.customer.id,
          firstName: authToken.customer.firstName,
          lastName: authToken.customer.lastName,
          phone: authToken.customer.phone,
        },
      },
      "OTP verified successfully"
    );
  } catch (error: any) {
    console.error("Error verifying OTP:", error);
    return errorResponse(error.message || "Failed to verify OTP", 500);
  }
}

