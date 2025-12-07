// ============================================
// Loyalty Notification Triggers
// ============================================

import { prisma } from "@/lib/prisma";
import { calculateTier, getLoyaltySummary } from "@/features/loyalty/services/loyaltyEngine";
import { createSystemNotification } from "./notificationTriggers";
import { NotificationType } from "@prisma/client";
import { format } from "date-fns";
import { isToday, isPast, addDays } from "date-fns";

/**
 * Check and notify tier upgrades
 */
export async function checkTierUpgrade(customerId: string): Promise<void> {
  try {
    const customerLoyalty = await prisma.customerLoyalty.findUnique({
      where: { customerId },
      include: {
        tier: true,
        customer: true,
      },
    });

    if (!customerLoyalty) return;

    const oldTierId = customerLoyalty.tierId;
    const newTierId = await calculateTier(customerId);

    // If tier changed, notify
    if (newTierId && newTierId !== oldTierId) {
      const newTier = await prisma.loyaltyTier.findUnique({
        where: { id: newTierId },
      });

      if (newTier) {
        // Notify customer
        // Notify managers about tier upgrade

        // Notify manager
        const managers = await prisma.user.findMany({
          where: { role: "MANAGER" },
        });

        for (const manager of managers) {
          await createSystemNotification({
            type: NotificationType.INFO,
            title: `Khách hàng lên hạng: ${customerLoyalty.customer.firstName} ${customerLoyalty.customer.lastName}`,
            message: `Khách hàng đã lên hạng ${newTier.name}`,
            userId: manager.id,
            data: {
              customerId,
              tierId: newTierId,
              link: `/crm?customerId=${customerId}`,
            },
          });
        }
      }
    }
  } catch (error) {
    console.error("Error checking tier upgrade:", error);
  }
}

/**
 * Check and notify birthday promotions
 */
export async function checkBirthdayPromotion(customerId: string): Promise<void> {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        customerLoyalty: {
          include: {
            tier: true,
          },
        },
      },
    });

    if (!customer || !customer.birthday) return;

    const birthday = new Date(customer.birthday);
    const today = new Date();
    const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());

    // Check if birthday is today or within next 7 days
    if (isToday(thisYearBirthday) || (!isPast(thisYearBirthday) && thisYearBirthday <= addDays(today, 7))) {
      const discountPercent = customer.customerLoyalty?.tier
        ? Number(customer.customerLoyalty.tier.discountPercent)
        : 0;

      const birthdayDiscount = Math.max(10, discountPercent + 5); // At least 10%, or tier discount + 5%

        // Note: Customer notifications would need customer.userId if linked
        // For now, we'll notify managers to contact customer
        const managers = await prisma.user.findMany({
          where: { role: "MANAGER" },
        });

        for (const manager of managers) {
          await createSystemNotification({
            type: NotificationType.INFO,
            title: `🎂 Sinh nhật khách hàng: ${customer.firstName} ${customer.lastName}`,
            message: `Khách hàng có sinh nhật. Giảm giá ${birthdayDiscount}% cho lần đến tiếp theo.`,
            userId: manager.id,
            data: {
              customerId,
              promotionType: "BIRTHDAY",
              discountPercent: birthdayDiscount,
              link: `/crm?customerId=${customerId}`,
            },
          });
        }
    }
  } catch (error) {
    console.error("Error checking birthday promotion:", error);
  }
}

/**
 * Check and notify return reminder with loyalty incentive
 */
export async function checkReturnReminderWithIncentive(
  customerId: string
): Promise<void> {
  try {
    const summary = await getLoyaltySummary(customerId);

    // If customer hasn't returned in a while and has points
    if (summary.customerLoyalty.totalPoints > 0) {
      // Notify managers to contact customer
      const managers = await prisma.user.findMany({
        where: { role: "MANAGER" },
      });

      for (const manager of managers) {
        await createSystemNotification({
          type: NotificationType.INFO,
          title: "Khách hàng có điểm tích lũy chưa sử dụng",
          message: `Khách hàng có ${summary.customerLoyalty.totalPoints.toLocaleString("vi-VN")} điểm tích lũy. Liên hệ để khuyến khích quay lại.`,
          userId: manager.id,
          data: {
            customerId,
            promotionType: "RETURN_INCENTIVE",
            points: summary.customerLoyalty.totalPoints,
            link: `/crm?customerId=${customerId}`,
          },
        });
      }
    }
  } catch (error) {
    console.error("Error checking return reminder:", error);
  }
}

/**
 * Notify staff of VIP customer arrival
 */
export async function notifyVIPArrival(
  customerId: string,
  bookingId: string
): Promise<void> {
  try {
    const summary = await getLoyaltySummary(customerId);
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        staff: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!booking || !booking.staff) return;

    // Check if customer is Diamond or Platinum tier
    if (
      summary.currentTier &&
      (summary.currentTier.name === "Diamond" || summary.currentTier.name === "Platinum")
    ) {
      await createSystemNotification({
        type: NotificationType.INFO,
        title: `VIP Customer: ${summary.currentTier.name} Member`,
        message: `Khách hàng hạng ${summary.currentTier.name} đang đến. Hãy chuẩn bị phục vụ tốt nhất!`,
        userId: booking.staff.userId,
        data: {
          customerId,
          bookingId,
          tierName: summary.currentTier.name,
          link: `/staff?bookingId=${bookingId}`,
        },
      });
    }
  } catch (error) {
    console.error("Error notifying VIP arrival:", error);
  }
}

