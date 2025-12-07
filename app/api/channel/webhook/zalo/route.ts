// ============================================
// Zalo OA Webhook Handler
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { normalizeZaloMessage } from "@/core/channel/normalizer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Verify Zalo webhook (add signature verification if needed)
    // const signature = req.headers.get("x-zalo-signature");
    // if (!verifyZaloSignature(body, signature)) {
    //   return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    // }

    // Normalize Zalo message
    const unified = normalizeZaloMessage(body);

    // Forward to intake API
    const intakeResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/channel/intake`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: "zalo",
          customerId: unified.customerId,
          phone: unified.phone,
          message: unified.message,
          attachments: unified.attachments,
          metadata: unified.metadata,
        }),
      }
    );

    const result = await intakeResponse.json();

    // Send reply back to Zalo (you'll need Zalo API integration)
    if (result.success && result.reply) {
      // TODO: Send message via Zalo OA API
      // await sendZaloMessage(unified.customerId, result.reply);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Zalo webhook error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint for webhook verification (Zalo requires this)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const oa_verify_token = process.env.ZALO_OA_VERIFY_TOKEN;

  if (searchParams.get("oa_verify_token") === oa_verify_token) {
    return new NextResponse(searchParams.get("oa_challenge"));
  }

  return NextResponse.json({ error: "Invalid token" }, { status: 403 });
}

