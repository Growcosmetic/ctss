import { prisma } from "@/lib/prisma";
import { callOpenAIJSON } from "./openai";

export interface UpsellSuggestion {
  productId?: string;
  serviceId?: string;
  name: string;
  reason: string;
  confidence: number;
  estimatedValue: number;
}

/**
 * Get AI-powered upsell suggestions for a customer
 */
export async function getUpsellSuggestions(
  customerId: string
): Promise<UpsellSuggestion[]> {
  try {
    // Fetch customer data
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        posOrders: {
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            posItems: {
              include: {
                product: true,
                service: true,
              },
            },
          },
        },
        bookings: {
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            bookingServices: {
              include: {
                service: true,
              },
            },
          },
        },
      },
    });

    if (!customer) {
      throw new Error("Customer not found");
    }

    // Get all available products and services
    const [products, services] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true, stockQuantity: { gt: 0 } },
        take: 20,
      }),
      prisma.service.findMany({
        where: { isActive: true },
        include: {
          servicePrices: {
            where: { isActive: true },
            orderBy: { effectiveFrom: "desc" },
            take: 1,
          },
        },
        take: 20,
      }),
    ]);

    // Prepare customer history
    const purchaseHistory = customer.posOrders.flatMap((order) =>
      order.posItems.map((item) => ({
        type: item.productId ? "product" : "service",
        name: item.name,
        price: Number(item.price),
      }))
    );

    const bookingHistory = customer.bookings.flatMap((booking) =>
      booking.bookingServices.map((bs) => ({
        type: "service",
        name: bs.service.name,
        price: Number(bs.price),
      }))
    );

    const allHistory = [...purchaseHistory, ...bookingHistory];

    // Build prompt for OpenAI
    const prompt = `
Analyze this customer's purchase history and suggest 3-5 relevant upsell opportunities.

Customer Information:
- Name: ${customer.firstName} ${customer.lastName}
- Total Visits: ${customer.totalVisits}
- Total Spent: ${customer.totalSpent}
- Last Visit: ${customer.lastVisitDate || "Never"}

Purchase History (last 10 transactions):
${JSON.stringify(allHistory.slice(0, 10), null, 2)}

Available Products:
${products.map((p) => `- ${p.name} (${p.price}₫)`).join("\n")}

Available Services:
${services.map((s) => `- ${s.name} (${s.servicePrices[0]?.price || 0}₫)`).join("\n")}

Based on the customer's purchase patterns, suggest products or services they might be interested in.
Consider:
1. Complementary items to what they've purchased
2. Higher-value alternatives
3. Services they haven't tried yet
4. Seasonal or trending items

Return a JSON array with suggestions, each containing:
- productId or serviceId (if applicable)
- name: product/service name
- reason: why this is a good suggestion
- confidence: 0-100 score
- estimatedValue: estimated revenue if they purchase
`;

    const systemPrompt = `You are an expert sales advisor for a beauty salon. 
Analyze customer purchase patterns and suggest relevant upsell opportunities.
Always respond with valid JSON array format.`;

    const response = await callOpenAIJSON<UpsellSuggestion[]>(
      prompt,
      systemPrompt
    );

    if (response.success && response.data) {
      return response.data;
    }

    // Fallback suggestions if AI fails
    return generateFallbackSuggestions(customer, products, services);
  } catch (error: any) {
    console.error("Error getting upsell suggestions:", error);
    return [];
  }
}

function generateFallbackSuggestions(
  customer: any,
  products: any[],
  services: any[]
): UpsellSuggestion[] {
  // Simple fallback logic
  const suggestions: UpsellSuggestion[] = [];

  // Suggest popular services if customer hasn't used many
  if (customer.totalVisits < 5) {
    const popularService = services[0];
    if (popularService) {
      suggestions.push({
        serviceId: popularService.id,
        name: popularService.name,
        reason: "Dịch vụ phổ biến được nhiều khách hàng yêu thích",
        confidence: 70,
        estimatedValue: Number(popularService.servicePrices[0]?.price || 0),
      });
    }
  }

  // Suggest complementary products
  if (products.length > 0) {
    suggestions.push({
      productId: products[0].id,
      name: products[0].name,
      reason: "Sản phẩm chăm sóc tại nhà bổ sung cho dịch vụ salon",
      confidence: 60,
      estimatedValue: Number(products[0].price),
    });
  }

  return suggestions;
}

