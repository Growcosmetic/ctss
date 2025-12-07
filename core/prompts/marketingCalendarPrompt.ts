// ============================================
// Marketing Calendar Prompt
// ============================================

export interface MarketingCalendarPayload {
  range: "7" | "30";
  goal: string;
  platform: "facebook" | "instagram" | "tiktok" | "youtube";
  focus?: string;
  season?: string;
}

export function marketingCalendarPrompt(payload: MarketingCalendarPayload): string {
  const rangeLabel = payload.range === "7" ? "Tuần" : "Tháng";
  const dayCount = parseInt(payload.range);

  const platformGuidelines: Record<string, string> = {
    facebook:
      "- Facebook: Post + Reel mix\n- Format: Post (dài), Reel (ngắn), Carousel\n- Focus: Storytelling, giáo dục, cảm xúc",
    instagram:
      "- Instagram: Reels + Posts + Stories\n- Format: Reel, Carousel, Single Post, Story\n- Focus: Visual-first, aesthetic, lifestyle",
    tiktok:
      "- TikTok: Video ngắn\n- Format: Reel (10-60s)\n- Focus: Trendy, viral, entertaining",
    youtube:
      "- YouTube: Shorts + Long-form\n- Format: Shorts (30-60s), Posts\n- Focus: Educational, value-driven",
  };

  return `
Bạn là AI Marketing Planner cho Chí Tâm Hair Salon — một salon tóc cao cấp, chuyên nghiệp, với phong cách tinh tế và hiện đại.

NHIỆM VỤ:
Tạo lịch content marketing chi tiết cho ${rangeLabel} (${payload.range} ngày), đảm bảo đa dạng, chất lượng, và đúng tone thương hiệu.

YÊU CẦU:
- Nội dung: Chất lượng, đúng tone Chí Tâm Hair Salon (ấm, sang, tinh tế, chuyên nghiệp)
- Đa dạng: Phối hợp giữa giáo dục, cảm xúc, kỹ thuật, trước/sau, sản phẩm, behind-the-scenes, CTA
- Mục tiêu chính: ${payload.goal}
- Platform: ${payload.platform}
${payload.focus ? `- Trọng tâm: ${payload.focus}` : ""}
${payload.season ? `- Mùa/Thời điểm: ${payload.season}` : ""}

PLATFORM GUIDELINES:
${platformGuidelines[payload.platform]}

PHÂN BỔ CONTENT THEO NGÀY:
- Giáo dục/Kỹ thuật: 30%
- Trước/Sau (Before/After): 25%
- Cảm xúc/Storytelling: 20%
- Sản phẩm/Recommendation: 15%
- Behind-the-scenes: 10%

FORMAT TRẢ VỀ (JSON):
{
  "range": "${payload.range}",
  "goal": "${payload.goal}",
  "platform": "${payload.platform}",
  "items": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "topic": "Chủ đề cụ thể",
      "contentIdea": "Ý tưởng nội dung chi tiết",
      "format": "reel | post | carousel | story",
      "cta": "Call-to-action cụ thể",
      "hashtags": "Hashtag phù hợp (optional)",
      "category": "educational | before_after | emotional | product | behind_scenes"
    }
  ]
}

YÊU CẦU CHẤT LƯỢNG:
- Mỗi ngày 1 chủ đề khác nhau, không trùng lặp
- CTA rõ ràng, tự nhiên, phù hợp với mục tiêu
- Format đa dạng (reel, post, carousel)
- Hashtag phù hợp với platform
- Nội dung thực tế, có thể thực hiện được

LƯU Ý:
- Ngày 1: Hook mạnh để bắt đầu chiến dịch
- Giữa tuần/tháng: Giữ momentum
- Cuối tuần/tháng: CTA mạnh để convert
- Không dùng markdown
- CHỈ TRẢ VỀ JSON hợp lệ

Hãy tạo lịch content marketing cho ${dayCount} ngày và trả về JSON hợp lệ.
  `;
}

