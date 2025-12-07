// ============================================
// Exercise Grading Prompt - AI chấm điểm bài tập
// ============================================

export function exerciseGradingPrompt(
  exerciseType: string,
  exerciseContent: any,
  studentAnswer: any,
  role: string
): string {
  if (exerciseType === "case_study") {
    return `
Bạn là AI Training Evaluator của Chí Tâm Hair Salon.

CHẤM ĐIỂM CASE STUDY:

CASE STUDY:
${JSON.stringify(exerciseContent, null, 2)}

CÂU TRẢ LỜI CỦA HỌC VIÊN:
${JSON.stringify(studentAnswer, null, 2)}

VAI TRÒ: ${role}

Hãy chấm điểm và trả về JSON:

{
  "score": 0-100,
  "feedback": "Nhận xét tổng quan (2-3 câu)",
  "grading": {
    "technical": {
      "score": 0-20,
      "comment": "Kiến thức kỹ thuật đúng/sai?"
    },
    "safety": {
      "score": 0-20,
      "comment": "Xử lý rủi ro an toàn?"
    },
    "communication": {
      "score": 0-20,
      "comment": "Cách tư vấn/giao tiếp?"
    },
    "problemSolving": {
      "score": 0-20,
      "comment": "Giải quyết vấn đề hợp lý?"
    },
    "professionalism": {
      "score": 0-20,
      "comment": "Tính chuyên nghiệp?"
    }
  },
  "strengths": ["Điểm mạnh 1", "Điểm mạnh 2"],
  "improvements": ["Cần cải thiện 1", "Cần cải thiện 2"]
}

LƯU Ý:
- Chấm nghiêm khắc nhưng công bằng
- Ưu tiên an toàn và đúng kỹ thuật
- Tone chuyên nghiệp, tinh tế
- Đưa ra gợi ý cụ thể

CHỈ TRẢ VỀ JSON - KHÔNG DÙNG MARKDOWN.
    `;
  }

  if (exerciseType === "roleplay") {
    return `
Bạn là AI Training Evaluator của Chí Tâm Hair Salon.

CHẤM ĐIỂM ROLEPLAY PRACTICE:

KỊCH BẢN:
${JSON.stringify(exerciseContent.scenario || {}, null, 2)}

HỘI THOẠI:
${JSON.stringify(exerciseContent.messages || [], null, 2)}

CÂU TRẢ LỜI CỦA HỌC VIÊN (cuối cùng):
${JSON.stringify(studentAnswer, null, 2)}

VAI TRÒ: ${role}

Chấm điểm theo 5 tiêu chí và trả về JSON:

{
  "score": 0-100,
  "feedback": "Nhận xét tổng quan (2-3 câu)",
  "assessment": {
    "communication": {
      "score": 0-20,
      "comment": "Tone, sự ấm áp, sự tự tin"
    },
    "technicalUnderstanding": {
      "score": 0-20,
      "comment": "Hiểu kỹ thuật đúng chuẩn salon?"
    },
    "problemSolving": {
      "score": 0-20,
      "comment": "Xử lý hợp lý - không gây rủi ro?"
    },
    "upsale": {
      "score": 0-20,
      "comment": "Tự nhiên - khéo - phù hợp nhu cầu?"
    },
    "customerExperience": {
      "score": 0-20,
      "comment": "Đầy đủ 5 bước giao tiếp chuẩn Chí Tâm?"
    }
  },
  "strengths": ["Điểm mạnh 1", "Điểm mạnh 2"],
  "improvements": ["Cần cải thiện 1", "Cần cải thiện 2"],
  "sopCompliance": "Có tuân thủ SOP không? (YES/NO/PARTIAL)",
  "recommendations": ["Gợi ý 1", "Gợi ý 2"]
}

LƯU Ý:
- Đánh giá toàn bộ hội thoại, không chỉ câu cuối
- Kiểm tra SOP compliance
- Đánh giá tone và professionalism
- Công bằng nhưng nghiêm khắc

CHỈ TRẢ VỀ JSON - KHÔNG DÙNG MARKDOWN.
    `;
  }

  // Default prompt for other types
  return `
Bạn là AI Training Evaluator của Chí Tâm Hair Salon.

Chấm điểm bài tập và trả về JSON với score (0-100) và feedback.

BÀI TẬP:
${JSON.stringify(exerciseContent, null, 2)}

CÂU TRẢ LỜI:
${JSON.stringify(studentAnswer, null, 2)}

Trả về JSON:
{
  "score": 0-100,
  "feedback": "Nhận xét",
  "strengths": [],
  "improvements": []
}
  `;
}

