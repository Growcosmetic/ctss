// ============================================
// Service Cost - AI Cost Optimization
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { costOptimizationPrompt } from "@/core/prompts/costOptimizationPrompt";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const currentQuantity = parseFloat(searchParams.get("quantity") || "0");
    const serviceId = searchParams.get("serviceId");

    if (!productId || !currentQuantity) {
      return NextResponse.json(
        { error: "productId and quantity are required" },
        { status: 400 }
      );
    }

    // Get product
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Get recent usage statistics (last 120 uses)
    const mixLogWhere: any = { productId };
    if (serviceId) mixLogWhere.serviceId = serviceId;

    const recentUsage = await prisma.mixLog.findMany({
      where: mixLogWhere,
      orderBy: { createdAt: "desc" },
      take: 120,
      include: {
        product: true,
      },
    });

    if (recentUsage.length === 0) {
      return NextResponse.json({
        success: true,
        optimization: {
          currentUsage: currentQuantity,
          optimalRange: {
            min: currentQuantity * 0.9,
            max: currentQuantity * 1.1,
            recommended: currentQuantity,
          },
          analysis: "Chưa có đủ dữ liệu để phân tích",
          savings: {
            perService: 0,
            monthlyEstimate: 0,
            yearlyEstimate: 0,
          },
          recommendations: [
            "Cần thu thập thêm dữ liệu sử dụng",
          ],
          riskLevel: "medium",
          qualityImpact: "Cần kiểm tra",
        },
      });
    }

    // Calculate statistics
    const quantities = recentUsage.map((log) => log.actualQty);
    const averageQty =
      quantities.reduce((sum, q) => sum + q, 0) / quantities.length;
    const minQty = Math.min(...quantities);
    const maxQty = Math.max(...quantities);
    const medianQty = quantities.sort((a, b) => a - b)[
      Math.floor(quantities.length / 2)
    ];

    // Calculate waste rate (if expectedQty exists)
    const withExpected = recentUsage.filter((log) => log.expectedQty);
    const wasteRate =
      withExpected.length > 0
        ? withExpected.reduce((sum, log) => {
            const waste = log.actualQty - (log.expectedQty || 0);
            return sum + (waste / (log.expectedQty || 1)) * 100;
          }, 0) / withExpected.length
        : 0;

    const statistics = {
      averageQty,
      minQty,
      maxQty,
      medianQty,
      sampleSize: recentUsage.length,
      wasteRate: Math.round(wasteRate * 100) / 100,
    };

    // Generate AI optimization
    const prompt = costOptimizationPrompt(
      product.name,
      currentQuantity,
      statistics,
      recentUsage
    );

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Bạn là AI Cost Optimization Advisor chuyên nghiệp. Phân tích chi phí, đưa ra gợi ý tối ưu hợp lý, không ảnh hưởng chất lượng. Trả về JSON hợp lệ.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const rawOutput = completion.choices[0]?.message?.content;

    if (!rawOutput) {
      throw new Error("AI did not return optimization");
    }

    let optimization;
    try {
      optimization = JSON.parse(rawOutput);
    } catch (parseError) {
      const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        optimization = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse AI optimization");
      }
    }

    // Calculate actual savings
    const unitPrice = product.pricePerUnit || 0;
    const savingsPerService =
      (currentQuantity - (optimization.optimalRange?.recommended || currentQuantity)) *
      unitPrice;
    const monthlyEstimate = savingsPerService * 30; // Assume 30 services/month
    const yearlyEstimate = monthlyEstimate * 12;

    optimization.savings = {
      perService: Math.round(savingsPerService),
      monthlyEstimate: Math.round(monthlyEstimate),
      yearlyEstimate: Math.round(yearlyEstimate),
    };

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        unit: product.unit,
        pricePerUnit: unitPrice,
      },
      statistics,
      optimization,
    });
  } catch (err: any) {
    console.error("Cost optimization error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to optimize cost",
      },
      { status: 500 }
    );
  }
}

