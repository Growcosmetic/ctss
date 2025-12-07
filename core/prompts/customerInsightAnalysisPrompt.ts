// ============================================
// Customer Insight Analysis Prompt
// ============================================

export function customerInsightAnalysisPrompt(profile: any) {
  return `
Bạn là AI chuyên phân tích khách hàng salon Chí Tâm — hệ thống CRM thông minh.

Dựa trên toàn bộ hồ sơ khách hàng sau:

${JSON.stringify(profile, null, 2)}

Hãy phân tích SÂU và tạo JSON insight theo cấu trúc:

{
  "preferences": [
    "Khách thích kiểu tóc: [kiểu cụ thể]",
    "Sản phẩm ưa thích: [sản phẩm]",
    "Màu sắc yêu thích: [màu]",
    "Độ dài tóc mong muốn: [dài/ngắn/vừa]"
  ],
  "patterns": [
    "Hành vi quay lại: [bao lâu 1 lần]",
    "Thời gian ưa thích: [ngày/giờ]",
    "Stylist yêu thích: [tên]",
    "Tần suất kỹ thuật: [uốn/nhuộm/tẩy...]"
  ],
  "risks": [
    {
      "type": "CHURN" | "TECHNICAL" | "SATISFACTION",
      "level": "HIGH" | "MEDIUM" | "LOW",
      "description": "Mô tả rủi ro cụ thể",
      "suggestion": "Gợi ý giải pháp"
    }
  ],
  "opportunities": [
    {
      "type": "UPSELL_SERVICE" | "UPSELL_PRODUCT" | "CROSS_SELL",
      "title": "Tiêu đề cơ hội",
      "description": "Mô tả chi tiết",
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "estimatedValue": 0
    }
  ],
  "recommendations": [
    {
      "category": "NEXT_SERVICE" | "NEXT_PRODUCT" | "TIMING" | "CARE",
      "title": "Tiêu đề gợi ý",
      "description": "Mô tả chi tiết",
      "urgency": "HIGH" | "MEDIUM" | "LOW"
    }
  ],
  "financialSegment": {
    "segment": "PREMIUM" | "STANDARD" | "BUDGET",
    "avgSpend": 0,
    "maxSpend": 0,
    "lifetimeValue": 0
  },
  "loyaltyScore": 0,
  "churnProbability": 0,
  "nextVisitPrediction": "YYYY-MM-DD" | null,
  "summary": "Tóm tắt insight trong 3-5 dòng"
}

YÊU CẦU:
- Phân tích DỰA TRÊN DỮ LIỆU THỰC TẾ từ profile:
  + technicalHistory → đánh giá tình trạng tóc, lịch sử hóa chất, rủi ro kỹ thuật
  + bookingHistory → thói quen đặt lịch, tần suất, stylist yêu thích
  + hairHistory → chu kỳ làm tóc, khoảng cách giữa các lần
  + preferences → sở thích, style mong muốn
  + insight (nếu có) → cập nhật dựa trên dữ liệu cũ
  
- Chỉ trả về JSON thuần (KHÔNG markdown, KHÔNG code blocks)
- Không bỏ sót field nào
- Tất cả arrays phải có ít nhất 1 item (nếu không có dữ liệu → tạo gợi ý dựa trên profile cơ bản)
- Phân tích phải THỰC TẾ, có thể áp dụng được
- Giọng văn: chuyên nghiệp, salon-expert, tinh tế

Hãy phân tích và trả về JSON hợp lệ.
  `;
}

