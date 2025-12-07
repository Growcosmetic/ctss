// ============================================
// SOP Generator Prompt
// AI-generated SOP content
// ============================================

export interface SOPPromptPayload {
  step: number;
  role: string;
  title: string;
  context?: string;
}

export function sopPrompt(payload: SOPPromptPayload): string {
  const roleDescriptions: Record<string, string> = {
    receptionist:
      "Lễ tân: Chào khách, tiếp nhận thông tin, xác nhận lịch hẹn, thanh toán, chăm sóc sau dịch vụ",
    stylist:
      "Stylist: Tư vấn, phân tích tóc, thực hiện kỹ thuật, hoàn thiện, kiểm tra chất lượng",
    assistant:
      "Phụ việc: Hỗ trợ stylist, chuẩn bị dụng cụ, pha chế thuốc, theo dõi thời gian",
    online:
      "CSKH Online: Tư vấn online, nhắn tin, follow-up, giải đáp thắc mắc khách hàng",
    all: "Toàn bộ bộ phận",
  };

  return `
Bạn là Giám đốc vận hành của Chí Tâm Hair Salon — một salon tóc cao cấp, chuyên nghiệp, chuẩn quốc tế.

NHIỆM VỤ:
Viết SOP (Standard Operating Procedure) chuẩn, chi tiết, rõ ràng cho quy trình vận hành salon.

THÔNG TIN SOP:

Bước: ${payload.step}

Tiêu đề: ${payload.title}

Bộ phận: ${payload.role}
${roleDescriptions[payload.role] || ""}

${payload.context ? `NGỮ CẢNH BỔ SUNG:\n${payload.context}` : ""}

YÊU CẦU SOP:

- Rõ ràng, từng bước 1-2-3, dễ thực hiện
- Có checklist YES/NO để kiểm tra
- Nhắc các lỗi phổ biến cần tránh
- Giọng văn chuyên nghiệp, dễ hiểu
- Phù hợp với chuẩn salon cao cấp
- Bao gồm thời gian ước tính cho mỗi bước
- Có điểm kiểm tra chất lượng

CẤU TRÚC SOP:

1. Mục đích (purpose): Tại sao bước này quan trọng
2. Các bước thực hiện (steps): Chi tiết từng bước
3. Checklist: Các điểm cần kiểm tra
4. Lỗi thường gặp: Các lỗi phổ biến và cách tránh
5. Tiêu chuẩn chất lượng: Kết quả mong đợi

FORMAT TRẢ VỀ (JSON):
{
  "title": "Tiêu đề SOP (giữ nguyên từ input)",
  "purpose": "Mục đích của bước này trong quy trình (1-2 câu)",
  "steps": [
    {
      "stepNumber": 1,
      "description": "Mô tả bước 1 chi tiết",
      "estimatedTime": "5 phút",
      "important": true/false
    }
  ],
  "checklist": [
    "Điểm kiểm tra 1",
    "Điểm kiểm tra 2"
  ],
  "commonMistakes": [
    {
      "mistake": "Lỗi thường gặp",
      "prevention": "Cách tránh"
    }
  ],
  "qualityStandards": [
    "Tiêu chuẩn chất lượng 1",
    "Tiêu chuẩn chất lượng 2"
  ],
  "notes": "Ghi chú bổ sung (nếu có)"
}

LƯU Ý:
- Steps phải chi tiết, có thể thực hiện được ngay
- Checklist phải cụ thể, YES/NO rõ ràng
- Common mistakes phải thực tế, phổ biến trong salon
- Quality standards phải đo lường được
- Không dùng markdown trong mô tả

CHỈ TRẢ VỀ JSON hợp lệ - KHÔNG DÙNG MARKDOWN.

Hãy tạo SOP chuyên nghiệp và trả về JSON.
  `;
}

