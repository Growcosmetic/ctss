// ============================================
// Content Generator Prompt - AI tạo nội dung marketing
// ============================================

export function contentGeneratorPrompt(data: {
  contentType: "POST" | "AD" | "REEL" | "SCRIPT" | "IMAGE_PROMPT";
  service?: string;
  campaign?: string;
  targetAudience?: string;
  platform?: string;
  tone?: string;
}): string {
  const { contentType, service, campaign, targetAudience, platform, tone } = data;

  let prompt = "";

  if (contentType === "AD" || contentType === "SCRIPT") {
    prompt = `
Bạn là AI Marketing Copywriter chuyên nghiệp cho Chí Tâm Hair Salon.

TẠO SCRIPT QUẢNG CÁO:
- Dịch vụ: ${service || "Uốn nóng Hàn Quốc"}
- Chiến dịch: ${campaign || "Không có"}
- Đối tượng: ${targetAudience || "Khách hàng nữ 20-35 tuổi"}
- Platform: ${platform || "TikTok/Facebook"}
- Tone: ${tone || "Thân thiện, chuyên nghiệp"}

Trả về JSON:

{
  "hook": "Câu hook 3 giây đầu (ngắn gọn, thu hút)",
  "body": "Nội dung chính 15-30 giây (giải quyết vấn đề, quy trình, kết quả)",
  "cta": "Call-to-action (kêu gọi hành động)",
  "hashtags": ["hashtag1", "hashtag2", ...],
  "duration": "15 | 30 | 60",
  "tips": "Gợi ý quay video"
}

LƯU Ý:
- Hook phải thu hút trong 3 giây đầu
- Body tập trung vào lợi ích, kết quả
- CTA rõ ràng, dễ nhớ
- Hashtags phù hợp platform và dịch vụ
- Tone phù hợp với đối tượng

CHỈ TRẢ VỀ JSON - KHÔNG DÙNG MARKDOWN.
    `;
  } else if (contentType === "POST") {
    prompt = `
Bạn là AI Social Media Manager cho Chí Tâm Hair Salon.

TẠO POST:
- Chủ đề: ${service || "Chăm sóc tóc"}
- Đối tượng: ${targetAudience || "Khách hàng nữ"}
- Platform: ${platform || "Facebook/Instagram"}
- Tone: ${tone || "Thân thiện, hữu ích"}

Trả về JSON:

{
  "title": "Tiêu đề post",
  "content": "Nội dung post (200-300 từ, dễ đọc, có giá trị)",
  "hashtags": ["hashtag1", "hashtag2", ...],
  "imagePrompt": "Prompt tạo hình ảnh (mô tả chi tiết, phong cách Chí Tâm)",
  "callToAction": "CTA cho post"
}

LƯU Ý:
- Nội dung hữu ích, giá trị cho khách
- Có thể là tips, bí quyết, story
- Image prompt: phong cách Hàn Quốc, tone xanh mint-navy, sang trọng
- Hashtags phù hợp

CHỈ TRẢ VỀ JSON - KHÔNG DÙNG MARKDOWN.
    `;
  } else if (contentType === "REEL") {
    prompt = `
Bạn là AI Video Content Creator cho Chí Tâm Hair Salon.

TẠO REEL SCRIPT:
- Chủ đề: ${service || "Quy trình uốn nóng"}
- Đối tượng: ${targetAudience || "Khách hàng nữ"}
- Platform: ${platform || "TikTok/Instagram Reels"}
- Tone: ${tone || "Năng động, trendy"}

Trả về JSON:

{
  "title": "Tiêu đề reel",
  "script": [
    {"time": "0-3s", "action": "Hook - thu hút"},
    {"time": "3-10s", "action": "Giới thiệu vấn đề"},
    {"time": "10-20s", "action": "Quy trình/giải pháp"},
    {"time": "20-30s", "action": "Kết quả + CTA"}
  ],
  "hashtags": ["hashtag1", "hashtag2", ...],
  "music": "Gợi ý nhạc nền",
  "visuals": "Gợi ý hình ảnh/quay"
}

LƯU Ý:
- Script ngắn gọn, dễ hiểu
- Visuals: before/after, quy trình, kết quả
- Music: trendy, phù hợp platform
- Hashtags viral, liên quan

CHỈ TRẢ VỀ JSON - KHÔNG DÙNG MARKDOWN.
    `;
  } else if (contentType === "IMAGE_PROMPT") {
    prompt = `
Bạn là AI Image Prompt Generator cho Chí Tâm Hair Salon.

TẠO PROMPT TẠO HÌNH ẢNH:
- Chủ đề: ${service || "Uốn nóng"}
- Phong cách: Hàn Quốc, sang trọng, hiện đại
- Brand colors: Xanh mint - Navy
- Đối tượng: ${targetAudience || "Khách hàng nữ"}

Trả về JSON:

{
  "prompt": "Prompt chi tiết cho AI image generator (DALL-E, Midjourney, etc.)",
  "style": "Phong cách",
  "colors": "Màu sắc",
  "mood": "Tâm trạng/atmosphere",
  "composition": "Bố cục"
}

LƯU Ý:
- Prompt chi tiết, rõ ràng
- Phong cách: Hàn Quốc, soft lighting, professional
- Colors: mint green, navy blue, white
- Mood: sang trọng, hiện đại, thân thiện

CHỈ TRẢ VỀ JSON - KHÔNG DÙNG MARKDOWN.
    `;
  }

  return prompt;
}

