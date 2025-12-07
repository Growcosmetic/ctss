// ============================================
// CTA Optimizer API
// ============================================

import { NextResponse } from "next/server";
import { optimizeCTA } from "@/core/cta/ctaOptimizer";
import { segmentCustomers, type CustomerSegment } from "@/core/remarketing/segmentCustomers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { segment, goal, platform, contentType } = body;

    // Validation
    if (!segment || !goal || !platform) {
      return NextResponse.json(
        {
          error: "Missing required fields: segment, goal, platform",
        },
        { status: 400 }
      );
    }

    // Get segmented customers
    const customers = await segmentCustomers(segment as CustomerSegment);

    if (customers.length === 0) {
      return NextResponse.json({
        success: true,
        results: [],
        message: "No customers found in this segment",
      });
    }

    // Optimize CTA for each customer
    const results: any[] = [];

    // Process in batches to avoid rate limiting
    const batchSize = 5;
    for (let i = 0; i < customers.length; i += batchSize) {
      const batch = customers.slice(i, i + batchSize);

      const batchPromises = batch.map(async (customer) => {
        try {
          const optimization = await optimizeCTA({
            customer: customer.profile,
            segment,
            goal,
            platform,
            contentType,
          });

          return {
            customerId: customer.customerId,
            phone: customer.phone,
            name: customer.name,
            ...optimization,
          };
        } catch (error: any) {
          console.error(
            `Failed to optimize CTA for customer ${customer.customerId}:`,
            error
          );
          return {
            customerId: customer.customerId,
            phone: customer.phone,
            name: customer.name,
            error: error.message,
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Small delay between batches to avoid rate limiting
      if (i + batchSize < customers.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return NextResponse.json({
      success: true,
      segment,
      totalCustomers: customers.length,
      results,
    });
  } catch (error: any) {
    console.error("CTA optimizer API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to optimize CTAs",
      },
      { status: 500 }
    );
  }
}

