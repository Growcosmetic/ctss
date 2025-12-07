// ============================================
// Inventory Projection - Calculate projections
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { inventoryProjectionPrompt } from "@/core/prompts/inventoryProjectionPrompt";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400 }
      );
    }

    // Get product
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        category: true,
        unit: true,
        stock: true,
        minStock: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Get consumption data (last 30 days)
    const since = new Date();
    since.setDate(since.getDate() - 30);
    since.setHours(0, 0, 0, 0);

    const consumptions = await prisma.consumptionTracking.findMany({
      where: {
        productId,
        date: { gte: since },
      },
      orderBy: { date: "desc" },
    });

    if (consumptions.length === 0) {
      // No consumption data - create basic projection
      const projection = await prisma.inventoryProjection.create({
        data: {
          productId,
          currentStock: product.stock || 0,
          safetyStock: product.minStock || null,
          averageDailyUsage: 0,
          projection7Days: 0,
          projection14Days: 0,
          projection30Days: 0,
          daysUntilEmpty: product.stock ? 999 : 0,
          needsRestock: (product.stock || 0) < (product.minStock || 0),
        },
        include: {
          product: true,
        },
      });

      return NextResponse.json({
        success: true,
        projection,
        message: "No consumption data available",
      });
    }

    // Calculate statistics
    const totalUsage = consumptions.reduce(
      (sum, c) => sum + c.quantityUsed,
      0
    );
    const daysWithUsage = consumptions.length;
    const averageDailyUsage = totalUsage / 30; // Always use 30 days for projection
    const peakUsage = Math.max(...consumptions.map((c) => c.peakUsage || 0));
    const lowUsage = Math.min(
      ...consumptions.map((c) => c.lowUsage || c.quantityUsed)
    );

    // Calculate trend (last 7 days vs previous 7 days)
    const recent7 = consumptions.slice(0, 7);
    const previous7 = consumptions.slice(7, 14);
    const recent7Total = recent7.reduce((sum, c) => sum + c.quantityUsed, 0);
    const previous7Total = previous7.reduce((sum, c) => sum + c.quantityUsed, 0);

    let trend: "increasing" | "decreasing" | "stable" = "stable";
    if (previous7Total > 0) {
      const changePercent = ((recent7Total - previous7Total) / previous7Total) * 100;
      if (changePercent > 10) trend = "increasing";
      else if (changePercent < -10) trend = "decreasing";
    }

    // AI Projection
    const prompt = inventoryProjectionPrompt(
      {
        name: product.name,
        category: product.category,
        unit: product.unit,
      },
      {
        averageDailyUsage,
        peakUsage,
        lowUsage,
        recentTrend: trend,
      },
      product.stock || 0
    );

    let aiProjection;
    try {
      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Bạn là AI Inventory Projection System chuyên nghiệp. Phân tích dữ liệu tiêu thụ, đưa ra dự báo chính xác. Trả về JSON hợp lệ.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 800,
        temperature: 0.7,
        response_format: { type: "json_object" },
      });

      const rawOutput = completion.choices[0]?.message?.content;
      if (rawOutput) {
        aiProjection = JSON.parse(rawOutput);
      }
    } catch (aiError) {
      console.error("AI projection error:", aiError);
      // Fallback to basic calculation
    }

    // Calculate projections
    const projection7Days = averageDailyUsage * 7;
    const projection14Days = averageDailyUsage * 14;
    let projection30Days = averageDailyUsage * 30;

    // Apply AI adjustments if available
    if (aiProjection?.adjustments) {
      const seasonalFactor = aiProjection.adjustments.seasonalFactor || 1.0;
      const trendFactor = aiProjection.adjustments.trendFactor || 1.0;
      projection30Days = projection30Days * seasonalFactor * trendFactor;
    }

    // Calculate days until empty
    const currentStock = product.stock || 0;
    const daysUntilEmpty =
      averageDailyUsage > 0 ? currentStock / averageDailyUsage : 999;

    // Determine if needs restock
    const safetyStock = product.minStock || 0;
    const needsRestock =
      currentStock < safetyStock || daysUntilEmpty < 14 || daysUntilEmpty < 10;

    // Determine priority
    let priority: "HIGH" | "MEDIUM" | "LOW" = "LOW";
    if (currentStock < safetyStock || daysUntilEmpty < 7) {
      priority = "HIGH";
    } else if (daysUntilEmpty < 14) {
      priority = "MEDIUM";
    }

    // Upsert projection
    const projection = await prisma.inventoryProjection.upsert({
      where: {
        productId_projectionDate: {
          productId,
          projectionDate: new Date(),
        },
      },
      create: {
        productId,
        currentStock,
        safetyStock: safetyStock || null,
        averageDailyUsage: Math.round(averageDailyUsage * 100) / 100,
        peakDailyUsage: peakUsage,
        lowDailyUsage: lowUsage,
        projection7Days: Math.round(projection7Days * 100) / 100,
        projection14Days: Math.round(projection14Days * 100) / 100,
        projection30Days: Math.round(projection30Days * 100) / 100,
        daysUntilEmpty: Math.round(daysUntilEmpty * 100) / 100,
        seasonalFactor: aiProjection?.adjustments?.seasonalFactor || 1.0,
        trendFactor: aiProjection?.adjustments?.trendFactor || 1.0,
        adjustedProjection30Days: Math.round(projection30Days * 100) / 100,
        needsRestock,
        restockPriority: priority,
      },
      update: {
        currentStock,
        safetyStock: safetyStock || null,
        averageDailyUsage: Math.round(averageDailyUsage * 100) / 100,
        peakDailyUsage: peakUsage,
        lowDailyUsage: lowUsage,
        projection7Days: Math.round(projection7Days * 100) / 100,
        projection14Days: Math.round(projection14Days * 100) / 100,
        projection30Days: Math.round(projection30Days * 100) / 100,
        daysUntilEmpty: Math.round(daysUntilEmpty * 100) / 100,
        seasonalFactor: aiProjection?.adjustments?.seasonalFactor || 1.0,
        trendFactor: aiProjection?.adjustments?.trendFactor || 1.0,
        adjustedProjection30Days: Math.round(projection30Days * 100) / 100,
        needsRestock,
        restockPriority: priority,
        updatedAt: new Date(),
      },
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
    });

    return NextResponse.json({
      success: true,
      projection,
      aiAnalysis: aiProjection || null,
      statistics: {
        averageDailyUsage,
        peakUsage,
        lowUsage,
        daysWithUsage,
        trend,
      },
    });
  } catch (err: any) {
    console.error("Calculate projection error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to calculate projection",
      },
      { status: 500 }
    );
  }
}

// Get all projections
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const needsRestock = searchParams.get("needsRestock") === "true";

    const where: any = {
      status: "ACTIVE",
    };
    if (needsRestock) where.needsRestock = true;

    const projections = await prisma.inventoryProjection.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            unit: true,
            category: true,
            pricePerUnit: true,
            stock: true,
          },
        },
      },
      orderBy: [
        { restockPriority: "desc" },
        { daysUntilEmpty: "asc" },
      ],
    });

    return NextResponse.json({
      success: true,
      projections,
      total: projections.length,
    });
  } catch (err: any) {
    console.error("Get projections error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get projections",
      },
      { status: 500 }
    );
  }
}

