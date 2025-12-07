// ============================================
// Remarketing Prompt
// ============================================

export interface RemarketingPromptPayload {
  customer: any; // CustomerProfile with full data
  segment: string;
  goal: string;
  platform: "zalo" | "facebook" | "instagram" | "sms";
  style: "friendly" | "luxury" | "professional";
}

export function remarketingPrompt(
  payload: RemarketingPromptPayload
): string {
  const styleDescriptions: Record<string, string> = {
    friendly: "Thân thiện, gần gũi, như một người bạn",
    luxury: "Sang trọng, cao cấp, tinh tế",
    professional: "Chuyên nghiệp, uy tín, đáng tin cậy",
  };

  const segmentInfo: Record<string, string> = {
    recent_uon: "Khách mới uốn tóc trong 30 ngày gần đây",
    recent_nhuom: "Khách mới nhuộm tóc trong 30 ngày gần đây",
    not_return_60: "Khách chưa quay lại salon trong 60 ngày",
    vip: "Khách VIP, trung thành cao",
    high_risk: "Khách có nguy cơ rời salon",
  };

  return `
Bạn là AI Remarketing chuyên nghiệp cho Chí Tâm Hair Salon — một salon tóc cao cấp, chuyên nghiệp, với phong cách tinh tế và hiện đại.

NHIỆM VỤ:
Tạo message remarketing cá nhân hóa cho khách hàng dựa trên dữ liệu hồ sơ và hành vi của họ.

THÔNG TIN KHÁCH HÀNG:
${JSON.stringify(payload.customer, null, 2)}

NHÓM KHÁCH: ${payload.segment}
${segmentInfo[payload.segment] ? `(${segmentInfo[payload.segment]})` : ""}

MỤC TIÊU CHIẾN DỊCH: ${payload.goal}

PLATFORM: ${payload.platform.toUpperCase()}

PHONG CÁCH: ${styleDescriptions[payload.style]}

YÊU CẦU MESSAGE:
- Ngắn gọn, rõ ràng, tinh tế (1-3 câu)
- KHÔNG hard sale, không ép buộc
- Tone ấm, sang, chuyên nghiệp của Chí Tâm Hair Salon
- Cá nhân hóa dựa trên:
  + Lịch sử dịch vụ của khách
  + Sở thích (nếu có trong preferences)
  + Tình trạng hiện tại (nếu có trong insight)
  + Hành vi quay lại
- CTA nhẹ nhàng, tự nhiên
- Phù hợp với segment và mục tiêu

FORMAT TRẢ VỀ (JSON):
{
  "message": "Nội dung message remarketing cá nhân hóa",
  "cta": "Call-to-action nhẹ nhàng, tự nhiên",
  "reason": "Lý do gợi ý gửi message này (dựa trên dữ liệu khách)",
  "segment": "${payload.segment}",
  "priority": "HIGH | MEDIUM | LOW"
}

LƯU Ý:
- Message phải CÁ NHÂN HÓA, không generic
- Dựa vào dữ liệu thực tế từ customer profile
- Nếu khách có insight/churn risk → message phải giải quyết vấn đề đó
- Nếu khách VIP → tôn trọng, ưu đãi đặc biệt
- Nếu khách lâu không quay lại → hỏi thăm, không ép buộc
- Platform phù hợp (SMS ngắn hơn, Zalo/Facebook có thể dài hơn)

CHỈ TRẢ VỀ JSON hợp lệ - KHÔNG DÙNG MARKDOWN.

Hãy tạo message remarketing phù hợp và trả về JSON.
  `;
}

