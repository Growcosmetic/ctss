// ============================================
// Cost Optimization Prompt - AI tối ưu chi phí
// ============================================

export function costOptimizationPrompt(
  productName: string,
  currentQuantity: number,
  statistics: any,
  recentUsage: any[]
): string {
  return `
Bạn là AI Cost Optimization Advisor cho Chí Tâm Hair Salon.

SẢN PHẨM: ${productName}
SỐ LƯỢNG HIỆN TẠI: ${currentQuantity} (gram/ml)

THỐNG KÊ:
${JSON.stringify(statistics, null, 2)}

LỊCH SỬ SỬ DỤNG GẦN ĐÂY (120 lần):
${JSON.stringify(recentUsage.slice(0, 20), null, 2)} // Show sample

Hãy phân tích và đưa ra gợi ý tối ưu chi phí, trả về JSON:

{
  "currentUsage": ${currentQuantity},
  "optimalRange": {
    "min": 0,
    "max": 0,
    "recommended": 0
  },
  "analysis": "Phân tích chi tiết (2-3 câu)",
  "savings": {
    "perService": 0,
    "monthlyEstimate": 0,
    "yearlyEstimate": 0
  },
  "recommendations": [
    "Gợi ý 1",
    "Gợi ý 2"
  ],
  "riskLevel": "low | medium | high",
  "qualityImpact": "Không ảnh hưởng chất lượng | Cần kiểm tra | Có thể ảnh hưởng"
}

LƯU Ý:
- Phân tích dựa trên thống kê thực tế
- Đưa ra mức tối ưu hợp lý (không quá thấp ảnh hưởng chất lượng)
- Tính toán tiết kiệm dựa trên số lượng dịch vụ trung bình/tháng
- Đánh giá rủi ro chất lượng

CHỈ TRẢ VỀ JSON - KHÔNG DÙNG MARKDOWN.
  `;
}

