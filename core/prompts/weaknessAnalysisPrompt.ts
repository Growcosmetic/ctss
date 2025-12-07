// ============================================
// Weakness Analysis Prompt - Phân tích điểm yếu
// ============================================

export function weaknessAnalysisPrompt(
  skillScores: any,
  conversation?: any[],
  assessmentHistory?: any[]
): string {
  return `
Bạn là chuyên gia phân tích năng lực của Chí Tâm Hair Salon.

ĐIỂM SỐ KỸ NĂNG:
${JSON.stringify(skillScores, null, 2)}

LỊCH SỬ ĐÁNH GIÁ (nếu có):
${assessmentHistory ? JSON.stringify(assessmentHistory, null, 2) : "Chưa có"}

Hãy phân tích điểm yếu và đưa ra JSON:

{
  "weakSkills": ["Tên kỹ năng yếu nhất"],
  "commonErrors": ["Lỗi phổ biến 1", "Lỗi phổ biến 2"],
  "trendAnalysis": "Xu hướng cải thiện/giảm sút (nếu có dữ liệu)",
  "priorityAreas": ["Khu vực cần ưu tiên cải thiện 1", "Khu vực 2"],
  "rootCauses": ["Nguyên nhân gốc rễ 1", "Nguyên nhân 2"]
}

LƯU Ý:
- Xác định kỹ năng yếu nhất (dưới 14/20)
- Phân tích nguyên nhân gốc rễ
- Đưa ra các lỗi phổ biến
- Xác định ưu tiên cải thiện

CHỈ TRẢ VỀ JSON - KHÔNG DÙNG MARKDOWN.
  `;
}

