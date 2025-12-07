// ============================================
// Mina Brain - Loyalty Integration
// ============================================

import { getLoyaltySummary } from "@/features/loyalty/services/loyaltyEngine";

/**
 * Get loyalty summary for customer
 * Used by Mina chatbot to explain loyalty status
 */
export async function getLoyaltySummaryForMina(
  customerId: string
): Promise<string> {
  try {
    const summary = await getLoyaltySummary(customerId);

    if (!summary.currentTier) {
      return `Khách hàng chưa có hạng thành viên. Hiện tại có ${summary.customerLoyalty.totalPoints} điểm tích lũy.`;
    }

    const tier = summary.currentTier;
    const discount = Number(tier.discountPercent);
    const perks = (tier.perks as string[]) || [];

    let message = `Khách hàng đang ở hạng ${tier.name}.\n`;
    message += `- Điểm tích lũy hiện tại: ${summary.customerLoyalty.totalPoints.toLocaleString("vi-VN")} điểm\n`;
    message += `- Tổng điểm đã tích: ${summary.customerLoyalty.lifetimePoints.toLocaleString("vi-VN")} điểm\n`;

    if (discount > 0) {
      message += `- Được giảm giá ${discount}% cho tất cả dịch vụ\n`;
    }

    if (perks.length > 0) {
      message += `- Quyền lợi đặc biệt: ${perks.join(", ")}\n`;
    }

    if (summary.nextTier) {
      const remaining = summary.pointsToNextTier;
      message += `\nĐể lên hạng ${summary.nextTier.name}, khách hàng cần chi tiêu thêm ${remaining.toLocaleString("vi-VN")} VND trong 6 tháng tới.`;
    } else {
      message += `\nKhách hàng đã đạt hạng cao nhất!`;
    }

    return message;
  } catch (error) {
    console.error("Error getting loyalty summary for Mina:", error);
    return "Không thể lấy thông tin thành viên lúc này.";
  }
}

