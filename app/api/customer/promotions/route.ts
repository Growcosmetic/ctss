import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { cookies } from "next/headers";
import { getLoyaltySummary } from "@/features/loyalty/services/loyaltyEngine";
import { isToday, addDays, isPast } from "date-fns";

// Simple token validation
function validateCustomerToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [customerId] = decoded.split(":");
    return customerId || null;
  } catch {
    return null;
  }
}

// GET /api/customer/promotions
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("customer-token")?.value;

    if (!token) {
      return errorResponse("Not authenticated", 401);
    }

    const customerId = validateCustomerToken(token);
    if (!customerId) {
      return errorResponse("Invalid token", 401);
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        loyalty: {
          include: {
            tier: true,
          },
        },
      },
    });

    if (!customer) {
      return errorResponse("Customer not found", 404);
    }

    const promotions: any[] = [];

    // 1. Tier-based promotions
    if (customer.loyalty?.tier) {
      const tier = customer.loyalty.tier;
      const discountPercent = Number(tier.discount);
      if (discountPercent > 0) {
        promotions.push({
          id: `tier-${tier.id}`,
          title: `Giảm giá ${discountPercent}% cho hạng ${tier.name}`,
          description: `Áp dụng cho tất cả dịch vụ khi bạn là thành viên hạng ${tier.name}`,
          type: "TIER_BASED",
          discountPercent,
          validFrom: new Date().toISOString(),
          validTo: addDays(new Date(), 365).toISOString(), // Valid for 1 year
        });
      }
    }

    // 2. Birthday promotion
    if (customer.birthday) {
      const birthday = new Date(customer.birthday);
      const today = new Date();
      const thisYearBirthday = new Date(
        today.getFullYear(),
        birthday.getMonth(),
        birthday.getDate()
      );

      if (
        isToday(thisYearBirthday) ||
        (!isPast(thisYearBirthday) && thisYearBirthday <= addDays(today, 7))
      ) {
        const baseDiscount =
          customer.loyalty?.tier
            ? Number(customer.loyalty.tier.discount)
            : 0;
        const birthdayDiscount = Math.max(10, baseDiscount + 5);

        promotions.push({
          id: `birthday-${customer.id}`,
          title: "🎂 Chúc mừng sinh nhật!",
          description: `Giảm giá đặc biệt ${birthdayDiscount}% cho lần đến tiếp theo`,
          type: "BIRTHDAY",
          discountPercent: birthdayDiscount,
          validFrom: new Date().toISOString(),
          validTo: addDays(today, 30).toISOString(),
        });
      }
    }

    // 3. Points redemption promotion
    if (customer.loyalty && customer.loyalty.totalPoints > 0) {
      promotions.push({
        id: `points-${customer.id}`,
        title: `Đổi ${customer.loyalty.totalPoints.toLocaleString("vi-VN")} điểm tích lũy`,
        description: "Sử dụng điểm tích lũy để giảm giá cho đơn hàng tiếp theo",
        type: "PERSONALIZED",
        points: customer.loyalty.totalPoints,
        validFrom: new Date().toISOString(),
        validTo: addDays(new Date(), 90).toISOString(),
      });
    }

    return successResponse(promotions);
  } catch (error: any) {
    console.error("Error fetching promotions:", error);
    return errorResponse(error.message || "Failed to fetch promotions", 500);
  }
}

