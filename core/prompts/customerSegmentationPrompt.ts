// ============================================
// Customer Segmentation Prompt - AI phân loại khách
// ============================================

export function customerSegmentationPrompt(customers: Array<{
  id: string;
  name: string;
  totalSpent: number;
  visitCount: number;
  averageSpend: number;
  favoriteService?: string;
  visitFrequency?: number;
  behaviorType?: string;
  lastVisit?: string;
}>): string {
  return `
Bạn là AI Customer Segmentation Analyst cho Chí Tâm Hair Salon.

DỮ LIỆU KHÁCH HÀNG:
${JSON.stringify(customers, null, 2)}

Hãy phân loại khách hàng thành 8 nhóm marketing, trả về JSON:

{
  "segments": {
    "VIP": {
      "customers": ["customer_id1", "customer_id2"],
      "description": "Mô tả nhóm",
      "averageLTV": 0,
      "averageSpend": 0,
      "characteristics": ["Đặc điểm 1", "Đặc điểm 2"]
    },
    "HIGH_SPENDER": {...},
    "TREND_HUNTER": {...},
    "BEAUTY_ADDICT": {...},
    "BUDGET": {...},
    "ONE_TIME": {...},
    "RISK": {...},
    "REFERRAL": {...}
  },
  "summary": "Tóm tắt phân loại"
}

PHÂN LOẠI:
- VIP: Chi tiêu cao, quay lại thường xuyên, giới thiệu bạn bè
- HIGH_SPENDER: Chi tiêu tốt, ổn định
- TREND_HUNTER: Thích dịch vụ mới, theo trend Hàn
- BEAUTY_ADDICT: Chăm sóc tóc thường xuyên, nhiều dịch vụ
- BUDGET: Nhạy cảm giá, tìm ưu đãi
- ONE_TIME: Chỉ đến 1 lần
- RISK: Rủi ro bỏ salon
- REFERRAL: Giới thiệu bạn bè nhiều

CHỈ TRẢ VỀ JSON - KHÔNG DÙNG MARKDOWN.
  `;
}

