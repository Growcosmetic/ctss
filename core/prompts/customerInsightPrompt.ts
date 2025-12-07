// ============================================
// Customer Insight Prompt - AI Super Prompt
// ============================================

export function customerInsightPrompt(
  customer: any,
  visits: any[],
  tags: any[]
): string {
  return `
Bạn là AI CRM Analyst chuyên nghiệp của Chí Tâm Hair Salon.

PHÂN TÍCH TOÀN BỘ DỮ LIỆU KHÁCH HÀNG:

THÔNG TIN KHÁCH:
${JSON.stringify(
  {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    totalVisits: customer.totalVisits,
    totalSpent: customer.totalSpent,
    riskLevel: customer.riskLevel,
    preferredStylist: customer.preferredStylist,
    createdAt: customer.createdAt,
  },
  null,
  2
)}

LỊCH SỬ DỊCH VỤ (${visits.length} lần):
${JSON.stringify(
  visits.slice(0, 10).map((v) => ({
    date: v.date,
    service: v.service,
    stylist: v.stylist,
    rating: v.rating,
    totalCharge: v.totalCharge,
    technical: v.technical ? "Có dữ liệu kỹ thuật" : null,
  })),
  null,
  2
)}

TAGS:
${JSON.stringify(
  tags.map((t: any) => t.tag),
  null,
  2
)}

Hãy phân tích và trả về JSON đúng format sau:

{
  "churnRisk": "HIGH | MEDIUM | LOW",
  "revisitWindow": "3-5 tuần | 6-8 tuần | 2-3 tháng | Không chắc",
  "nextService": "Dịch vụ gợi ý tiếp theo (ví dụ: Uốn nhẹ Hàn Quốc, Nhuộm dặm chân, Phục hồi treatment)",
  "promotion": "Ưu đãi phù hợp (ví dụ: Giảm 10% treatment 20', Ưu đãi comeback 15%, Combo uốn+nhuộm)",
  "summary": "Tóm tắt khách hàng (3-5 câu về sở thích, hành vi, tính cách, mức độ trung thành)",
  "actionSteps": [
    {"action": "Hành động cụ thể", "priority": "HIGH | MEDIUM | LOW"},
    {"action": "Hành động cụ thể", "priority": "HIGH | MEDIUM | LOW"}
  ],
  "predictions": {
    "ltv": "Giá trị vòng đời dự đoán (ví dụ: 15,000,000 VND)",
    "nextPurchase": "Sản phẩm/dịch vụ có khả năng mua tiếp theo",
    "serviceInterest": "Mức độ quan tâm dịch vụ (HIGH | MEDIUM | LOW)",
    "productUpsell": "Sản phẩm có thể upsell (ví dụ: Treatment phục hồi, Serum dưỡng)",
    "bestContactTime": "Thời điểm tốt nhất để liên hệ (ví dụ: Buổi tối 18-20h, Cuối tuần)",
    "emotionalState": "Trạng thái cảm xúc (SATISFIED | NEUTRAL | DISSATISFIED)"
  }
}

QUY TẮC PHÂN TÍCH:

1. CHURN RISK:
   - HIGH: Khách lâu không quay lại (>90 ngày) + có tag "Lost" hoặc "Overdue"
   - MEDIUM: Khách có dấu hiệu giảm tần suất hoặc có complaint
   - LOW: Khách thường xuyên quay lại, không có dấu hiệu bất thường

2. REVISIT WINDOW:
   - Dựa trên chu kỳ lịch sử: Tính trung bình khoảng cách giữa các lần đến
   - Nếu khách "Hay uốn" → 6-8 tuần
   - Nếu khách "Hay nhuộm" → 4-6 tuần
   - Nếu không có pattern rõ → "Không chắc"

3. NEXT SERVICE:
   - Dựa trên lịch sử: Khách hay làm gì?
   - Dựa trên timeline: Đã bao lâu từ lần cuối?
   - Dựa trên tag: "Hay uốn" → gợi ý chỉnh nếp, "Hay nhuộm" → gợi ý dặm chân
   - Dựa trên technical: Nếu có "Risky Hair" → ưu tiên phục hồi

4. PROMOTION:
   - VIP/High Value: Ưu đãi nhẹ (5-10%)
   - Overdue/Lost: Ưu đãi mạnh (15-20%) để comeback
   - Risky Hair: Ưu đãi treatment phục hồi
   - Hay nhuộm: Ưu đãi dặm chân màu

5. SUMMARY:
   - Mô tả sở thích, hành vi tiêu dùng, tính cách
   - Mức độ trung thành
   - Rủi ro kỹ thuật (nếu có)
   - Mối quan hệ với stylist (nếu có preferred stylist)

6. ACTION STEPS:
   - Cụ thể, có thể thực hiện ngay
   - Priority dựa trên churnRisk và cơ hội
   - Ví dụ: "Gửi ưu đãi comeback 15% trong 48h", "Nhắc lịch quay lại sau 6 tuần", "Follow-up hỏi tình trạng tóc"

7. PREDICTIONS:
   - LTV: Dựa trên totalSpent và tần suất quay lại
   - nextPurchase: Dựa trên pattern lịch sử
   - serviceInterest: Dựa trên hành vi và tag
   - productUpsell: Gợi ý sản phẩm phù hợp
   - bestContactTime: Dựa trên lịch sử tương tác (nếu có) hoặc mặc định
   - emotionalState: Dựa trên rating và complaint history

LƯU Ý QUAN TRỌNG:
- Không được nói lan man
- Không được để trống trường nào
- Nội dung phải ngắn, rõ, áp dụng được ngay
- Dựa mạnh vào chu kỳ uốn/nhuộm của khách
- Dựa mạnh vào Timeline và Tag
- Tone chuyên nghiệp, tinh tế

CHỈ TRẢ VỀ JSON - KHÔNG DÙNG MARKDOWN - KHÔNG GIẢI THÍCH THÊM.
  `;
}
