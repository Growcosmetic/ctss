// ============================================
// Stylist Evaluation Engine
// Evaluate stylist skills from conversation
// ============================================

import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export interface StylistEvaluation {
  scores: {
    questioning: number; // 0-10: Khả năng đặt câu hỏi đúng
    analysis: number; // 0-10: Phân tích vấn đề tóc
    suggestion: number; // 0-10: Gợi ý kiểu & dịch vụ phù hợp
    emotion: number; // 0-10: Xử lý cảm xúc khách
    closing: number; // 0-10: Chốt dịch vụ tinh tế
  };
  overallScore: number; // 0-100: Tổng điểm
  feedback: string; // Feedback chi tiết
  strengths: string[]; // Điểm mạnh
  improvements: string[]; // Cần cải thiện
}

export async function evaluateStylist(
  messages: any[],
  scenario?: string
): Promise<StylistEvaluation> {
  try {
    const prompt = `
Bạn là giám khảo chấm điểm kỹ năng stylist tại Chí Tâm Hair Salon — một salon tóc cao cấp, chuyên nghiệp.

NHIỆM VỤ:
Đánh giá kỹ năng của Stylist dựa trên đoạn hội thoại tư vấn khách hàng sau.

ĐOẠN HỘI THOẠI:
${JSON.stringify(messages, null, 2)}

${scenario ? `TÌNH HUỐNG: ${scenario}` : ""}

Hãy đánh giá Stylist ở 5 tiêu chí (mỗi tiêu chí 0-10 điểm):

1. **questioning** (Khả năng đặt câu hỏi):
   - Đặt câu hỏi đúng trọng tâm
   - Đủ thông tin để phân tích
   - Câu hỏi chuyên nghiệp, lịch sự
   - Không hỏi dư thừa hoặc thiếu thông tin

2. **analysis** (Phân tích vấn đề tóc):
   - Nhận diện đúng vấn đề khách đang gặp
   - Phân tích tình trạng tóc chính xác
   - Hiểu được nhu cầu và mong muốn của khách
   - Đánh giá rủi ro và khả năng thực hiện

3. **suggestion** (Gợi ý kiểu & dịch vụ):
   - Gợi ý phù hợp với tình trạng tóc
   - Phù hợp với mong muốn và phong cách khách
   - Giải thích rõ ràng lý do đề xuất
   - Đề xuất sản phẩm chăm sóc phù hợp

4. **emotion** (Xử lý cảm xúc khách):
   - Nhận diện cảm xúc, lo lắng của khách
   - An ủi, trấn an khách hợp lý
   - Xử lý khách khó tính hoặc nghi ngờ
   - Tạo cảm giác tin tưởng, thoải mái

5. **closing** (Chốt dịch vụ tinh tế):
   - Chốt dịch vụ một cách tự nhiên, không ép buộc
   - Xác nhận lại mong muốn của khách
   - Đặt lịch hẹn rõ ràng
   - Kết thúc cuộc trò chuyện chuyên nghiệp

TIÊU CHÍ CHẤM ĐIỂM:
- 8-10: Xuất sắc, chuyên nghiệp cao
- 6-7: Tốt, có thể cải thiện một số điểm
- 4-5: Trung bình, cần cải thiện nhiều
- 0-3: Yếu, cần đào tạo lại

FORMAT TRẢ VỀ (JSON):
{
  "scores": {
    "questioning": 0-10,
    "analysis": 0-10,
    "suggestion": 0-10,
    "emotion": 0-10,
    "closing": 0-10
  },
  "overallScore": 0-100,
  "feedback": "Feedback tổng quan về kỹ năng stylist, bao gồm những gì làm tốt và cần cải thiện (3-5 câu)",
  "strengths": [
    "Điểm mạnh 1",
    "Điểm mạnh 2"
  ],
  "improvements": [
    "Cần cải thiện 1",
    "Cần cải thiện 2"
  ]
}

LƯU Ý:
- overallScore = trung bình của 5 scores * 10 (làm tròn)
- Feedback phải cụ thể, có thể áp dụng được
- Strengths và improvements phải thực tế, rõ ràng
- Không dùng markdown

CHỈ TRẢ VỀ JSON hợp lệ - KHÔNG DÙNG MARKDOWN.
    `;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Bạn là giám khảo chấm điểm stylist chuyên nghiệp. Đánh giá khách quan, công bằng, có tính xây dựng. Trả về JSON hợp lệ.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1000,
      temperature: 0.5, // Lower temperature for more consistent scoring
      response_format: { type: "json_object" },
    });

    const rawOutput = completion.choices[0]?.message?.content;

    if (!rawOutput) {
      throw new Error("AI did not return evaluation");
    }

    // Parse JSON
    let evaluation: StylistEvaluation;
    try {
      evaluation = JSON.parse(rawOutput);
    } catch (parseError) {
      // Try to extract JSON from markdown if present
      const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        evaluation = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse evaluation as JSON");
      }
    }

    // Calculate overall score if not provided
    if (!evaluation.overallScore) {
      const avgScore =
        (evaluation.scores.questioning +
          evaluation.scores.analysis +
          evaluation.scores.suggestion +
          evaluation.scores.emotion +
          evaluation.scores.closing) /
        5;
      evaluation.overallScore = Math.round(avgScore * 10);
    }

    // Validate and set defaults
    if (!evaluation.strengths) evaluation.strengths = [];
    if (!evaluation.improvements) evaluation.improvements = [];

    return evaluation;
  } catch (error: any) {
    console.error("Evaluate stylist error:", error);
    // Return default evaluation on error
    return {
      scores: {
        questioning: 5,
        analysis: 5,
        suggestion: 5,
        emotion: 5,
        closing: 5,
      },
      overallScore: 50,
      feedback: "Không thể đánh giá do lỗi hệ thống. Vui lòng thử lại.",
      strengths: [],
      improvements: [],
    };
  }
}

