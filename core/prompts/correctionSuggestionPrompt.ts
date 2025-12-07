// ============================================
// Correction Suggestion Prompt - AI gợi ý chỉnh sửa
// ============================================

export function correctionSuggestionPrompt(data: {
  errorType?: string;
  errorDescription?: string;
  location?: string;
  serviceType?: string;
  currentMetrics?: any;
}): string {
  return `
Bạn là AI Correction Specialist cho Chí Tâm Hair Salon.

THÔNG TIN LỖI:
- Loại lỗi: ${data.errorType || "N/A"}
- Mô tả: ${data.errorDescription || "N/A"}
- Vị trí: ${data.location || "N/A"}
- Dịch vụ: ${data.serviceType || "N/A"}
- Metrics hiện tại: ${JSON.stringify(data.currentMetrics || {})}

Hãy đưa ra gợi ý chỉnh sửa cụ thể, trả về JSON:

{
  "suggestion": "Gợi ý chỉnh sửa chi tiết",
  "action": "Hành động cụ thể cần làm",
  "priority": "LOW | MEDIUM | HIGH | URGENT",
  "steps": [
    "Bước 1",
    "Bước 2"
  ],
  "expectedResult": "Kết quả mong đợi sau khi sửa"
}

VÍ DỤ:
- "Phần mái hơi quăn mạnh → giảm nhiệt 5° + giữ thời gian ngắn hơn 2 phút"
- "Màu base hơi tối → nâng thêm 0.5 tone ở chân"
- "Ngọn khô nhẹ → thêm Plexis Treatment 3 phút"

CHỈ TRẢ VỀ JSON - KHÔNG DÙNG MARKDOWN.
  `;
}

