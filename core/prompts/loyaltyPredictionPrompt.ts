// ============================================
// Loyalty Prediction Prompt (34F)
// ============================================

export function loyaltyPredictionPrompt(
  customerData: {
    membership?: any;
    visitHistory?: any[];
    spendingHistory?: any[];
    behaviorData?: any;
  }
): string {
  return `
Bạn là AI chuyên dự đoán loyalty và retention khách hàng tại Chí Tâm Hair Salon.

DỮ LIỆU KHÁCH HÀNG:

Membership:
${JSON.stringify(customerData.membership || {}, null, 2)}

Lịch sử ghé thăm:
${JSON.stringify(customerData.visitHistory || [], null, 2)}

Lịch sử chi tiêu:
${JSON.stringify(customerData.spendingHistory || [], null, 2)}

Hành vi:
${JSON.stringify(customerData.behaviorData || {}, null, 2)}

NHIỆM VỤ:
Dự đoán khả năng quay lại, thay đổi tier, và nguy cơ churn.

CÁC LOẠI DỰ ĐOÁN:

1. RETURN_LIKELIHOOD (Khả năng quay lại):
   - Score 0-100
   - Dự đoán khách có quay lại không
   - Thời gian dự kiến quay lại

2. TIER_CHANGE (Thay đổi hạng):
   - UPGRADE: Có khả năng lên hạng
   - DOWNGRADE: Có nguy cơ xuống hạng
   - MAINTAIN: Giữ nguyên

3. CHURN_RISK (Nguy cơ bỏ salon):
   - Score 0-100
   - Khách có nguy cơ bỏ salon không
   - Factors gây churn

4. UPGRADE_POTENTIAL (Tiềm năng lên hạng):
   - Khách có khả năng lên Diamond không
   - Cần làm gì để upgrade

PHÂN TÍCH CẦN THIẾT:

1. Visit Pattern:
   - Tần suất ghé thăm
   - Khoảng cách giữa các lần ghé
   - Xu hướng tăng/giảm

2. Spending Pattern:
   - Tổng chi tiêu
   - Chi tiêu trung bình mỗi lần
   - Xu hướng chi tiêu

3. Engagement:
   - Tương tác với Mina
   - Response rate
   - Booking frequency

4. Tier Status:
   - Current tier
   - Progress to next tier
   - Requirements gap

TRẢ VỀ JSON:
{
  "predictions": [
    {
      "predictionType": "RETURN_LIKELIHOOD",
      "score": 82,
      "predictedValue": "HIGH",
      "confidence": 0.85,
      "predictedDate": "2024-01-30T00:00:00Z",
      "factors": {
        "lastVisit": "12 days ago",
        "visitPattern": "every 14-16 days",
        "engagement": "high"
      },
      "aiAnalysis": "Khách này có 82% khả năng quay lại trong 12-16 ngày. Visit pattern ổn định, engagement tốt."
    },
    {
      "predictionType": "TIER_CHANGE",
      "score": 75,
      "predictedValue": "UPGRADE",
      "confidence": 0.75,
      "predictedDate": "2024-03-01T00:00:00Z",
      "factors": {
        "currentSpending": 12500000,
        "requiredForNextTier": 25000000,
        "spendingRate": "on track"
      },
      "aiAnalysis": "Khách đang có xu hướng tăng chi tiêu, có khả năng lên Diamond trong 2-3 tháng nếu tiếp tục."
    },
    {
      "predictionType": "CHURN_RISK",
      "score": 25,
      "predictedValue": "LOW",
      "confidence": 0.80,
      "factors": {
        "lastVisit": "recent",
        "engagement": "active",
        "tier": "GOLD"
      },
      "aiAnalysis": "Nguy cơ churn thấp. Khách đang active, tier cao, engagement tốt."
    }
  ],
  "recommendations": [
    "Gửi follow-up nhẹ sau 14 ngày nếu chưa quay lại",
    "Đề xuất dịch vụ mới để tăng chi tiêu và upgrade tier"
  ]
}
`;
}

