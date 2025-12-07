// ============================================
// Upsale Recommendation Prompt - AI đề xuất upsale
// ============================================

export function upsaleRecommendationPrompt(data: {
  customerName?: string;
  customerType?: string; // VIP | HIGH_VALUE | BUDGET | TREND | RISK_AVERSE
  currentService?: string;
  serviceHistory?: Array<{ service: string; date: string }>;
  totalSpent?: number;
  averageSpend?: number;
  hairCondition?: string;
  concerns?: string[];
  budgetRange?: string;
}): string {
  return `
Bạn là AI Upsale Recommendation Specialist cho Chí Tâm Hair Salon.

DỮ LIỆU KHÁCH HÀNG:
- Tên: ${data.customerName || "Khách"}
- Nhóm khách: ${data.customerType || "REGULAR"}
- Dịch vụ hiện tại: ${data.currentService || "N/A"}
- Lịch sử dịch vụ: ${JSON.stringify(data.serviceHistory || [])}
- Tổng chi tiêu: ${data.totalSpent?.toLocaleString("vi-VN") || "N/A"}đ
- Chi tiêu trung bình: ${data.averageSpend?.toLocaleString("vi-VN") || "N/A"}đ
- Tình trạng tóc: ${data.hairCondition || "N/A"}
- Mối quan tâm: ${data.concerns?.join(", ") || "Không có"}
- Khoảng ngân sách: ${data.budgetRange || "N/A"}

Hãy đề xuất upsale phù hợp, trả về JSON:

{
  "recommendedServices": ["service_id1", "service_id2"],
  "recommendedProducts": ["product_id1", "product_id2"],
  "combo": {
    "name": "Tên combo",
    "services": ["service_id1"],
    "products": ["product_id1"],
    "discount": 0,
    "totalValue": 0
  },
  "confidence": 0-100,
  "reason": "Lý do đề xuất (1-2 câu)",
  "script": "Câu nói gợi ý cho stylist (ngắn gọn, tự nhiên, tinh tế)",
  "tone": "Tone giao tiếp (thân thiện | chuyên nghiệp | nhẹ nhàng | nhiệt tình)",
  "benefits": ["Lợi ích 1", "Lợi ích 2"],
  "priceSensitivity": "HIGH | MEDIUM | LOW",
  "urgency": "HIGH | MEDIUM | LOW"
}

NGUYÊN TẮC:
- Khách VIP: Upsale nhẹ nhàng, cao cấp, tập trung chất lượng
- Khách Budget: Upsale phiên bản tiết kiệm, nhấn mạnh giá trị
- Khách Risk-averse: Upsale giải pháp an toàn, bảo vệ tóc
- Khách Trend: Upsale kiểu Hàn, mới nhất

LƯU Ý:
- Script phải tự nhiên, không ép buộc
- Benefits phải thực tế, phù hợp nhu cầu
- Tone phù hợp với tính cách khách
- Confidence dựa trên dữ liệu khách

CHỈ TRẢ VỀ JSON - KHÔNG DÙNG MARKDOWN.
  `;
}

