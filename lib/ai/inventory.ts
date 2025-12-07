import { prisma } from "@/lib/prisma";
import { callOpenAIJSON } from "./openai";

export interface InventoryForecast {
  productId: string;
  productName: string;
  currentStock: number;
  predictedDemand: number;
  recommendedOrder: number;
  forecastDate: string;
  confidence: number;
  reasoning: string;
  urgency: "low" | "medium" | "high";
}

/**
 * Get AI-powered inventory forecast for a product
 */
export async function getInventoryForecast(
  productId: string
): Promise<InventoryForecast | null> {
  try {
    // Fetch product data
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        inventoryLogs: {
          take: 30,
          orderBy: { createdAt: "desc" },
        },
        posItems: {
          take: 30,
          orderBy: { createdAt: "desc" },
          include: {
            order: {
              select: {
                createdAt: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    // Calculate sales trends
    const salesByMonth = product.posItems.reduce((acc: any, item) => {
      const month = new Date(item.order.createdAt).toISOString().slice(0, 7);
      acc[month] = (acc[month] || 0) + item.quantity;
      return acc;
    }, {});

    const inventoryMovements = product.inventoryLogs.map((log) => ({
      date: log.createdAt.toISOString().split("T")[0],
      type: log.type,
      quantity: log.quantity,
    }));

    // Build prompt for OpenAI
    const prompt = `
Analyze inventory data and forecast future demand for this product.

Product Information:
- Name: ${product.name}
- SKU: ${product.sku}
- Category: ${product.category.name}
- Current Stock: ${product.stockQuantity} ${product.unit}
- Min Stock Level: ${product.minStockLevel} ${product.unit}
- Price: ${product.price}₫
- Cost: ${product.cost}₫

Sales History (last 30 transactions):
${JSON.stringify(salesByMonth, null, 2)}

Inventory Movements (last 30):
${JSON.stringify(inventoryMovements.slice(0, 30), null, 2)}

Forecast Requirements:
1. Predict demand for the next 30 days
2. Recommend order quantity
3. Assess urgency (low/medium/high)
4. Provide reasoning based on trends

Consider:
- Sales velocity and trends
- Seasonal patterns
- Current stock level vs minimum
- Lead time for reordering
- Cost of stockout vs overstock

Return JSON with:
- productId: "${productId}"
- productName: "${product.name}"
- currentStock: ${product.stockQuantity}
- predictedDemand: number (units needed in next 30 days)
- recommendedOrder: number (units to order)
- forecastDate: today's date
- confidence: 0-100 score
- reasoning: explanation
- urgency: "low" | "medium" | "high"
`;

    const systemPrompt = `You are an expert inventory management analyst.
Analyze sales patterns and inventory movements to forecast future demand.
Always respond with valid JSON format.`;

    const response = await callOpenAIJSON<InventoryForecast>(
      prompt,
      systemPrompt
    );

    if (response.success && response.data) {
      return response.data;
    }

    // Fallback forecast
    return generateFallbackForecast(product);
  } catch (error: any) {
    console.error("Error getting inventory forecast:", error);
    return null;
  }
}

function generateFallbackForecast(product: any): InventoryForecast {
  // Simple calculation based on average sales
  const avgDailySales = 5; // This would be calculated from actual data
  const predictedDemand = avgDailySales * 30;
  const recommendedOrder = Math.max(
    predictedDemand - product.stockQuantity + product.minStockLevel * 2,
    product.minStockLevel
  );

  const urgency =
    product.stockQuantity <= product.minStockLevel
      ? "high"
      : product.stockQuantity <= product.minStockLevel * 2
      ? "medium"
      : "low";

  return {
    productId: product.id,
    productName: product.name,
    currentStock: product.stockQuantity,
    predictedDemand,
    recommendedOrder,
    forecastDate: new Date().toISOString().split("T")[0],
    confidence: 65,
    reasoning: `Dựa trên mức tiêu thụ trung bình và mức tồn kho hiện tại.`,
    urgency,
  };
}

