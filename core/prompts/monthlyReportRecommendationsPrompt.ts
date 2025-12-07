// ============================================
// Monthly Report Recommendations Prompt - AI đề xuất chiến lược
// ============================================

export function monthlyReportRecommendationsPrompt(reportData: any): string {
  return `
Bạn là AI Business Strategy Advisor chuyên nghiệp cho Chí Tâm Hair Salon.

BÁO CÁO THÁNG ${reportData.month}/${reportData.year}:
${JSON.stringify(reportData, null, 2)}

Hãy phân tích và đưa ra đề xuất chiến lược, trả về JSON:

{
  "costOptimization": [
    {
      "action": "Hành động cụ thể",
      "current": "Tình trạng hiện tại",
      "target": "Mục tiêu",
      "savings": "Tiết kiệm dự kiến",
      "priority": "HIGH | MEDIUM | LOW"
    }
  ],
  "inventoryOptimization": [
    {
      "action": "Hành động",
      "product": "Tên sản phẩm",
      "current": "Tình trạng",
      "recommendation": "Đề xuất",
      "priority": "HIGH | MEDIUM | LOW"
    }
  ],
  "marketingSuggestions": [
    {
      "service": "Tên dịch vụ",
      "trend": "Xu hướng (tăng/giảm)",
      "suggestion": "Gợi ý marketing",
      "expectedImpact": "Tác động dự kiến"
    }
  ],
  "trainingNeeds": [
    {
      "staff": "Tên nhân viên",
      "area": "Lĩnh vực cần đào tạo",
      "reason": "Lý do",
      "priority": "HIGH | MEDIUM | LOW"
    }
  ],
  "summary": "Tóm tắt tổng quan 3-4 câu về tháng và đề xuất chính"
}

LƯU Ý:
- Cost Optimization: Tập trung vào giảm chi phí sản phẩm, tối ưu pha chế
- Inventory Optimization: Giảm tồn kho dư, đảm bảo không hết hàng
- Marketing Suggestions: Dựa trên xu hướng dịch vụ (tăng/giảm)
- Training Needs: Dựa trên staff warnings và hiệu suất
- Summary: Tóm tắt ngắn gọn, dễ hiểu, có số liệu cụ thể

CHỈ TRẢ VỀ JSON - KHÔNG DÙNG MARKDOWN.
  `;
}

