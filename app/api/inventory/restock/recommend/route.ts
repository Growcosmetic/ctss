// ============================================
// Restock Recommendation - Generate AI recommendations
// ============================================

import { NextResponse } from "next/server";

// Lazy initialize OpenAI client
function getClient() {
  return getOpenAIClientSafe();
}
import { prisma } from "@/lib/prisma";
import { restockRecommendationPrompt } from "@/core/prompts/restockRecommendationPrompt";
import { getOpenAIClientSafe } from "@/lib/ai/openai";

// Client initialized lazily via getClient()

export async function POST(req: Request) {
  try {
    const { budget, productIds } = await req.json();

    // Get projections that need restock
    const where: any = {
      status: "ACTIVE",
      needsRestock: true,
    };
    if (productIds && productIds.length > 0) {
      where.productId = { in: productIds };
    }

    const projections = await prisma.inventoryProjection.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            unit: true,
            category: true,
            stock: true,
            minStock: true,
            pricePerUnit: true,
          },
        },
      },
      orderBy: [
        { restockPriority: "desc" },
        { daysUntilEmpty: "asc" },
      ],
    });

    if (projections.length === 0) {
      return NextResponse.json({
        success: true,
        recommendations: [],
        message: "No products need restocking",
      });
    }

    // Prepare data for AI
    const projectionData = projections.map((p) => ({
      productId: p.productId,
      productName: p.product.name,
      unit: p.product.unit,
      currentStock: p.currentStock,
      safetyStock: p.safetyStock || p.product.minStock || 0,
      daysUntilEmpty: p.daysUntilEmpty || 0,
      projection30Days: p.projection30Days || p.adjustedProjection30Days || 0,
      averageDailyUsage: p.averageDailyUsage,
      pricePerUnit: p.product.pricePerUnit || 0,
    }));

    // AI Recommendation
    const prompt = restockRecommendationPrompt(projectionData, budget);

    let aiRecommendations;
    try {
      const completion = await getClient().chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Bạn là AI Restock Recommendation System chuyên nghiệp. Phân tích tồn kho, đưa ra đề xuất nhập hàng hợp lý. Trả về JSON hợp lệ.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 2000,
        temperature: 0.7,
        response_format: { type: "json_object" },
      });

      const rawOutput = completion.choices[0]?.message?.content;
      if (rawOutput) {
        aiRecommendations = JSON.parse(rawOutput);
      }
    } catch (aiError) {
      console.error("AI recommendation error:", aiError);
      // Fallback to basic calculation
    }

    // Fallback: Basic calculation if AI fails
    if (!aiRecommendations || !aiRecommendations.recommendations) {
      aiRecommendations = {
        recommendations: projectionData.map((p) => {
          const recommendedQty = Math.max(
            0,
            p.projection30Days - p.currentStock + p.safetyStock
          );
          const estimatedCost = recommendedQty * p.pricePerUnit;

          let priority: "HIGH" | "MEDIUM" | "LOW" = "LOW";
          if (p.daysUntilEmpty < 7 || p.currentStock < p.safetyStock) {
            priority = "HIGH";
          } else if (p.daysUntilEmpty < 14) {
            priority = "MEDIUM";
          }

          return {
            productName: p.productName,
            recommendedQty,
            recommendedUnit: p.unit === "g" ? "chai" : p.unit === "ml" ? "chai" : "gói",
            estimatedCost,
            priority,
            reason: `Tồn kho ${p.currentStock}${p.unit}, dự báo hết trong ${Math.round(p.daysUntilEmpty)} ngày`,
            budgetCategory: priority === "HIGH" ? "ESSENTIAL" : "IMPORTANT",
            canDefer: priority === "LOW",
          };
        }),
      };

      aiRecommendations.totalCost = aiRecommendations.recommendations.reduce(
        (sum: number, r: any) => sum + r.estimatedCost,
        0
      );
    }

    // Create recommendation records
    const recommendations = await Promise.all(
      aiRecommendations.recommendations.map(async (rec: any) => {
        const projection = projections.find(
          (p) => p.product.name === rec.productName
        );
        if (!projection) return null;

        return await prisma.restockRecommendation.create({
          data: {
            productId: projection.productId,
            projectionId: projection.id,
            currentStock: projection.currentStock,
            safetyStock: projection.safetyStock,
            daysUntilEmpty: projection.daysUntilEmpty,
            recommendedQty: rec.recommendedQty,
            recommendedUnit: rec.recommendedUnit,
            estimatedCost: rec.estimatedCost,
            priority: rec.priority,
            reason: rec.reason,
            budgetCategory: rec.budgetCategory,
            canDefer: rec.canDefer || false,
          },
          include: {
            product: true,
          },
        });
      })
    );

    const validRecommendations = recommendations.filter((r) => r !== null);

    return NextResponse.json({
      success: true,
      recommendations: validRecommendations,
      summary: aiRecommendations.summary,
      totalCost: aiRecommendations.totalCost || 0,
      optimization: aiRecommendations.optimization || null,
    });
  } catch (err: any) {
    console.error("Generate recommendations error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to generate recommendations",
      },
      { status: 500 }
    );
  }
}

// Get recommendations
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (status) where.status = status;

    const recommendations = await prisma.restockRecommendation.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            unit: true,
            category: true,
            pricePerUnit: true,
          },
        },
      },
      orderBy: [
        { priority: "desc" },
        { createdAt: "desc" },
      ],
    });

    const totalCost = recommendations.reduce(
      (sum, r) => sum + (r.estimatedCost || 0),
      0
    );

    return NextResponse.json({
      success: true,
      recommendations,
      totalCost,
      total: recommendations.length,
    });
  } catch (err: any) {
    console.error("Get recommendations error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get recommendations",
      },
      { status: 500 }
    );
  }
}

