// ============================================
// Customer Memory Summary Prompt
// ============================================

import type { WorkflowPayload } from "../aiWorkflow/workflowTypes";

export function customerMemorySummaryPrompt(profile: any) {
  return `
Bạn là AI chuyên phân tích toàn bộ hồ sơ khách hàng salon Chí Tâm.

Dựa trên dữ liệu Customer Profile sau:

${JSON.stringify(profile, null, 2)}

Hãy phân tích và tóm tắt trí nhớ khách hàng theo JSON format sau:

{
  "summary": "Tóm tắt ngắn gọn về khách hàng (3-5 dòng)",
  "preferences": [
    "Sở thích 1",
    "Sở thích 2"
  ],
  "recommendations": [
    {
      "type": "SERVICE" | "PRODUCT" | "TIMING",
      "title": "Tiêu đề gợi ý",
      "description": "Mô tả chi tiết",
      "priority": "HIGH" | "MEDIUM" | "LOW"
    }
  ],
  "nextActions": [
    {
      "action": "Tên hành động",
      "timing": "Thời điểm phù hợp",
      "reason": "Lý do"
    }
  ],
  "riskSignals": [
    {
      "type": "TECHNICAL" | "CHURN" | "SATISFACTION",
      "level": "HIGH" | "MEDIUM" | "LOW",
      "description": "Mô tả rủi ro"
    }
  ],
  "keyInsights": [
    "Insight quan trọng 1",
    "Insight quan trọng 2"
  ]
}

YÊU CẦU:
- Chỉ trả về JSON thuần (không markdown)
- Phân tích sâu dựa trên:
  + technicalHistory → đánh giá tình trạng tóc, lịch sử hóa chất
  + bookingHistory → thói quen đặt lịch, tần suất
  + preferences → sở thích, style mong muốn
  + insight → hành vi tiêu dùng
- Đưa ra recommendations thực tế, có thể thực hiện
- Phát hiện riskSignals sớm để tránh vấn đề
- Giọng văn: chuyên nghiệp, tinh tế, salon-expert

Hãy phân tích và trả về JSON hợp lệ.
  `;
}

