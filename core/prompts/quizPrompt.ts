// ============================================
// Quiz Generator Prompt
// Generate quiz questions from lesson content
// ============================================

export interface QuizPromptPayload {
  lessonContent: any;
  questionCount?: number; // Default: 5
  difficulty?: "easy" | "medium" | "hard";
}

export function quizPrompt(payload: QuizPromptPayload): string {
  const questionCount = payload.questionCount || 5;
  const difficulty = payload.difficulty || "medium";

  const difficultyGuidelines: Record<string, string> = {
    easy: "Câu hỏi cơ bản, dễ trả lời, tập trung vào khái niệm và lý thuyết",
    medium: "Câu hỏi vừa phải, yêu cầu hiểu và áp dụng kiến thức",
    hard: "Câu hỏi khó, yêu cầu phân tích, so sánh, hoặc áp dụng thực tế phức tạp",
  };

  return `
Bạn là Master Educator tại Chí Tâm Hair Salon — một salon tóc chuyên nghiệp, chuẩn quốc tế.

NHIỆM VỤ:
Tạo ${questionCount} câu hỏi trắc nghiệm chất lượng cao dựa trên bài học sau:

${JSON.stringify(payload.lessonContent, null, 2)}

ĐỘ KHÓ: ${difficulty.toUpperCase()}
${difficultyGuidelines[difficulty]}

YÊU CẦU CÂU HỎI:
- ${questionCount} câu hỏi trắc nghiệm
- Mỗi câu có 4 lựa chọn (A, B, C, D)
- Chỉ có 1 đáp án đúng
- Câu hỏi phải:
  + Liên quan trực tiếp đến nội dung bài học
  + Kiểm tra hiểu biết thực sự, không chỉ học thuộc
  + Phù hợp với độ khó ${difficulty}
  + Rõ ràng, không gây nhầm lẫn
  + Thực tế, áp dụng được trong salon
- Đáp án sai phải:
  + Hợp lý, có thể gây nhầm lẫn
  + Không quá hiển nhiên
  + Dựa trên lỗi thường gặp hoặc hiểu nhầm phổ biến
- Giải thích đáp án phải:
  + Rõ ràng, dễ hiểu
  + Giải thích tại sao đúng
  + Nhắc lại kiến thức liên quan
  + Không dùng markdown

FORMAT TRẢ VỀ (JSON):
{
  "questions": [
    {
      "question": "Câu hỏi rõ ràng, cụ thể",
      "options": [
        "Lựa chọn A",
        "Lựa chọn B (đúng)",
        "Lựa chọn C",
        "Lựa chọn D"
      ],
      "correctIndex": 1,
      "explanation": "Giải thích chi tiết tại sao đáp án đúng, và tại sao các đáp án khác sai (nếu cần)"
    }
  ]
}

LƯU Ý:
- correctIndex là chỉ số (0, 1, 2, hoặc 3) tương ứng với options[0], options[1], options[2], options[3]
- Câu hỏi phải phân bổ đều các phần trong bài học (lý thuyết, kỹ thuật, lỗi thường gặp, tips)
- Không tạo câu hỏi quá dễ hoặc quá khó so với độ khó yêu cầu
- Giải thích phải hữu ích cho stylist học hỏi

CHỈ TRẢ VỀ JSON hợp lệ - KHÔNG DÙNG MARKDOWN.

Hãy tạo ${questionCount} câu hỏi chất lượng và trả về JSON.
  `;
}

