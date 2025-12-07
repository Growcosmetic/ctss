// ============================================
// Marketing Content Prompt
// ============================================

export interface MarketingContentPayload {
  topic: string;
  goal: string;
  platform: "facebook" | "instagram" | "tiktok";
  style: "friendly" | "luxury" | "energetic" | "professional";
  additionalContext?: string;
}

export function marketingContentPrompt(payload: MarketingContentPayload): string {
  const styleDescriptions: Record<string, string> = {
    friendly: "Thân thiện, gần gũi, như một người bạn",
    luxury: "Sang trọng, cao cấp, tinh tế",
    energetic: "Tươi trẻ, năng động, phong cách Gen Z",
    professional: "Chuyên nghiệp, uy tín, đáng tin cậy",
  };

  return `
Bạn là AI Marketing của Chí Tâm Hair Salon — một salon tóc cao cấp, chuyên nghiệp, với phong cách tinh tế và hiện đại.

NHIỆM VỤ:
Tạo nội dung marketing cho ${payload.platform.toUpperCase()} theo chủ đề và mục tiêu được yêu cầu.

GIỌNG VĂN:
- Chuyên nghiệp nhưng gần gũi
- Hiện đại, tinh tế, mang màu sắc Chí Tâm Hair Salon (ấm, sang, tinh tế)
- Phong cách: ${styleDescriptions[payload.style]}
- Độ dài: ngắn gọn, rõ ràng, có cảm xúc
- CTA mượt mà, tự nhiên, không thô

PLATFORM ĐẶC ĐIỂM:
${getPlatformGuidelines(payload.platform)}

YÊU CẦU:
- Không dùng markdown
- Không dùng emoji quá nhiều (1-2 emoji phù hợp)
- Hashtag phù hợp với platform
- CTA phù hợp với mục tiêu

TRẢ VỀ JSON THEO FORMAT:
{
  "headline": "Tiêu đề ngắn gọn, hấp dẫn",
  "content": "Nội dung chính (2-4 câu), có thể có xuống dòng",
  "hashtags": "Danh sách hashtag cách nhau bằng dấu cách",
  "cta": "Call-to-action ngắn gọn, tự nhiên",
  "style": "${payload.style}"
}

DỮ LIỆU:
Chủ đề: ${payload.topic}
Mục tiêu: ${payload.goal}
Platform: ${payload.platform}
Phong cách: ${payload.style}
${payload.additionalContext ? `Context thêm: ${payload.additionalContext}` : ""}

Hãy tạo nội dung marketing phù hợp và trả về JSON hợp lệ.
  `;
}

// ============================================
// Platform-specific Guidelines
// ============================================

function getPlatformGuidelines(platform: string): string {
  const guidelines: Record<string, string> = {
    facebook:
      "- Facebook: Nội dung chi tiết hơn, có thể dài\n- Có thể tag, mention\n- Hashtag: 3-5 hashtag phổ biến\n- CTA: 'Nhắn tin ngay', 'Đặt lịch ngay', 'Comment để được tư vấn'",
    instagram:
      "- Instagram: Visual-first, nội dung ngắn gọn, súc tích\n- Hashtag: 5-10 hashtag mix phổ biến và niche\n- CTA: 'DM để đặt lịch', 'Swipe để xem thêm', 'Save để tham khảo'",
    tiktok:
      "- TikTok: Ngắn gọn, catchy, trending\n- Hashtag: 3-5 hashtag trending\n- CTA: 'Comment ý kiến', 'Follow để xem thêm', 'Nhắn tin để book'",
  };

  return guidelines[platform] || guidelines.facebook;
}

