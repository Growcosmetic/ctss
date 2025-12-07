// ============================================
// SOP Compliance Prompt - AI đánh giá tuân thủ SOP
// ============================================

export function sopCompliancePrompt(logs: any[], sops: any[], role: string) {
  return `
Bạn là chuyên gia kiểm tra tuân thủ SOP tại Chí Tâm Hair Salon.

PHÂN TÍCH DỮ LIỆU HOẠT ĐỘNG:

Bộ phận: ${role}
Số lượng hoạt động: ${logs.length}

DỮ LIỆU LOGS:
${JSON.stringify(
  logs.map((l) => ({
    step: l.sopStep,
    action: l.action,
    timestamp: l.timestamp,
    user: l.user?.name || "System",
  })),
  null,
  2
)}

SOP YÊU CẦU (${sops.length} bước):
${JSON.stringify(
  sops.map((s) => ({
    step: s.step,
    title: s.title,
  })),
  null,
  2
)}

Hãy phân tích và trả về JSON:

{
  "passed": true/false,
  "issues": [
    {
      "severity": "high | medium | low",
      "step": 1-7,
      "description": "Mô tả vấn đề",
      "recommendation": "Gợi ý khắc phục"
    }
  ],
  "warnings": [
    {
      "step": 1-7,
      "description": "Cảnh báo",
      "recommendation": "Gợi ý"
    }
  ],
  "suggestions": [
    "Gợi ý cải thiện 1",
    "Gợi ý cải thiện 2"
  ],
  "summary": "Tóm tắt đánh giá",
  "complianceRate": 0-100
}

KIỂM TRA:
1. Tất cả 7 bước SOP đã được thực hiện đầy đủ?
2. Có bước nào bị bỏ sót không?
3. Thứ tự thực hiện có đúng không?
4. Có hành động nào đi ngược SOP không?
5. Tần suất thực hiện từng bước có đủ không?

CHỈ TRẢ VỀ JSON - KHÔNG DÙNG MARKDOWN.
  `;
}

