import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { addMinutes } from "date-fns";

// POST /api/customer-auth/send-otp
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone || !/^[0-9]{10,11}$/.test(phone)) {
      return errorResponse("Số điện thoại không hợp lệ", 400);
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = addMinutes(new Date(), 10); // Expires in 10 minutes

    // Find or create customer
    let customer = await prisma.customer.findFirst({
      where: { phone },
    });

    if (!customer) {
      // Create new customer
      customer = await prisma.customer.create({
        data: {
          phone,
          firstName: "Khách",
          lastName: "Hàng",
          status: "ACTIVE",
        },
      });
    }

    // Create or update auth token
    const existingToken = await prisma.customerAuthToken.findFirst({
      where: { customerId: customer.id },
    });

    if (existingToken) {
      await prisma.customerAuthToken.update({
        where: { id: existingToken.id },
        data: {
          otpCode,
          otpExpiresAt,
        },
      });
    } else {
      await prisma.customerAuthToken.create({
        data: {
          customerId: customer.id,
          phone,
          otpCode,
          otpExpiresAt,
          token: "", // Will be set after verification
        },
      });
    }

    // In production, send OTP via SMS service
    // For now, we'll return it in development (remove in production!)
    console.log(`OTP for ${phone}: ${otpCode}`);

    return successResponse(
      {
        message: "OTP đã được gửi",
        // Remove this in production!
        otpCode: process.env.NODE_ENV === "development" ? otpCode : undefined,
      },
      "OTP sent successfully"
    );
  } catch (error: any) {
    console.error("Error sending OTP:", error);
    return errorResponse(error.message || "Failed to send OTP", 500);
  }
}

