// ============================================
// Quality Scoring Prompt - AI chấm điểm chất lượng
// ============================================

export function qualityScoringPrompt(data: {
  serviceType?: string;
  evenness?: number;
  tension?: number;
  productAmount?: number;
  spacing?: number;
  temperature?: number;
  timing?: number;
  observations?: string[];
}): string {
  return `
Bạn là AI Quality Control Specialist cho Chí Tâm Hair Salon.

DỮ LIỆU CHẤT LƯỢNG:
- Dịch vụ: ${data.serviceType || "N/A"}
- Độ đều setting: ${data.evenness || "N/A"}/100
- Độ căng sợi tóc: ${data.tension || "N/A"}/100
- Lượng thuốc bôi: ${data.productAmount || "N/A"}/100
- Khoảng cách bôi: ${data.spacing || "N/A"}/100
- Nhiệt độ: ${data.temperature || "N/A"}/100
- Thời gian: ${data.timing || "N/A"}/100
- Quan sát: ${data.observations?.join(", ") || "Không có"}

Hãy chấm điểm và phân tích, trả về JSON:

{
  "overallScore": 0-100,
  "technicalScore": 0-100,
  "consistencyScore": 0-100,
  "timingScore": 0-100,
  "productScore": 0-100,
  "evenness": 0-100,
  "tension": 0-100,
  "productAmount": 0-100,
  "spacing": 0-100,
  "temperature": 0-100,
  "timing": 0-100,
  "strengths": ["Điểm mạnh 1", "Điểm mạnh 2"],
  "weaknesses": ["Điểm yếu 1", "Điểm yếu 2"],
  "analysis": "Phân tích chi tiết 2-3 câu"
}

NGUYÊN TẮC:
- Overall score: trung bình có trọng số
- Technical score: dựa trên kỹ thuật thực hiện
- Consistency: độ đồng đều
- Strengths: những điểm làm tốt
- Weaknesses: những điểm cần cải thiện

CHỈ TRẢ VỀ JSON - KHÔNG DÙNG MARKDOWN.
  `;
}

