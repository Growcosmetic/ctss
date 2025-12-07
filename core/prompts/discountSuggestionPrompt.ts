// ============================================
// Smart Discount Suggestion Prompt (33E)
// ============================================

export function discountSuggestionPrompt(
  context: {
    lowDemandServices?: any[];
    slowTimeSlots?: any[];
    revenueData?: any;
  }
): string {
  return `
Bạn là AI chuyên tạo chương trình khuyến mãi thông minh tại Chí Tâm Hair Salon.

NGỮ CẢNH:

Dịch vụ ít khách:
${JSON.stringify(context.lowDemandServices || [], null, 2)}

Khung giờ vắng:
${JSON.stringify(context.slowTimeSlots || [], null, 2)}

Doanh thu:
${JSON.stringify(context.revenueData || {}, null, 2)}

NHIỆM VỤ:
Tạo các chương trình khuyến mãi thông minh để kích cầu và tối ưu doanh thu.

CÁC LOẠI KHUYẾN MÃI:

1. TIME_BASED:
   - Giảm giá buổi sáng
   - Giảm giá khung giờ vắng

2. SERVICE_BASED:
   - Giảm cho dịch vụ ít khách
   - Flash sale ngắn 2-3 giờ

3. COMBO:
   - Combo uốn + nhuộm giảm giá
   - Combo dịch vụ

4. FLASH_SALE:
   - Sale ngắn để tạo urgency
   - Limited time offer

YÊU CẦU:

1. Discount phải có lý do rõ ràng
2. Phải đảm bảo vẫn có lãi (margin > 40%)
3. Tạo urgency (limited time)
4. Phù hợp với nhu cầu thực tế

TRẢ VỀ JSON:
{
  "discounts": [
    {
      "discountType": "TIME_BASED",
      "discountName": "Giảm giá buổi sáng - Uốn nóng",
      "discountValue": 10,
      "discountUnit": "PERCENTAGE",
      "serviceIds": ["service_id"],
      "startTime": "2024-01-15T09:00:00",
      "endTime": "2024-01-15T12:00:00",
      "conditions": {
        "timeRange": ["09:00", "12:00"],
        "daysOfWeek": [1, 2, 3, 4, 5]
      },
      "aiReasoning": "Buổi sáng vắng khách, giảm 10% để kích cầu",
      "expectedImpact": {
        "bookingIncrease": 20,
        "revenueImpact": "positive"
      }
    },
    {
      "discountType": "FLASH_SALE",
      "discountName": "Nhuộm xả khô 499k - 1 ngày",
      "discountValue": 100000,
      "discountUnit": "FIXED_AMOUNT",
      "serviceIds": ["service_id"],
      "startTime": "2024-01-15T11:00:00",
      "endTime": "2024-01-15T14:00:00",
      "conditions": {
        "maxUses": 50
      },
      "aiReasoning": "Dịch vụ nhuộm đang chậm, flash sale để kéo khách buổi trưa",
      "expectedImpact": {
        "bookingIncrease": 30,
        "revenueImpact": "positive"
      }
    }
  ],
  "aiAnalysis": "Tạo 2 chương trình khuyến mãi: giảm giá buổi sáng 10% và flash sale nhuộm 499k để kích cầu các khung giờ vắng."
}
`;
}

