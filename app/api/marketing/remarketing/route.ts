// ============================================
// Remarketing AI API
// ============================================

import { NextResponse } from "next/server";

// Lazy initialize OpenAI client
function getClient() {
  return getOpenAIClientSafe();
}
import { getOpenAIClientSafe } from "@/lib/ai/openai";
import { remarketingPrompt } from "@/core/prompts/remarketingPrompt";
import { segmentCustomers, type CustomerSegment } from "@/core/remarketing/segmentCustomers";

// Client initialized lazily via getClient()

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { segment, goal, platform, style } = body;

    // Validation
    if (!segment || !goal || !platform || !style) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: segment, goal, platform, style",
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

    // Generate remarketing messages for each customer
    const results: any[] = [];

    // Process in batches to avoid rate limiting
    const batchSize = 5;
    for (let i = 0; i < customers.length; i += batchSize) {
      const batch = customers.slice(i, i + batchSize);

      const batchPromises = batch.map(async (customer) => {
        try {
          const promptText = remarketingPrompt({
            customer: customer.profile,
            segment,
            goal,
            platform,
            style,
          });

          const completion = await getClient().chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "Bạn là chuyên gia AI Remarketing cho salon tóc. Tạo message cá nhân hóa, tinh tế, không hard sale. Trả về JSON hợp lệ.",
              },
              {
                role: "user",
                content: promptText,
              },
            ],
            max_tokens: 300,
            temperature: 0.8,
            response_format: { type: "json_object" },
          });

          const rawOutput = completion.choices[0]?.message?.content;

          if (!rawOutput) {
            throw new Error("AI did not return any content");
          }

          // Parse JSON
          let result;
          try {
            result = JSON.parse(rawOutput);
          } catch (parseError) {
            // Try to extract JSON from markdown if present
            const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              result = JSON.parse(jsonMatch[0]);
            } else {
              throw new Error("Failed to parse AI response as JSON");
            }
          }

          const remarketingResult = {
            customerId: customer.customerId,
            phone: customer.phone,
            name: customer.name,
            ...result,
          };

          // Auto-save to Content Library (non-blocking)
          if (result.message && !result.error) {
            fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/marketing/library/add`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: "remarketing",
                topic: `${customer.name || "Khách"} - ${segment}`,
                content: {
                  message: result.message,
                  reason: result.reason,
                },
                cta: result.cta,
                platform,
                style,
                tags: [segment, customer.name?.toLowerCase() || "customer"].filter(Boolean),
              }),
            }).catch((err) => {
              console.error("Failed to save remarketing to library:", err);
            });
          }

          return remarketingResult;
        } catch (error: any) {
          console.error(
            `Failed to generate remarketing for customer ${customer.customerId}:`,
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
    console.error("Remarketing API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate remarketing messages",
      },
      { status: 500 }
    );
  }
}

