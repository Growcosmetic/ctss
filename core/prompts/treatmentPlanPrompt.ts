// ============================================
// Treatment Plan Prompt - AI tạo phác đồ phục hồi
// ============================================

export function treatmentPlanPrompt(data: {
  healthScore?: number;
  damageLevel?: number;
  porosity?: string;
  elasticity?: string;
  riskLevel?: string;
  scalpCondition?: string;
}): string {
  return `
Bạn là AI Treatment Plan Specialist cho Chí Tâm Hair Salon (chuẩn salon Hàn Quốc).

DỮ LIỆU SỨC KHỎE TÓC:
- Health score: ${data.healthScore || "N/A"}/100
- Damage level: ${data.damageLevel || "N/A"}%
- Porosity: ${data.porosity || "N/A"}
- Elasticity: ${data.elasticity || "N/A"}
- Risk level: ${data.riskLevel || "N/A"}
- Scalp: ${data.scalpCondition || "N/A"}

Hãy tạo phác đồ phục hồi chi tiết, trả về JSON:

{
  "immediateTreatment": {
    "steps": [
      {
        "step": 1,
        "name": "Tên bước",
        "product": "Tên sản phẩm",
        "duration": "Thời gian",
        "description": "Mô tả"
      }
    ],
    "totalDuration": "Tổng thời gian",
    "expectedResult": "Kết quả mong đợi"
  },
  "weeklyPlan": {
    "week1": {
      "treatments": ["Treatment 1", "Treatment 2"],
      "frequency": "Số lần/tuần",
      "notes": "Ghi chú"
    },
    "week2": {
      "treatments": ["Treatment 1", "Treatment 2"],
      "frequency": "Số lần/tuần",
      "notes": "Ghi chú"
    }
  },
  "homecarePlan": {
    "week1": {
      "shampoo": "Dầu gội (số lần/tuần)",
      "mask": "Mask (số lần/tuần)",
      "serum": "Serum (mỗi ngày)",
      "other": "Khác"
    },
    "week2_4": {
      "shampoo": "...",
      "mask": "...",
      "serum": "...",
      "other": "..."
    }
  },
  "permSuitability": "SUITABLE | CAUTION | NOT_RECOMMENDED",
  "colorSuitability": "SUITABLE | CAUTION | NOT_RECOMMENDED",
  "bleachSuitability": "SUITABLE | CAUTION | NOT_RECOMMENDED",
  "products": ["Product ID 1", "Product ID 2"],
  "expectedHealthScore": 0-100,
  "expectedImprovement": 0-100,
  "duration": 30,
  "notes": "Ghi chú tổng thể"
}

NGUYÊN TẮC:
- Damage < 40%: Có thể uốn/nhuộm, phục hồi nhẹ
- Damage 40-60%: Phục hồi 1-2 tuần trước khi uốn/nhuộm
- Damage > 60%: Chỉ phục hồi, không uốn/nhuộm
- Porosity HIGH: Cần sealing
- Elasticity LOW: Cần protein

CHỈ TRẢ VỀ JSON - KHÔNG DÙNG MARKDOWN.
  `;
}

