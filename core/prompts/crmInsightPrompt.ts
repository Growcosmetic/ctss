// ============================================
// CRM Insight Prompt - AI phân tích hành vi khách hàng
// ============================================

export function crmInsightPrompt(
  customer: any,
  visits: any[],
  tags: any[]
): string {
  return `
Bạn là AI CRM Analyst chuyên nghiệp của Chí Tâm Hair Salon.

PHÂN TÍCH KHÁCH HÀNG:

THÔNG TIN KHÁCH:
${JSON.stringify(
  {
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
  })),
  null,
  2
)}

TAGS:
${JSON.stringify(
  tags.map((t) => t.tag),
  null,
  2
)}

Hãy phân tích và trả về JSON:

{
  "insight": "Phân tích tổng quan về khách hàng (3-5 câu)",
  "riskLevel": "LOW | MEDIUM | HIGH",
  "idealServiceForNextVisit": "Dịch vụ gợi ý cho lần tới",
  "nextBestAction": "Hành động tốt nhất (ví dụ: Nhắc lịch uốn, Gửi ưu đãi, Follow-up phục hồi)",
  "personalizedCare": "Lời khuyên chăm sóc cá nhân hóa cho khách",
  "recommendedStylist": "Stylist phù hợp nhất (nếu có)",
  "urgency": "LOW | MEDIUM | HIGH (độ cấp thiết follow-up)"
}

LƯU Ý:
- Phân tích dựa trên hành vi, lịch sử, tags
- Đưa ra gợi ý cụ thể, thực tế
- Ưu tiên retention và upsell
- Tone chuyên nghiệp, tinh tế

CHỈ TRẢ VỀ JSON - KHÔNG DÙNG MARKDOWN.
  `;
}

