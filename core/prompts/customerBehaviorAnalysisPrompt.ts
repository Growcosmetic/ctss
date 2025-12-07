// ============================================
// Customer Behavior Analysis Prompt - AI phân tích hành vi
// ============================================

export function customerBehaviorAnalysisPrompt(customerData: {
  totalSpent: number;
  visitCount: number;
  averageSpend: number;
  favoriteService?: string;
  visitFrequency?: number;
  lastVisit?: string;
  experiences?: any[];
  touchpoints?: any[];
}): string {
  return `
Bạn là AI Customer Behavior Analyst cho Chí Tâm Hair Salon.

DỮ LIỆU KHÁCH HÀNG:
- Tổng chi tiêu: ${customerData.totalSpent.toLocaleString("vi-VN")}đ
- Số lần đến: ${customerData.visitCount}
- Chi tiêu trung bình: ${customerData.averageSpend.toLocaleString("vi-VN")}đ
- Dịch vụ yêu thích: ${customerData.favoriteService || "N/A"}
- Tần suất: ${customerData.visitFrequency || "N/A"} lần/tháng
- Lần đến cuối: ${customerData.lastVisit || "N/A"}

Hãy phân tích và phân loại khách hàng, trả về JSON:

{
  "behaviorType": "VIP | HIGH_VALUE | TREND | PRICE_SENSITIVE | RISK_AVERSE | CHURN_RISK",
  "confidence": 0-100,
  "tags": ["VIP", "Active", "Trendy", etc.],
  "favoriteService": "Dịch vụ yêu thích",
  "preferredTime": "Sáng | Trưa | Chiều | Tối",
  "visitFrequency": 0,
  "analysis": "Phân tích chi tiết 2-3 câu về hành vi khách hàng",
  "nextPredictedVisit": "Ngày dự đoán (YYYY-MM-DD hoặc null)",
  "predictedService": "Dịch vụ dự đoán lần tới"
}

PHÂN LOẠI:
- VIP: Chi tiêu cao, quay lại thường xuyên, giới thiệu bạn bè
- HIGH_VALUE: Chi tiêu tốt, ổn định
- TREND: Thích dịch vụ mới, theo trend Hàn
- PRICE_SENSITIVE: Nhạy cảm giá, tìm ưu đãi
- RISK_AVERSE: Sợ hư tóc, cần tư vấn kỹ
- CHURN_RISK: Rủi ro bỏ salon (lâu không đến, điểm thấp)

CHỈ TRẢ VỀ JSON - KHÔNG DÙNG MARKDOWN.
  `;
}

