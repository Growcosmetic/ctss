// ============================================
// Inventory Projection Prompt - AI dự đoán tồn kho
// ============================================

export function inventoryProjectionPrompt(
  product: {
    name: string;
    category: string;
    unit: string;
  },
  consumptionData: {
    averageDailyUsage: number;
    peakUsage: number;
    lowUsage: number;
    recentTrend: "increasing" | "decreasing" | "stable";
    seasonalPattern?: string;
  },
  currentStock: number,
  historicalData?: any
): string {
  return `
Bạn là AI Inventory Projection System cho Chí Tâm Hair Salon.

SẢN PHẨM: ${product.name} (${product.category})
ĐƠN VỊ: ${product.unit}

DỮ LIỆU TIÊU THỤ:
- Trung bình/ngày: ${consumptionData.averageDailyUsage} ${product.unit}
- Peak/ngày: ${consumptionData.peakUsage} ${product.unit}
- Low/ngày: ${consumptionData.lowUsage} ${product.unit}
- Xu hướng: ${consumptionData.recentTrend}
${consumptionData.seasonalPattern ? `- Mùa vụ: ${consumptionData.seasonalPattern}` : ""}

TỒN KHO HIỆN TẠI: ${currentStock} ${product.unit}

Hãy phân tích và đưa ra dự báo, trả về JSON:

{
  "projections": {
    "days7": ${consumptionData.averageDailyUsage * 7},
    "days14": ${consumptionData.averageDailyUsage * 14},
    "days30": ${consumptionData.averageDailyUsage * 30}
  },
  "adjustments": {
    "seasonalFactor": 1.0,  // 0.8-1.2 (giảm/tăng theo mùa)
    "trendFactor": 1.0,     // 0.9-1.1 (theo xu hướng gần đây)
    "peakFactor": 1.0       // 1.0-1.3 (điều chỉnh cho peak days)
  },
  "adjustedProjection30Days": 0,
  "daysUntilEmpty": 0,
  "riskLevel": "low | medium | high",
  "analysis": "Phân tích chi tiết (2-3 câu)",
  "recommendations": [
    "Gợi ý 1",
    "Gợi ý 2"
  ]
}

LƯU Ý:
- Điều chỉnh theo xu hướng (increasing/decreasing/stable)
- Xem xét mùa vụ nếu có (lễ tết, mùa cao điểm)
- Tính toán daysUntilEmpty dựa trên adjusted projection
- Đánh giá risk level dựa trên daysUntilEmpty và safety stock

CHỈ TRẢ VỀ JSON - KHÔNG DÙNG MARKDOWN.
  `;
}

