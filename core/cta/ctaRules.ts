// ============================================
// CTA Rules Engine
// Rule-based CTA recommendations by segment
// ============================================

export interface CTARule {
  id: string;
  segment: string;
  cta: string;
  description?: string;
}

export const ctaRules: CTARule[] = [
  {
    id: "hot_booking",
    segment: "recent_uon",
    cta: "Nếu chị muốn em giữ slot đẹp trong tuần thì nhắn em nha ❤️",
    description: "CTA cho khách mới uốn - focus booking",
  },
  {
    id: "care_followup",
    segment: "recent_nhuom",
    cta: "Nếu chị cần em xem lại tone hay chăm thêm cho bóng mượt thì nhắn em nha ✨",
    description: "CTA cho khách mới nhuộm - focus care",
  },
  {
    id: "return_offer",
    segment: "not_return_60",
    cta: "Tuần này salon còn vài slot đẹp, em giữ cho chị luôn cho tiện nha 💛",
    description: "CTA cho khách lâu không quay lại - win-back",
  },
  {
    id: "vip_personal",
    segment: "vip",
    cta: "Chị muốn em ưu tiên lịch riêng cho chị không ạ? Em giữ ngay cho chị ♥️",
    description: "CTA cho khách VIP - exclusive treatment",
  },
  {
    id: "risk_soft",
    segment: "high_risk",
    cta: "Nếu tóc chị có gì chưa ổn, cứ nhắn em xem lại ngay ạ 🥰",
    description: "CTA cho khách rủi ro - soft approach",
  },
  {
    id: "general_inquiry",
    segment: "all",
    cta: "Nếu chị có câu hỏi gì, cứ nhắn em để em hỗ trợ nha 💕",
    description: "CTA mặc định cho tất cả khách",
  },
];

// ============================================
// Get CTA Rule by Segment
// ============================================

export function getCTARule(segment: string): CTARule | null {
  return ctaRules.find((rule) => rule.segment === segment) || null;
}

// ============================================
// Get All CTAs for Segment
// ============================================

export function getCTAsForSegment(segment: string): CTARule[] {
  const specific = ctaRules.filter((rule) => rule.segment === segment);
  const general = ctaRules.find((rule) => rule.segment === "all");

  if (specific.length > 0) {
    return general ? [...specific, general] : specific;
  }

  return general ? [general] : [];
}

