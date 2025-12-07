// ============================================
// Instagram DM Webhook Handler
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { normalizeInstagramMessage } from "@/core/channel/normalizer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Instagram webhook structure (similar to Facebook)
    if (body.object === "instagram") {
      if (body.entry) {
        for (const entry of body.entry) {
          const messaging = entry.messaging || entry.direct_message;
          if (messaging && messaging.length > 0) {
            for (const webhookEvent of messaging) {
              // Normalize Instagram message
              const unified = normalizeInstagramMessage(webhookEvent);

              // Forward to intake API
              const intakeResponse = await fetch(
                `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/channel/intake`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    platform: "instagram",
                    customerId: unified.customerId,
                    phone: unified.phone,
                    message: unified.message,
                    attachments: unified.attachments,
                    metadata: unified.metadata,
                  }),
                }
              );

              const result = await intakeResponse.json();

              // Send reply back to Instagram (you'll need Instagram Graph API)
              if (result.success && result.reply) {
                // TODO: Send message via Instagram Graph API
                // await sendInstagramMessage(unified.customerId, result.reply);
              }
            }
          }
        }
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
  } catch (error: any) {
    console.error("Instagram webhook error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint for webhook verification
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.INSTAGRAM_VERIFY_TOKEN;

  if (mode === "subscribe" && token === verifyToken) {
    return new NextResponse(challenge);
  }

  return NextResponse.json({ error: "Invalid token" }, { status: 403 });
}

