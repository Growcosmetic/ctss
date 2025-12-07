// ============================================
// Customer360 AI Insight Engine
// ============================================

import { callOpenAI } from "@/lib/ai/openai";
import type { Customer360Payload } from "../types";

// ============================================
// 1. Generate Persona
// ============================================

export async function generatePersona(
  customer360: Omit<Customer360Payload, "insights" | "nba">
): Promise<string> {
  const { core, bookingHistory, invoiceHistory, servicePatterns, loyalty } =
    customer360;

  // Build context for AI
  const topServices = servicePatterns
    .slice(0, 5)
    .map((s) => s.serviceName)
    .join(", ");

  const totalSpent = invoiceHistory.reduce((sum, inv) => sum + inv.total, 0);
  const visitCount = bookingHistory.length;

  const prompt = `Phân tích khách hàng salon với thông tin sau:
- Tên: ${core.name}
- Giới tính: ${core.gender || "Không rõ"}
- Số lần ghé thăm: ${visitCount}
- Tổng chi tiêu: ${totalSpent.toLocaleString("vi-VN")} VND
- Dịch vụ thường dùng: ${topServices || "Chưa có"}
- Hạng thành viên: ${loyalty.tier || "Chưa có"}

Hãy viết 1 đoạn văn (3-5 câu) mô tả tính cách, sở thích về style, và thói quen sử dụng dịch vụ của khách hàng này. 
Tone: thân thiện, chuyên nghiệp, như một chuyên gia salon am hiểu về khách hàng.
Viết bằng tiếng Việt, tự nhiên, không quá formal.`;

  const systemPrompt = `Bạn là một chuyên gia phân tích khách hàng salon chuyên nghiệp. 
Bạn hiểu rõ về tâm lý khách hàng, xu hướng làm đẹp, và hành vi tiêu dùng trong ngành salon.`;

  try {
    const response = await callOpenAI(prompt, systemPrompt);
    if (response.success && response.data) {
      return response.data;
    }
  } catch (error) {
    console.error("Error generating persona:", error);
  }

  // Fallback persona
  return `${core.name} là một khách hàng ${
    visitCount > 10 ? "thân thiết" : visitCount > 5 ? "quen thuộc" : "mới"
  } của salon. ${
    topServices
      ? `Khách thường sử dụng các dịch vụ như ${topServices}.`
      : "Khách đang trong quá trình khám phá các dịch vụ của salon."
  } ${
    loyalty.tier
      ? `Với hạng thành viên ${loyalty.tier}, khách thể hiện sự gắn bó với salon.`
      : ""
  }`;
}

// ============================================
// 2. Predict Return Likelihood
// ============================================

export function predictReturnLikelihood(
  customer360: Omit<Customer360Payload, "insights" | "nba">
): number {
  const { visitFrequency, loyalty } = customer360;

  let base = 50;

  // Add points for visit frequency
  base += visitFrequency.totalVisits * 5;

  // Penalty for long intervals
  if (
    visitFrequency.avgVisitInterval !== null &&
    visitFrequency.avgVisitInterval > 45
  ) {
    base -= 10;
  }

  // Bonus for loyalty tier
  if (loyalty.tier === "GOLD" || loyalty.tier === "PLATINUM" || loyalty.tier === "DIAMOND") {
    base += 10;
  } else if (loyalty.tier === "SILVER") {
    base += 5;
  }

  // Clamp to 0-100
  return Math.max(0, Math.min(100, base));
}

// ============================================
// 3. Predict Churn Risk
// ============================================

export function predictChurnRisk(
  customer360: Omit<Customer360Payload, "insights" | "nba">
): "LOW" | "MEDIUM" | "HIGH" {
  const { visitFrequency } = customer360;
  const returnLikelihood = predictReturnLikelihood(customer360);

  // Check if last visit is overdue
  if (
    visitFrequency.lastVisit &&
    visitFrequency.avgVisitInterval !== null &&
    visitFrequency.avgVisitInterval > 0
  ) {
    const lastVisitDate = new Date(visitFrequency.lastVisit);
    const daysSinceLastVisit = Math.floor(
      (Date.now() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const threshold = visitFrequency.avgVisitInterval * 1.5;

    if (daysSinceLastVisit > threshold) {
      return "HIGH";
    }
  }

  // Check return likelihood
  if (returnLikelihood < 40) {
    return "HIGH";
  } else if (returnLikelihood < 60) {
    return "MEDIUM";
  }

  return "LOW";
}

// ============================================
// 4. Predict Next Visit Date
// ============================================

export function predictNextVisitDate(
  customer360: Omit<Customer360Payload, "insights" | "nba">
): string | null {
  return customer360.visitFrequency.nextPredictedVisit || null;
}

// ============================================
// 5. Predict Next Service
// ============================================

export function predictNextService(
  customer360: Omit<Customer360Payload, "insights" | "nba">
): string | undefined {
  const { servicePatterns } = customer360;

  if (servicePatterns.length === 0) {
    return undefined;
  }

  // Pick most frequent service
  const mostFrequent = servicePatterns.reduce((prev, current) =>
    prev.count > current.count ? prev : current
  );

  return mostFrequent.serviceName;
}

// ============================================
// 6. Predict Next Product
// ============================================

export function predictNextProduct(
  customer360: Omit<Customer360Payload, "insights" | "nba">
): string | undefined {
  const { productHistory, servicePatterns } = customer360;

  // If customer has product history, suggest replenishment
  if (productHistory.length > 0) {
    const lastProduct = productHistory[0];
    return lastProduct.name;
  }

  // If customer uses color services, suggest color care products
  const colorServices = servicePatterns.filter((s) =>
    s.serviceName.toLowerCase().includes("nhuộm") ||
    s.serviceName.toLowerCase().includes("color")
  );

  if (colorServices.length > 0) {
    return "Dầu gội dưỡng màu";
  }

  // If customer uses perm services, suggest perm care products
  const permServices = servicePatterns.filter((s) =>
    s.serviceName.toLowerCase().includes("uốn") ||
    s.serviceName.toLowerCase().includes("perm")
  );

  if (permServices.length > 0) {
    return "Sản phẩm chăm sóc tóc uốn";
  }

  return undefined;
}

// ============================================
// 7. Predict Lifetime Value
// ============================================

export function predictLifetimeValue(
  customer360: Omit<Customer360Payload, "insights" | "nba">
): number | null {
  const { invoiceHistory } = customer360;

  if (invoiceHistory.length === 0) {
    return null;
  }

  const totalSpent = invoiceHistory.reduce((sum, inv) => sum + inv.total, 0);

  // Project future value: total * 1.2
  return Math.round(totalSpent * 1.2);
}

// ============================================
// 8. Cluster Behavior
// ============================================

export function clusterBehavior(
  customer360: Omit<Customer360Payload, "insights" | "nba">
): string {
  const { invoiceHistory, servicePatterns, visitFrequency, loyalty } =
    customer360;

  const lifetimeValue = predictLifetimeValue(customer360) || 0;

  // High Loyalty Premium
  if (lifetimeValue > 5000000) {
    return "High Loyalty Premium";
  }

  // Color-Focused
  const colorServices = servicePatterns.filter((s) =>
    s.serviceName.toLowerCase().includes("nhuộm") ||
    s.serviceName.toLowerCase().includes("color") ||
    s.serviceName.toLowerCase().includes("highlight")
  );
  if (colorServices.length > 0 && colorServices[0].count >= 3) {
    return "Color-Focused";
  }

  // Perm-Focused
  const permServices = servicePatterns.filter((s) =>
    s.serviceName.toLowerCase().includes("uốn") ||
    s.serviceName.toLowerCase().includes("perm") ||
    s.serviceName.toLowerCase().includes("duỗi")
  );
  if (permServices.length > 0 && permServices[0].count >= 3) {
    return "Perm-Focused";
  }

  // Low Engagement
  if (
    visitFrequency.totalVisits < 3 ||
    (visitFrequency.avgVisitInterval !== null &&
      visitFrequency.avgVisitInterval > 60)
  ) {
    return "Low Engagement";
  }

  // Value Seeker (check for discount patterns or low average invoice)
  const avgInvoiceValue =
    invoiceHistory.length > 0
      ? invoiceHistory.reduce((sum, inv) => sum + inv.total, 0) /
        invoiceHistory.length
      : 0;
  if (avgInvoiceValue < 500000 && visitFrequency.totalVisits > 5) {
    return "Value Seeker";
  }

  // Trend Lover (frequent visits, tries different services)
  if (
    visitFrequency.totalVisits > 8 &&
    servicePatterns.length >= 4 &&
    visitFrequency.avgVisitInterval !== null &&
    visitFrequency.avgVisitInterval < 30
  ) {
    return "Trend Lover";
  }

  // Default
  return "Regular Customer";
}

// ============================================
// 9. Generate Insight Summary
// ============================================

export async function generateInsightSummary(
  customer360: Omit<Customer360Payload, "insights" | "nba">,
  persona: string,
  churnRisk: "LOW" | "MEDIUM" | "HIGH",
  nextService?: string,
  nextProduct?: string
): Promise<string> {
  const { core, visitFrequency, loyalty, servicePatterns } = customer360;

  const prompt = `Tạo một bản tóm tắt insight chuyên nghiệp (5-7 dòng) cho khách hàng salon:

Thông tin khách hàng:
- Tên: ${core.name}
- Persona: ${persona}
- Churn Risk: ${churnRisk}
- Số lần ghé thăm: ${visitFrequency.totalVisits}
- Hạng thành viên: ${loyalty.tier || "Chưa có"}
- Dịch vụ gợi ý tiếp theo: ${nextService || "Chưa có"}
- Sản phẩm gợi ý: ${nextProduct || "Chưa có"}

Yêu cầu:
- Tone: Thân thiện, tinh tế, như Mina (AI assistant của salon)
- Bao gồm: persona, risk level, gợi ý dịch vụ/sản phẩm, lời khuyên cho stylist
- Viết bằng tiếng Việt, tự nhiên, không quá formal
- 5-7 dòng, dễ đọc, có giá trị thực tế`;

  const systemPrompt = `Bạn là Mina - AI assistant thông minh và thân thiện của salon. 
Bạn có khả năng phân tích khách hàng một cách tinh tế và đưa ra những insight hữu ích cho đội ngũ salon.
Bạn viết với tone thân thiện, chuyên nghiệp, và luôn tập trung vào việc giúp salon phục vụ khách hàng tốt hơn.`;

  try {
    const response = await callOpenAI(prompt, systemPrompt);
    if (response.success && response.data) {
      return response.data;
    }
  } catch (error) {
    console.error("Error generating insight summary:", error);
  }

  // Fallback summary
  return `${core.name} là khách hàng ${
    visitFrequency.totalVisits > 10 ? "thân thiết" : "quen thuộc"
  } với mức độ rủi ro ${churnRisk.toLowerCase()}. ${
    nextService
      ? `Gợi ý dịch vụ tiếp theo: ${nextService}.`
      : ""
  } ${
    nextProduct
      ? `Nên đề xuất sản phẩm: ${nextProduct}.`
      : ""
  } Stylist nên chú ý đến sở thích và thói quen của khách để tư vấn phù hợp.`;
}

// ============================================
// Combined Function
// ============================================

export async function getCustomerInsights(
  customer360: Omit<Customer360Payload, "insights" | "nba">
) {
  // Generate all insights
  const [
    persona,
    returnLikelihood,
    churnRisk,
    predictedNextVisit,
    nextService,
    nextProduct,
    lifetimeValue,
    cluster,
  ] = await Promise.all([
    generatePersona(customer360),
    Promise.resolve(predictReturnLikelihood(customer360)),
    Promise.resolve(predictChurnRisk(customer360)),
    Promise.resolve(predictNextVisitDate(customer360)),
    Promise.resolve(predictNextService(customer360)),
    Promise.resolve(predictNextProduct(customer360)),
    Promise.resolve(predictLifetimeValue(customer360)),
    Promise.resolve(clusterBehavior(customer360)),
  ]);

  // Generate summary (needs other insights)
  const insightSummary = await generateInsightSummary(
    customer360,
    persona,
    churnRisk,
    nextService,
    nextProduct
  );

  return {
    persona,
    returnLikelihood,
    churnRisk,
    predictedNextVisit,
    nextService,
    nextProduct,
    lifetimeValue,
    cluster,
    insightSummary,
  };
}

