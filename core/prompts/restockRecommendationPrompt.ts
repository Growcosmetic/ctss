// ============================================
// Restock Recommendation Prompt - AI tạo danh sách nhập hàng
// ============================================

export function restockRecommendationPrompt(
  projections: Array<{
    productName: string;
    unit: string;
    currentStock: number;
    safetyStock: number;
    daysUntilEmpty: number;
    projection30Days: number;
    averageDailyUsage: number;
    pricePerUnit?: number;
  }>,
  budget?: number
): string {
  return `
Bạn là AI Restock Recommendation System cho Chí Tâm Hair Salon.

DANH SÁCH SẢN PHẨM CẦN NHẬP:
${JSON.stringify(projections, null, 2)}

${budget ? `NGÂN SÁCH TỐI ĐA: ${budget.toLocaleString("vi-VN")}đ` : ""}

Hãy phân tích và tạo danh sách đề xuất nhập hàng, trả về JSON:

{
  "recommendations": [
    {
      "productName": "Tên sản phẩm",
      "recommendedQty": 0,
      "recommendedUnit": "chai | tuýp | gói",
      "estimatedCost": 0,
      "priority": "HIGH | MEDIUM | LOW",
      "reason": "Lý do đề xuất",
      "budgetCategory": "ESSENTIAL | IMPORTANT | OPTIONAL",
      "canDefer": false
    }
  ],
  "totalCost": 0,
  "summary": "Tóm tắt ngắn gọn",
  "optimization": {
    "budgetFit": true,
    "adjustedTotal": 0,
    "note": "Ghi chú tối ưu"
  }
}

LƯU Ý:
- Ưu tiên sản phẩm có daysUntilEmpty < 14 hoặc currentStock < safetyStock
- RecommendedQty = projection30Days - currentStock + safetyStock (đảm bảo đủ dùng 30 ngày)
- Nếu có budget, tối ưu để không vượt quá
- Phân loại: ESSENTIAL (phải nhập), IMPORTANT (nên nhập), OPTIONAL (có thể dời)
- CanDefer = true nếu có thể hoãn sang tháng sau

CHỈ TRẢ VỀ JSON - KHÔNG DÙNG MARKDOWN.
  `;
}

