// ============================================
// Mina Brain - Orchestrator
// ============================================

import { prisma } from "@/lib/prisma";
import {
  generateCustomerSummary,
  suggestServices,
  detectChurnRisk,
  getPOSUpsellSuggestions,
  predictReturnDate,
} from "@/features/mina/services/minaEngine";
import { getLoyaltySummaryForMina } from "@/features/mina/services/minaBrain-loyalty";
import { CTSSRole } from "@/features/auth/types";
import { getMinaSystemPrompt } from "./minaPersonality";
import { getCustomer360API } from "@/features/customer360/services/customer360Api";

export interface MinaBrainContext {
  userRole: CTSSRole;
  userId: string;
  customerId?: string;
  bookingId?: string;
  invoiceId?: string;
  stylistId?: string;
}

export interface IntentDetection {
  intent: string;
  confidence: number;
  entities?: {
    customerName?: string;
    customerPhone?: string;
    serviceName?: string;
    stylistName?: string;
    date?: string;
  };
}

/**
 * Detect user intent from message
 */
export function detectIntent(message: string): IntentDetection {
  const lowerMessage = message.toLowerCase();

  // Customer lookup / analysis / recommendations
  if (
    lowerMessage.includes("khách") ||
    lowerMessage.includes("customer") ||
    lowerMessage.includes("hồ sơ") ||
    lowerMessage.includes("thông tin khách") ||
    lowerMessage.includes("phân tích khách") ||
    lowerMessage.includes("khách này cần làm gì") ||
    lowerMessage.includes("recommend chăm sóc") ||
    lowerMessage.includes("gợi ý cho khách")
  ) {
    return {
      intent: "customer_lookup",
      confidence: 0.9,
    };
  }

  // Booking schedule
  if (
    lowerMessage.includes("lịch") ||
    lowerMessage.includes("schedule") ||
    lowerMessage.includes("booking") ||
    lowerMessage.includes("hẹn") ||
    lowerMessage.includes("stylist")
  ) {
    return {
      intent: "booking_schedule",
      confidence: 0.8,
    };
  }

  // Service suggestion
  if (
    lowerMessage.includes("gợi ý") ||
    lowerMessage.includes("suggest") ||
    lowerMessage.includes("nên làm") ||
    lowerMessage.includes("upsell")
  ) {
    return {
      intent: "service_suggestion",
      confidence: 0.8,
    };
  }

  // Return prediction
  if (
    lowerMessage.includes("quay lại") ||
    lowerMessage.includes("return") ||
    lowerMessage.includes("dự đoán") ||
    lowerMessage.includes("khi nào")
  ) {
    return {
      intent: "return_prediction",
      confidence: 0.8,
    };
  }

  // Invoice lookup
  if (
    lowerMessage.includes("hóa đơn") ||
    lowerMessage.includes("invoice") ||
    lowerMessage.includes("bill") ||
    lowerMessage.includes("thanh toán")
  ) {
    return {
      intent: "invoice_lookup",
      confidence: 0.8,
    };
  }

  // Churn risk
  if (
    lowerMessage.includes("phàn nàn") ||
    lowerMessage.includes("complaint") ||
    lowerMessage.includes("rủi ro") ||
    lowerMessage.includes("churn")
  ) {
    return {
      intent: "churn_risk",
      confidence: 0.8,
    };
  }

  // Price inquiry
  if (
    lowerMessage.includes("giá") ||
    lowerMessage.includes("price") ||
    lowerMessage.includes("bao nhiêu") ||
    lowerMessage.includes("chi phí")
  ) {
    return {
      intent: "price_inquiry",
      confidence: 0.9,
    };
  }

  // General query
  return {
    intent: "general",
    confidence: 0.5,
  };
}

/**
 * Extract customer name/phone from message
 */
export async function extractCustomerInfo(
  message: string
): Promise<{ customerId?: string; customerName?: string; customerPhone?: string }> {
  // Try to find phone number (Vietnamese format)
  const phoneRegex = /(0[3|5|7|8|9])+([0-9]{8})\b/g;
  const phoneMatch = message.match(phoneRegex);
  
  if (phoneMatch) {
    const phone = phoneMatch[0];
    const customer = await prisma.customer.findUnique({
      where: { phone },
    });
    if (customer) {
      return {
        customerId: customer.id,
        customerPhone: phone,
        customerName: `${customer.firstName} ${customer.lastName}`,
      };
    }
  }

  // Try to find customer name (simple pattern)
  const namePatterns = [
    /(?:khách|chị|anh|em)\s+([A-ZÀ-Ỹ][a-zà-ỹ]+(?:\s+[A-ZÀ-Ỹ][a-zà-ỹ]+)*)/,
    /([A-ZÀ-Ỹ][a-zà-ỹ]+(?:\s+[A-ZÀ-Ỹ][a-zà-ỹ]+)+)/,
  ];

  for (const pattern of namePatterns) {
    const match = message.match(pattern);
    if (match) {
      const name = match[1];
      // Search in database
      const customers = await prisma.customer.findMany({
        where: {
          OR: [
            { firstName: { contains: name.split(" ")[0], mode: "insensitive" } },
            { lastName: { contains: name.split(" ")[name.split(" ").length - 1], mode: "insensitive" } },
          ],
        },
        take: 1,
      });
      if (customers.length > 0) {
        return {
          customerId: customers[0].id,
          customerName: `${customers[0].firstName} ${customers[0].lastName}`,
          customerPhone: customers[0].phone,
        };
      }
    }
  }

  return {};
}

/**
 * Get relevant context data based on intent
 */
export async function getContextData(
  intent: IntentDetection,
  context: MinaBrainContext
): Promise<string> {
  let contextData = "";

  try {
    switch (intent.intent) {
      case "customer_lookup":
        if (context.customerId) {
          // Use Customer360 for comprehensive customer data
          try {
            const c360 = await getCustomer360API(context.customerId);
            contextData = `THÔNG TIN KHÁCH HÀNG 360°:\n`;
            contextData += `CORE: ${JSON.stringify(c360.customer360.core, null, 2)}\n`;
            contextData += `INSIGHTS: ${JSON.stringify(c360.insights, null, 2)}\n`;
            contextData += `NBA: ${JSON.stringify(c360.nba, null, 2)}\n`;
          } catch (error) {
            // Fallback to old method
            console.error("Error getting Customer360, falling back:", error);
            const summary = await generateCustomerSummary(context.customerId);
            if (summary) {
              contextData = `THÔNG TIN KHÁCH HÀNG:\n${JSON.stringify(summary, null, 2)}\n`;
            }
            // Add loyalty info
            try {
              const loyaltyInfo = await getLoyaltySummaryForMina(context.customerId);
              contextData += `\nTHÔNG TIN THÀNH VIÊN:\n${loyaltyInfo}\n`;
            } catch (err) {
              console.error("Error getting loyalty info:", err);
            }
          }
        }
        break;

      case "return_prediction":
        if (context.customerId) {
          const prediction = await predictReturnDate(context.customerId);
          if (prediction) {
            contextData = `DỰ ĐOÁN QUAY LẠI:\n${JSON.stringify(prediction, null, 2)}\n`;
          }
        }
        break;

      case "service_suggestion":
        if (context.customerId) {
          // Use Customer360 for comprehensive service suggestions
          try {
            const c360 = await getCustomer360API(context.customerId);
            contextData = `GỢI Ý DỊCH VỤ TỪ CUSTOMER 360°:\n`;
            contextData += `Next Service: ${c360.insights.nextService || "Chưa có"}\n`;
            contextData += `Next Product: ${c360.insights.nextProduct || "Chưa có"}\n`;
            contextData += `Return Likelihood: ${c360.insights.returnLikelihood}%\n`;
            contextData += `Service Patterns: ${JSON.stringify(c360.customer360.servicePatterns, null, 2)}\n`;
            contextData += `NBA Stylist Advice: ${c360.nba.stylistAdvice}\n`;
            contextData += `NBA Marketing Advice: ${c360.nba.marketingAdvice}\n`;
          } catch (error) {
            // Fallback to old method
            console.error("Error getting Customer360, falling back:", error);
            const suggestions = await suggestServices(context.customerId);
            if (suggestions.length > 0) {
              contextData = `GỢI Ý DỊCH VỤ:\n${JSON.stringify(suggestions, null, 2)}\n`;
            }
          }
        }
        break;

      case "churn_risk":
        if (context.customerId) {
          const risk = await detectChurnRisk(context.customerId);
          contextData = `RỦI RO KHÁCH HÀNG:\n${JSON.stringify(risk, null, 2)}\n`;
        }
        break;

      case "booking_schedule":
        if (context.stylistId) {
          const today = new Date();
          const bookings = await prisma.booking.findMany({
            where: {
              stylistId: context.stylistId,
              date: {
                gte: today.toISOString().split("T")[0],
              },
            },
            include: {
              customer: true,
              bookingServices: {
                include: {
                  service: true,
                },
              },
            },
            take: 10,
          });
          contextData = `LỊCH HẸN:\n${JSON.stringify(bookings.map(b => ({
            time: b.startTime,
            customer: `${b.customer.firstName} ${b.customer.lastName}`,
            services: b.bookingServices.map(bs => bs.service.name),
          })), null, 2)}\n`;
        }
        break;

      case "invoice_lookup":
        if (context.customerId) {
          const invoices = await prisma.invoice.findMany({
            where: {
              customerId: context.customerId,
            },
            include: {
              invoiceItems: {
                include: {
                  service: true,
                  product: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
            take: 5,
          });
          contextData = `HÓA ĐƠN GẦN ĐÂY:\n${JSON.stringify(invoices.map(inv => ({
            date: inv.createdAt,
            total: inv.total,
            items: inv.invoiceItems.map(item => ({
              name: item.service?.name || item.product?.name,
              quantity: item.quantity,
              price: item.unitPrice,
            })),
          })), null, 2)}\n`;
        }
        break;
    }
  } catch (error) {
    console.error("Error getting context data:", error);
  }

  return contextData;
}

/**
 * Build full prompt for AI
 */
export async function buildAIPrompt(
  userMessage: string,
  context: MinaBrainContext,
  conversationHistory: Array<{ role: string; content: string }> = []
): Promise<string> {
  const systemPrompt = getMinaSystemPrompt(context.userRole);
  const intent = detectIntent(userMessage);
  const customerInfo = await extractCustomerInfo(userMessage);
  const contextData = await getContextData(intent, {
    ...context,
    customerId: customerInfo.customerId || context.customerId,
  });

  // Build conversation history
  const historyText = conversationHistory
    .slice(-5) // Last 5 messages
    .map((msg) => `${msg.role === "user" ? "Khách hàng" : "Mina"}: ${msg.content}`)
    .join("\n");

  return `${systemPrompt}

${contextData ? `DỮ LIỆU LIÊN QUAN:\n${contextData}\n` : ""}

${historyText ? `LỊCH SỬ HỘI THOẠI:\n${historyText}\n` : ""}

CÂU HỎI HIỆN TẠI: ${userMessage}

Hãy trả lời một cách tự nhiên, thân thiện, và chuyên nghiệp. Nếu có dữ liệu liên quan ở trên, hãy sử dụng nó để trả lời chính xác.`;
}

