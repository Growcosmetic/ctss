// ============================================
// Customer360 Next Best Action (NBA) Engine
// ============================================

import type {
  Customer360Payload,
  CustomerAIInsights,
  CustomerNBAAction,
} from "../types";

// ============================================
// Get Next Best Actions
// ============================================

export async function getNBA(
  customer360: Omit<Customer360Payload, "insights" | "nba">,
  insights: CustomerAIInsights
): Promise<CustomerNBAAction> {
  const { core, loyalty, visitFrequency, servicePatterns, complaints } =
    customer360;

  // ============================================
  // PRIORITY DECISION
  // ============================================

  let priorityLevel: "LOW" | "MEDIUM" | "HIGH" = "MEDIUM";

  if (insights.churnRisk === "HIGH") {
    priorityLevel = "HIGH";
  } else if (insights.returnLikelihood > 80 && insights.churnRisk === "LOW") {
    priorityLevel = "LOW";
  }

  // ============================================
  // STYLIST ADVICE
  // ============================================

  const stylistAdvice = buildStylistAdvice(
    insights,
    servicePatterns,
    loyalty,
    complaints
  );

  // ============================================
  // RECEPTIONIST ADVICE
  // ============================================

  const receptionistAdvice = buildReceptionistAdvice(
    insights,
    visitFrequency,
    core,
    priorityLevel
  );

  // ============================================
  // MARKETING ADVICE
  // ============================================

  const marketingAdvice = buildMarketingAdvice(
    insights,
    loyalty,
    visitFrequency,
    priorityLevel
  );

  // ============================================
  // MANAGER ADVICE
  // ============================================

  const managerAdvice = buildManagerAdvice(
    insights,
    customer360,
    complaints,
    priorityLevel
  );

  return {
    stylistAdvice,
    receptionistAdvice,
    marketingAdvice,
    managerAdvice,
    priorityLevel,
  };
}

// ============================================
// Helper Functions
// ============================================

function buildStylistAdvice(
  insights: CustomerAIInsights,
  servicePatterns: Array<{ serviceName: string; count: number }>,
  loyalty: { tier?: string },
  complaints: string[]
): string {
  let advice = `Khách thuộc nhóm ${insights.cluster}.\n\n`;

  // Service recommendation
  if (insights.nextService) {
    advice += `Gợi ý dịch vụ tiếp theo: ${insights.nextService}.\n`;
  } else if (servicePatterns.length > 0) {
    const topService = servicePatterns[0];
    advice += `Dịch vụ thường dùng nhất: ${topService.serviceName} (${topService.count} lần).\n`;
  } else {
    advice += `Chưa có dịch vụ cụ thể được gợi ý.\n`;
  }

  // Persona insights
  advice += `\nLưu ý về tóc và sở thích: ${insights.persona}\n`;

  // Product recommendation
  if (insights.nextProduct) {
    advice += `\nSản phẩm nên đề xuất: ${insights.nextProduct}.\n`;
  }

  // Loyalty tier context
  if (loyalty.tier) {
    advice += `\nKhách là thành viên hạng ${loyalty.tier} - cần chăm sóc đặc biệt.\n`;
  }

  // Complaints warning
  if (complaints.length > 0) {
    advice += `\n⚠️ CẢNH BÁO: Khách có ${complaints.length} phàn nàn trong lịch sử. Cần xử lý cẩn thận và đảm bảo chất lượng dịch vụ.\n`;
  }

  // Churn risk warning
  if (insights.churnRisk === "HIGH") {
    advice += `\n⚠️ RỦI RO CAO: Khách có nguy cơ rời bỏ. Cần tư vấn tận tình và tạo trải nghiệm xuất sắc.\n`;
  }

  return advice.trim();
}

function buildReceptionistAdvice(
  insights: CustomerAIInsights,
  visitFrequency: { totalVisits: number; lastVisit?: string | null },
  core: { name: string; phone: string },
  priorityLevel: "LOW" | "MEDIUM" | "HIGH"
): string {
  let advice = `Khách hàng: ${core.name} (${core.phone})\n\n`;

  // Return likelihood
  advice += `Khả năng quay lại: ${insights.returnLikelihood}%.\n`;

  // Predicted next visit
  if (insights.predictedNextVisit) {
    const nextVisitDate = new Date(insights.predictedNextVisit);
    const formattedDate = nextVisitDate.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    advice += `Dự đoán ngày đến tiếp theo: ${formattedDate}.\n`;
  } else {
    advice += `Dự đoán ngày đến tiếp theo: Chưa có thông tin.\n`;
  }

  // Visit history
  advice += `Tổng số lần ghé thăm: ${visitFrequency.totalVisits}.\n`;

  // Last visit
  if (visitFrequency.lastVisit) {
    const lastVisitDate = new Date(visitFrequency.lastVisit);
    const daysSince = Math.floor(
      (Date.now() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    advice += `Lần ghé thăm gần nhất: ${daysSince} ngày trước.\n`;
  }

  // Priority actions
  advice += `\nMức độ ưu tiên: ${priorityLevel}.\n\n`;

  if (insights.churnRisk === "HIGH") {
    advice += `⚠️ HÀNH ĐỘNG: Khách có rủi ro rời bỏ cao. Ưu tiên follow-up nhẹ nhàng qua điện thoại hoặc tin nhắn.\n`;
    advice += `- Gợi ý: Gửi tin nhắn hỏi thăm sức khỏe và mời quay lại salon.\n`;
    advice += `- Có thể áp dụng ưu đãi comeback 5-10% nếu phù hợp.\n`;
  } else if (insights.returnLikelihood > 70) {
    advice += `✅ Khách có khả năng quay lại cao. Duy trì liên lạc thường xuyên và nhắc nhở đặt lịch trước.\n`;
  } else {
    advice += `📋 Khách ở mức trung bình. Theo dõi và chăm sóc định kỳ.\n`;
  }

  return advice.trim();
}

function buildMarketingAdvice(
  insights: CustomerAIInsights,
  loyalty: { tier?: string; progressPercent?: number },
  visitFrequency: { totalVisits: number },
  priorityLevel: "LOW" | "MEDIUM" | "HIGH"
): string {
  let advice = `Segment khách hàng: ${insights.cluster}.\n\n`;

  // Product recommendation
  if (insights.nextProduct) {
    advice += `Sản phẩm phù hợp để đề xuất: ${insights.nextProduct}.\n`;
  } else {
    advice += `Sản phẩm gợi ý: Chưa có thông tin cụ thể.\n`;
  }

  // Service recommendation
  if (insights.nextService) {
    advice += `Dịch vụ nên quảng bá: ${insights.nextService}.\n`;
  }

  // Churn risk actions
  if (insights.churnRisk === "HIGH") {
    advice += `\n⚠️ CHIẾN LƯỢC COMEBACK:\n`;
    advice += `- Gửi ưu đãi comeback 5-10% cho lần ghé thăm tiếp theo.\n`;
    advice += `- Tạo campaign "Nhớ bạn" với thông điệp cá nhân hóa.\n`;
    advice += `- Ưu tiên kênh SMS hoặc Zalo để liên hệ trực tiếp.\n`;
  } else if (loyalty.tier && loyalty.tier !== "DIAMOND") {
    // Loyalty upgrade campaign
    advice += `\n📈 CHIẾN LƯỢC NÂNG HẠNG:\n`;
    if (loyalty.progressPercent !== undefined) {
      advice += `- Khách đã đạt ${loyalty.progressPercent.toFixed(0)}% tiến độ lên hạng tiếp theo.\n`;
    }
    advice += `- Tạo ưu đãi đặc biệt để khuyến khích nâng hạng thành viên.\n`;
    advice += `- Gửi thông báo về quyền lợi hạng cao hơn.\n`;
  } else if (insights.returnLikelihood > 80) {
    // High-value customer retention
    advice += `\n💎 CHIẾN LƯỢC GIỮ CHÂN KHÁCH VIP:\n`;
    advice += `- Khách có giá trị cao và trung thành. Tạo chương trình ưu đãi đặc biệt.\n`;
    advice += `- Gửi quà tặng sinh nhật hoặc kỷ niệm.\n`;
    advice += `- Mời tham gia sự kiện đặc biệt của salon.\n`;
  }

  // Visit frequency context
  if (visitFrequency.totalVisits > 10) {
    advice += `\n- Khách đã ghé thăm ${visitFrequency.totalVisits} lần - khách hàng thân thiết.\n`;
  }

  return advice.trim();
}

function buildManagerAdvice(
  insights: CustomerAIInsights,
  customer360: Omit<Customer360Payload, "insights" | "nba">,
  complaints: string[],
  priorityLevel: "LOW" | "MEDIUM" | "HIGH"
): string {
  let advice = `Tổng quan khách hàng:\n\n`;

  // Lifetime value
  if (insights.lifetimeValue) {
    const formattedValue = insights.lifetimeValue.toLocaleString("vi-VN");
    advice += `Lifetime value dự đoán: ${formattedValue} VND.\n`;
  } else {
    advice += `Lifetime value: Chưa có dữ liệu đủ để dự đoán.\n`;
  }

  // Cluster
  advice += `Khách thuộc nhóm: ${insights.cluster}.\n`;

  // Churn risk
  advice += `Mức độ rủi ro: ${insights.churnRisk}.\n`;

  // Priority level
  advice += `Mức độ ưu tiên: ${priorityLevel}.\n\n`;

  // Stylist assignment
  if (insights.lifetimeValue && insights.lifetimeValue > 3000000) {
    advice += `💼 PHÂN CÔNG STYLIST:\n`;
    advice += `- Khách có giá trị cao. Nên được gán cho stylist mạnh và có kinh nghiệm.\n`;
    advice += `- Đảm bảo stylist hiểu rõ sở thích và lịch sử của khách.\n`;
  } else if (insights.churnRisk === "HIGH") {
    advice += `💼 PHÂN CÔNG STYLIST:\n`;
    advice += `- Khách có rủi ro rời bỏ. Cần stylist có kỹ năng tư vấn tốt và khả năng giữ chân khách.\n`;
  }

  // Complaints handling
  if (complaints.length > 0) {
    advice += `\n⚠️ XỬ LÝ PHÀN NÀN:\n`;
    advice += `- Khách có ${complaints.length} phàn nàn trong lịch sử.\n`;
    advice += `- Cần kiểm tra chi tiết và đảm bảo không lặp lại vấn đề.\n`;
    advice += `- Cân nhắc bồi thường hoặc ưu đãi đặc biệt nếu cần.\n`;
  }

  // Branch performance
  const branchCount = Object.keys(customer360.branchVisits).length;
  if (branchCount > 1) {
    advice += `\n📍 ĐA CHI NHÁNH:\n`;
    advice += `- Khách đã ghé thăm ${branchCount} chi nhánh khác nhau.\n`;
    advice += `- Đảm bảo chất lượng dịch vụ đồng nhất giữa các chi nhánh.\n`;
  }

  // Action items
  advice += `\n📋 HÀNH ĐỘNG ĐỀ XUẤT:\n`;
  if (priorityLevel === "HIGH") {
    advice += `- Ưu tiên xử lý ngay lập tức.\n`;
    advice += `- Giao cho nhân viên có kinh nghiệm nhất.\n`;
    advice += `- Theo dõi sát sao trải nghiệm của khách.\n`;
  } else if (priorityLevel === "MEDIUM") {
    advice += `- Theo dõi định kỳ.\n`;
    advice += `- Đảm bảo chất lượng dịch vụ tốt.\n`;
  } else {
    advice += `- Duy trì mối quan hệ tốt.\n`;
    advice += `- Tìm cơ hội upsell và cross-sell.\n`;
  }

  return advice.trim();
}

