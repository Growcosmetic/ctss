// ============================================
// Reels / Shorts Prompt
// ============================================

export interface ReelsPromptPayload {
  topic: string;
  goal: string;
  platform: "tiktok" | "instagram" | "youtube" | "facebook";
  style: "viral" | "chill" | "luxury" | "professional";
  additionalContext?: string;
}

export function reelsPrompt(payload: ReelsPromptPayload): string {
  const styleDescriptions: Record<string, string> = {
    viral: "Hấp dẫn, trending, dễ share, dễ thấy ở FYP",
    chill: "Thư giãn, nhẹ nhàng, vibe tự nhiên",
    luxury: "Sang trọng, cao cấp, tinh tế",
    professional: "Chuyên nghiệp, uy tín, giáo dục",
  };

  const platformGuidelines: Record<string, string> = {
    tiktok: "- TikTok: Hook cực mạnh 1-3 giây đầu\n- Trend sounds, trending hashtags\n- Quick cuts, dynamic\n- CTA: 'Follow', 'Comment', 'DM'",
    instagram: "- Instagram Reels: Visual-first, aesthetic\n- Trending audio\n- Use trending hashtags\n- CTA: 'Save', 'Share', 'DM để book'",
    youtube: "- YouTube Shorts: Educational/entertaining\n- Clear value proposition\n- YouTube trending sounds\n- CTA: 'Subscribe', 'Watch full video', 'Book now'",
    facebook: "- Facebook Shorts: Informative, engaging\n- Clear messaging\n- Facebook trending sounds\n- CTA: 'Comment', 'Share', 'Message us'",
  };

  return `
Bạn là AI chuyên tạo kịch bản video ngắn (Reels / TikTok / Shorts) cho Chí Tâm Hair Salon — một salon tóc cao cấp, chuyên nghiệp.

NHIỆM VỤ:
Tạo kịch bản video ngắn 10-30 giây cho ${payload.platform.toUpperCase()} theo chủ đề và mục tiêu được yêu cầu.

YÊU CẦU KỊCH BẢN:
- Độ dài: 10-30 giây (tối ưu 15-20s)
- Dễ quay bằng điện thoại
- Hiệu ứng đơn giản, dễ thực hiện
- Hook cực mạnh ở 1-3 giây đầu (quan trọng nhất!)
- Giọng văn: hiện đại, gần gũi, chuyên nghiệp
- Phong cách: ${styleDescriptions[payload.style]}

PLATFORM GUIDELINES:
${platformGuidelines[payload.platform]}

CẤU TRÚC VIDEO:
1. HOOK (1-3s): Câu mở đầu cực hấp dẫn, gây tò mò
2. CONTENT (10-20s): Nội dung chính, giải quyết vấn đề/thể hiện giá trị
3. CTA (2-3s): Call-to-action rõ ràng

TRẢ VỀ JSON THEO FORMAT:
{
  "idea": "Ý tưởng tổng thể của video (1 câu)",
  "hook": "Hook 1-3 giây đầu cực mạnh, gây tò mò",
  "script": "Kịch bản chi tiết từng bước (numbered steps hoặc timeline)",
  "visualGuide": [
    "Shot 1: Mô tả cảnh quay đầu tiên",
    "Shot 2: Mô tả cảnh quay thứ hai",
    "Shot 3: ..."
  ],
  "audioSuggestion": "Gợi ý nhạc/âm thanh phù hợp",
  "cta": "Call-to-action cuối video",
  "duration": "15-20s",
  "style": "${payload.style}",
  "hashtags": "Hashtag trending phù hợp (tùy chọn)"
}

THÔNG TIN VIDEO:
Chủ đề: ${payload.topic}
Mục tiêu: ${payload.goal}
Nền tảng: ${payload.platform}
Phong cách: ${payload.style}
${payload.additionalContext ? `Context thêm: ${payload.additionalContext}` : ""}

LƯU Ý:
- Hook PHẢI cực mạnh, gây tò mò ngay từ giây đầu
- Visual guide phải cụ thể, dễ thực hiện
- Script phải chia rõ từng bước/timeline
- Audio suggestion phù hợp với platform và style
- CTA tự nhiên, không gượng ép

Hãy tạo kịch bản video và trả về JSON hợp lệ. CHỈ TRẢ VỀ JSON - KHÔNG DÙNG MARKDOWN.
  `;
}

