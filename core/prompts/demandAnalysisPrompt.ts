// ============================================
// Demand Analysis Prompt (33B)
// ============================================

export function demandAnalysisPrompt(
  serviceData: {
    bookings?: any[];
    inquiries?: any[];
    trends?: any;
  }
): string {
  return `
Bạn là AI chuyên phân tích nhu cầu dịch vụ tại Chí Tâm Hair Salon.

DỮ LIỆU:

Bookings:
${JSON.stringify(serviceData.bookings || [], null, 2)}

Inquiries:
${JSON.stringify(serviceData.inquiries || [], null, 2)}

Trends:
${JSON.stringify(serviceData.trends || {}, null, 2)}

NHIỆM VỤ:
Phân tích nhu cầu cho từng dịch vụ và đưa ra mức độ demand.

PHÂN TÍCH:

1. DEMAND LEVEL:
   - LOW: Ít booking, ít inquiry (<30% so với trung bình)
   - NORMAL: Bình thường (70-130% so với trung bình)
   - HIGH: Nhiều booking, nhiều inquiry (130-180% so với trung bình)
   - VERY_HIGH: Rất nhiều (>180% so với trung bình)

2. TREND:
   - INCREASING: Đang tăng
   - STABLE: Ổn định
   - DECREASING: Đang giảm

3. FACTORS:
   - Booking rate
   - Inquiry rate
   - Seasonal factors
   - Popularity trends

4. PRICING RECOMMENDATION:
   - Nếu HIGH/VERY_HIGH → có thể tăng giá 5-12%
   - Nếu LOW → giảm giá 5-15% để kích cầu

TRẢ VỀ JSON:
{
  "demandLevel": "HIGH",
  "trend": "INCREASING",
  "demandScore": 145,
  "factors": {
    "bookingRate": "high",
    "inquiryRate": "high",
    "seasonal": "peak season"
  },
  "pricingRecommendation": {
    "adjustment": "INCREASE",
    "adjustmentPercent": 8,
    "reasoning": "Nhu cầu cao, booking tăng 45% so với trung bình"
  }
}
`;
}

