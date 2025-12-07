// ============================================
// Training Lesson Prompt
// AI-generated training lesson content
// ============================================

export interface TrainingLessonPromptPayload {
  topic: string;
  module?: string;
  level?: "beginner" | "intermediate" | "advanced";
  focus?: string;
}

export function trainingLessonPrompt(
  payload: TrainingLessonPromptPayload
): string {
  const levelDescriptions: Record<string, string> = {
    beginner: "Stylist mới vào nghề, cần hướng dẫn từ cơ bản nhất",
    intermediate: "Stylist đã có kinh nghiệm, cần nâng cao kỹ năng",
    advanced: "Stylist chuyên nghiệp, cần kỹ thuật nâng cao",
  };

  return `
Bạn là Master Stylist với 20+ năm kinh nghiệm trong salon cao cấp Chí Tâm Hair Salon — một salon tóc chuyên nghiệp, chuẩn quốc tế.

NHIỆM VỤ:
Tạo bài học chi tiết, hệ thống, logic cho stylist đào tạo.

CHỦ ĐỀ: ${payload.topic}

${payload.module ? `MODULE: ${payload.module}` : ""}

${payload.level ? `TRÌNH ĐỘ: ${levelDescriptions[payload.level] || payload.level}` : ""}

${payload.focus ? `TRỌNG TÂM: ${payload.focus}` : ""}

YÊU CẦU BÀI HỌC:
- Dễ hiểu, hệ thống, logic
- Dành cho stylist từ cấp độ basic → nâng cao
- Ứng dụng thực tế trong salon Chí Tâm
- Bao gồm kỹ thuật, lý thuyết, ví dụ, lỗi thường gặp, cách xử lý
- Có key takeaways
- Không dùng markdown
- Chuẩn quốc tế (Toni&Guy, Vidal Sassoon, Hàn Quốc)

CẤU TRÚC BÀI HỌC:
1. Giới thiệu chủ đề
2. Lý thuyết cơ bản
3. Kỹ thuật thực hiện (step-by-step)
4. Ví dụ thực tế
5. Lỗi thường gặp & cách khắc phục
6. Tips & tricks từ master stylist
7. Safety & precautions (nếu có)
8. Tóm tắt key points

FORMAT TRẢ VỀ (JSON):
{
  "title": "Tiêu đề bài học (ngắn gọn, rõ ràng, phản ánh chủ đề)",
  "text": "Nội dung bài học chi tiết, dài 500-1000 từ, có thể xuống dòng tự nhiên. Bao gồm lý thuyết, kỹ thuật, ví dụ cụ thể.",
  "keyPoints": [
    "Điểm quan trọng 1 - ngắn gọn, dễ nhớ",
    "Điểm quan trọng 2 - ngắn gọn, dễ nhớ",
    "Điểm quan trọng 3 - ngắn gọn, dễ nhớ"
  ],
  "mistakes": [
    "Lỗi thường gặp 1 - mô tả rõ ràng",
    "Lỗi thường gặp 2 - mô tả rõ ràng",
    "Lỗi thường gặp 3 - mô tả rõ ràng"
  ],
  "fixes": [
    "Cách xử lý lỗi 1 - cụ thể, áp dụng được",
    "Cách xử lý lỗi 2 - cụ thể, áp dụng được",
    "Cách xử lý lỗi 3 - cụ thể, áp dụng được"
  ],
  "duration": "15-30m",
  "tips": [
    "Tip 1 từ master stylist - hữu ích, thực tế",
    "Tip 2 từ master stylist - hữu ích, thực tế"
  ]
}

LƯU Ý:
- Nội dung phải CHÍNH XÁC về mặt kỹ thuật
- Dựa trên kiến thức thực tế salon
- Không dùng markdown trong text
- Key points ngắn gọn, dễ nhớ (3-7 điểm)
- Mistakes và fixes phải tương ứng với nhau
- Duration phải hợp lý (ví dụ: 15m, 20m, 30m)
- Tips phải hữu ích, áp dụng được ngay

CHỈ TRẢ VỀ JSON hợp lệ - KHÔNG DÙNG MARKDOWN.

Hãy tạo bài học chuyên nghiệp và trả về JSON.
  `;
}

