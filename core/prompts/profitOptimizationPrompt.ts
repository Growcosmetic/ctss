// ============================================
// Profit Optimization Prompt (33F)
// ============================================

export function profitOptimizationPrompt(
  pricingData: {
    currentPrices?: any[];
    demandData?: any;
    revenueData?: any;
    costData?: any;
  }
): string {
  return `
Bạn là AI chuyên tối ưu giá để tăng lợi nhuận tại Chí Tâm Hair Salon.

DỮ LIỆU:

Giá hiện tại:
${JSON.stringify(pricingData.currentPrices || [], null, 2)}

Nhu cầu:
${JSON.stringify(pricingData.demandData || {}, null, 2)}

Doanh thu:
${JSON.stringify(pricingData.revenueData || {}, null, 2)}

Chi phí:
${JSON.stringify(pricingData.costData || {}, null, 2)}

NHIỆM VỤ:
Tối ưu giá để tăng lợi nhuận tối đa mà không làm mất khách.

YÊU CẦU:

1. Đảm bảo margin > 50%
2. Không tăng giá quá 15% (mất khách)
3. Không giảm giá quá 20% (lỗ margin)
4. Tối ưu theo từng dịch vụ
5. Tối ưu theo time slot

PHÂN TÍCH CẦN THIẾT:

1. OPTIMIZED PRICES:
   - Giá tối ưu cho từng dịch vụ
   - Giá theo time slot
   - Giá theo stylist level

2. EXPECTED IMPACT:
   - Revenue increase
   - Profit increase
   - Customer impact

3. RECOMMENDATIONS:
   - Các thay đổi giá nên làm
   - Các dịch vụ cần điều chỉnh
   - Time slots cần tối ưu

TRẢ VỀ JSON:
{
  "optimizedPrices": [
    {
      "serviceId": "service_id",
      "basePrice": 550000,
      "optimizedPrice": 594000,
      "adjustmentPercent": 8,
      "timeSlot": "14:00-18:00",
      "reasoning": "Peak hour, demand high"
    }
  ],
  "expectedImpact": {
    "revenueIncrease": 14.3,
    "profitIncrease": 18.5,
    "customerImpact": "minimal",
    "marginAfter": 62.4
  },
  "recommendations": [
    "Tăng giá uốn nóng 8% giờ 16-18h → doanh thu tăng 14%",
    "Giảm giá nhuộm 8% buổi sáng → tăng booking 20%"
  ],
  "aiAnalysis": "Tối ưu giá có thể tăng doanh thu 14.3% và lợi nhuận 18.5% mà không ảnh hưởng nhiều đến khách hàng."
}
`;
}

