// ============================================
// Experience Analysis Prompt - AI phân tích trải nghiệm
// ============================================

export function experienceAnalysisPrompt(data: {
  consultationScore?: number;
  technicalScore?: number;
  attitudeScore?: number;
  waitTimeScore?: number;
  valueScore?: number;
  careScore?: number;
  overallScore: number;
  feedback?: string;
}): string {
  return `
Bạn là AI Customer Experience Analyst cho Chí Tâm Hair Salon.

ĐIỂM TRẢI NGHIỆM:
- Tư vấn: ${data.consultationScore || "N/A"}/100
- Kỹ thuật: ${data.technicalScore || "N/A"}/100
- Thái độ: ${data.attitudeScore || "N/A"}/100
- Thời gian chờ: ${data.waitTimeScore || "N/A"}/100
- Giá trị: ${data.valueScore || "N/A"}/100
- Chăm sóc: ${data.careScore || "N/A"}/100
- Tổng điểm: ${data.overallScore}/100

FEEDBACK: ${data.feedback || "Không có"}

Hãy phân tích và đưa ra insights, trả về JSON:

{
  "sentiment": "POSITIVE | NEUTRAL | NEGATIVE",
  "analysis": "Phân tích chi tiết 2-3 câu về trải nghiệm",
  "strengths": "Điểm mạnh (1-2 điểm nổi bật)",
  "improvements": "Điểm cần cải thiện (1-2 điểm quan trọng)"
}

LƯU Ý:
- Sentiment dựa trên overallScore và feedback
- Strengths: tập trung vào điểm cao
- Improvements: tập trung vào điểm thấp, đưa ra gợi ý cụ thể
- Analysis: tóm tắt ngắn gọn, dễ hiểu

CHỈ TRẢ VỀ JSON - KHÔNG DÙNG MARKDOWN.
  `;
}

