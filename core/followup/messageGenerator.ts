// ============================================
// Follow-up Message Generator
// ============================================

import OpenAI from "openai";
import type {
  FollowUpMessageType,
  FollowUpRule,
} from "./types";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export interface GenerateMessagePayload {
  phone?: string;
  customerName?: string;
  type: FollowUpMessageType;
  history: any; // CustomerProfile data
  lastService?: {
    name: string;
    date: string;
  };
}

// ============================================
// Generate Follow-up Message using AI
// ============================================

export async function generateFollowUpMessage(
  payload: GenerateMessagePayload
): Promise<string> {
  const { type, history, lastService, customerName, phone } = payload;

  // Get message template based on type
  const template = getMessageTemplate(type);

  const prompt = `
Bạn là chuyên gia chăm sóc khách hàng trong salon Chí Tâm — một salon chuyên nghiệp, tinh tế, thân thiện.

NHIỆM VỤ:
Tạo tin nhắn follow-up theo loại: ${type}

THÔNG TIN KHÁCH HÀNG:
- Tên: ${customerName || "khách"}
- SĐT: ${phone || "chưa có"}
- Dịch vụ gần nhất: ${lastService?.name || "chưa có"}
- Ngày dịch vụ: ${lastService?.date || "chưa có"}
- Hồ sơ: ${JSON.stringify(history, null, 2)}

LOẠI TIN NHẮN:
${template.description}

YÊU CẦU:
- Ngắn gọn 1-3 câu (tối đa 100 từ)
- Giọng văn: thân thiện, chuyên nghiệp, gần gũi như lễ tân salon
- Không dùng markdown
- Không dùng emoji quá nhiều (chỉ 1-2 emoji phù hợp)
- Cá nhân hóa dựa trên hồ sơ khách
- Tự nhiên, không gượng ép
- Tiếng Việt có dấu, đúng chính tả

CHỈ TRẢ VỀ TEXT THUẦN (không có markdown, không có code blocks, không có quotes).

Hãy tạo tin nhắn phù hợp.
  `;

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Bạn là AI chăm sóc khách hàng salon Chí Tâm. Tạo tin nhắn thân thiện, chuyên nghiệp, ngắn gọn.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 200,
      temperature: 0.8, // Slightly creative for natural tone
    });

    const message = completion.choices[0]?.message?.content?.trim();

    if (!message) {
      throw new Error("AI did not return message content");
    }

    // Clean up message (remove markdown if any)
    return cleanMessage(message);
  } catch (error: any) {
    console.error("Failed to generate follow-up message:", error);
    // Fallback to template message
    return getFallbackMessage(type, customerName);
  }
}

// ============================================
// Message Templates
// ============================================

function getMessageTemplate(type: FollowUpMessageType) {
  const templates: Record<
    FollowUpMessageType,
    { description: string; fallback: string }
  > = {
    thank_you: {
      description:
        "Cảm ơn khách đã sử dụng dịch vụ, hỏi thăm tình trạng tóc hôm nay, gợi ý chăm sóc nhẹ nhàng.",
      fallback: "Cảm ơn chị đã đến salon hôm nay. Tóc chị hôm nay ổn chứ? Nếu có gì cần hỗ trợ, chị cứ nhắn em nha ❤️",
    },
    check_health: {
      description:
        "Hỏi thăm tình trạng tóc sau 3 ngày, phát hiện vấn đề sớm, gợi ý sản phẩm nếu cần.",
      fallback: "Chị ơi, tóc chị mấy hôm nay giữ nếp ok không? Có bị khô hay rối không để em hỗ trợ nha 💇‍♀️",
    },
    care_tip: {
      description:
        "Gửi tip chăm sóc tóc, gợi ý sản phẩm dưỡng phù hợp, tinh tế không gượng ép.",
      fallback: "Chị ơi, em gửi chị một số tip nhỏ để tóc giữ nếp lâu hơn. Nếu cần sản phẩm dưỡng, em tư vấn cho nhé 💆‍♀️",
    },
    light_upsell: {
      description:
        "Khảo sát nhẹ, gợi ý dịch vụ phù hợp (nhuộm nhẹ, treatment), không ép buộc.",
      fallback: "Chị có muốn thử nhuộm nhẹ để refresh màu tóc không? Em tư vấn cho chị xem phù hợp không nhé 🎨",
    },
    booking_reminder: {
      description:
        "Nhắc lịch uốn/nhuộm tiếp theo một cách tinh tế, dựa trên lịch sử của khách.",
      fallback: "Chị ơi, đã đến lúc làm mới tóc rồi nè. Em có lịch trống, chị muốn đặt hẹn không? 📅",
    },
    return_offer: {
      description:
        "Ưu đãi nhẹ để khách quay lại, phát hiện khách có nguy cơ rời bỏ.",
      fallback: "Chị lâu rồi không ghé salon, em nhớ chị lắm! Em có ưu đãi đặc biệt cho chị, chị check tin nhắn nha 🎁",
    },
    churn_prevention: {
      description:
        "Phát hiện khách có nguy cơ rời bỏ, gửi ưu đãi hoặc hỏi thăm nguyên nhân.",
      fallback: "Chị ơi, em thấy chị lâu rồi chưa ghé salon. Có gì chị cần hỗ trợ không? Em sẵn sàng giúp chị nhé 🙏",
    },
  };

  return templates[type] || templates.thank_you;
}

// ============================================
// Fallback Messages
// ============================================

function getFallbackMessage(
  type: FollowUpMessageType,
  customerName?: string
): string {
  const template = getMessageTemplate(type);
  return template.fallback;
}

// ============================================
// Clean Message
// ============================================

function cleanMessage(message: string): string {
  // Remove markdown
  let cleaned = message.replace(/\*\*(.*?)\*\*/g, "$1");
  cleaned = cleaned.replace(/\*(.*?)\*/g, "$1");
  cleaned = cleaned.replace(/`(.*?)`/g, "$1");

  // Remove code blocks
  cleaned = cleaned.replace(/```[\s\S]*?```/g, "");
  cleaned = cleaned.replace(/`[\s\S]*?`/g, "");

  // Remove quotes
  cleaned = cleaned.replace(/^["']|["']$/g, "");
  cleaned = cleaned.replace(/^["']|["']$/g, "");

  // Trim and clean whitespace
  cleaned = cleaned.trim().replace(/\n+/g, " ").replace(/\s+/g, " ");

  return cleaned;
}

