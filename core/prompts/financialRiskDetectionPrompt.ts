// ============================================
// Financial Risk Detection Prompt (32G)
// ============================================

export function financialRiskDetectionPrompt(
  currentData: {
    cogs?: any;
    revenue?: any;
    expenses?: any;
    wastage?: any;
    margins?: any;
  },
  previousData: {
    cogs?: any;
    revenue?: any;
    expenses?: any;
    wastage?: any;
    margins?: any;
  }
): string {
  return `
Bạn là AI chuyên phát hiện rủi ro tài chính tại Chí Tâm Hair Salon.

DỮ LIỆU HIỆN TẠI:
${JSON.stringify(currentData, null, 2)}

DỮ LIỆU KỲ TRƯỚC:
${JSON.stringify(previousData, null, 2)}

NHIỆM VỤ:
Phát hiện các rủi ro tài chính và đưa ra cảnh báo.

CÁC RỦI RO CẦN PHÁT HIỆN:

1. COGS_INCREASE:
   - COGS tăng bất thường (>15%)
   - Nguyên nhân có thể: hao hụt, định lượng sai

2. REVENUE_DECREASE:
   - Doanh thu giảm (>10%)
   - Booking giảm, customer retention thấp

3. EXPENSE_SPIKE:
   - Chi phí tăng đột biến
   - Chi phí nhân sự vượt mức

4. LOSS_MARGIN:
   - Margin giảm nghiêm trọng (<30%)
   - Chi nhánh lỗ

5. WASTAGE_HIGH:
   - Hao hụt sản phẩm cao (>15%)
   - Lãng phí

6. MARKETING_INEFFICIENT:
   - Marketing kém hiệu quả
   - ROI marketing thấp

7. UPSELL_DECREASE:
   - Upsale giảm mạnh
   - Conversion rate thấp

TRẢ VỀ JSON:
{
  "risks": [
    {
      "alertType": "COGS_INCREASE",
      "severity": "HIGH",
      "title": "COGS tăng 17% so với tháng trước",
      "message": "COGS hiện tại: 50,000,000 (tháng trước: 42,600,000). Tăng 17% do uốn nóng dùng S1 quá tay.",
      "currentValue": 50000000,
      "previousValue": 42600000,
      "changePercent": 17.4,
      "recommendations": [
        "Kiểm soát định lượng S1: 80g -> 65g",
        "Training lại stylist về định lượng",
        "Monitor hao hụt hàng ngày"
      ]
    }
  ],
  "aiAnalysis": "Phát hiện 2 rủi ro nghiêm trọng: COGS tăng 17% và margin giảm 5%. Cần xử lý ngay."
}
`;
}

