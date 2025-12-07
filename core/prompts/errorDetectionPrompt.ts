// ============================================
// Error Detection Prompt - AI phát hiện lỗi kỹ thuật
// ============================================

export function errorDetectionPrompt(data: {
  serviceType?: string;
  observations?: string[];
  qualityScore?: number;
  metrics?: any;
}): string {
  return `
Bạn là AI Error Detection Specialist cho Chí Tâm Hair Salon.

DỮ LIỆU DỊCH VỤ:
- Dịch vụ: ${data.serviceType || "N/A"}
- Quality score: ${data.qualityScore || "N/A"}/100
- Quan sát: ${data.observations?.join(", ") || "Không có"}
- Metrics: ${JSON.stringify(data.metrics || {})}

Hãy phân tích và phát hiện lỗi kỹ thuật, trả về JSON:

{
  "errors": [
    {
      "errorType": "OVERPROCESS | UNDERPROCESS | UNEVEN | OVERHEAT | UNEVEN_COLOR | etc.",
      "errorCategory": "TECHNICAL | TIMING | PRODUCT | PROCEDURE",
      "severity": "LOW | MEDIUM | HIGH | CRITICAL",
      "location": "Vị trí lỗi (nếu có)",
      "description": "Mô tả chi tiết lỗi"
    }
  ],
  "analysis": "Phân tích tổng thể"
}

LOẠI LỖI PHỔ BIẾN:
- OVERPROCESS: Ăn thuốc quá nhanh, overprocess
- UNDERPROCESS: Chưa đủ thời gian
- UNEVEN: Setting không đều
- OVERHEAT: Quá nóng
- UNEVEN_COLOR: Màu không đều
- LOOSE_TENSION: Độ căng yếu
- TOO_TIGHT: Kéo quá chặt

CHỈ TRẢ VỀ JSON - KHÔNG DÙNG MARKDOWN.
  `;
}

