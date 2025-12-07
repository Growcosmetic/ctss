// ============================================
// Dashboard Recommendation Prompt - Gợi ý lộ trình tiếp theo
// ============================================

export function dashboardRecommendationPrompt(
  skillAverages: any,
  weakSkills: string[],
  completedModules: any[],
  currentLevel: number,
  availableModules: any[]
): string {
  return `
Bạn là AI Training Advisor của Chí Tâm Hair Salon.

ĐIỂM SỐ KỸ NĂNG HIỆN TẠI:
${JSON.stringify(skillAverages, null, 2)}

KỸ NĂNG YẾU:
${JSON.stringify(weakSkills, null, 2)}

MODULE ĐÃ HOÀN THÀNH:
${JSON.stringify(completedModules.map((m) => m.title || m.module?.title), null, 2)}

CẤP ĐỘ HIỆN TẠI:
Level ${currentLevel}

MODULE CÓ SẴN:
${JSON.stringify(availableModules.map((m) => ({ id: m.id, title: m.title, category: m.category })), null, 2)}

Hãy đề xuất lộ trình học tập tiếp theo và trả về JSON:

{
  "nextSteps": [
    {
      "type": "module | roleplay | exercise | review",
      "priority": "high | medium | low",
      "title": "Tên module/bài tập",
      "reason": "Lý do đề xuất",
      "estimatedTime": "Thời gian ước tính",
      "expectedImprovement": "Kỹ năng sẽ cải thiện sau khi học"
    }
  ],
  "focusArea": "Khu vực cần tập trung nhất",
  "timeline": "Thời gian hoàn thành ước tính",
  "targetScore": "Điểm mục tiêu sau khi hoàn thành"
}

LƯU Ý:
- Ưu tiên module/bài tập cải thiện kỹ năng yếu
- Tạo lộ trình logic, từ dễ đến khó
- Đưa ra timeline thực tế
- Gợi ý phù hợp với level hiện tại

CHỈ TRẢ VỀ JSON - KHÔNG DÙNG MARKDOWN.
  `;
}

