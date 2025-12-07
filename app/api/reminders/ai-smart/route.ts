// ============================================
// Reminders - AI Smart Reminder Generator
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { customerId, reminderType, context } = await req.json();

    if (!customerId || !reminderType) {
      return NextResponse.json(
        { error: "customerId and reminderType are required" },
        { status: 400 }
      );
    }

    // Get customer data
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        visits: {
          orderBy: { date: "desc" },
          take: 5,
        },
        tags: true,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Build prompt
    const prompt = `
Bạn là Mina - CSKH chuyên nghiệp của Chí Tâm Hair Salon.

Tạo tin nhắn nhắc lịch theo tone Mina (thân thiện, lễ phép, tinh tế, không push).

THÔNG TIN KHÁCH:
- Tên: ${customer.name}
- Tổng số lần đến: ${customer.totalVisits}
- Dịch vụ gần nhất: ${customer.visits[0]?.service || "Chưa có"}
- Tags: ${customer.tags.map((t: any) => t.tag).join(", ")}

LOẠI NHẮC LỊCH: ${reminderType}
${context ? `NGỮ CẢNH: ${context}` : ""}

Hãy tạo tin nhắn nhắc lịch:
1. Thân thiện, lễ phép
2. Cá nhân hóa theo khách
3. Tone Mina (không push, tinh tế)
4. Có emoji phù hợp
5. CTA nhẹ nhàng

Trả về JSON:
{
  "message": "Tin nhắn đầy đủ",
  "bestTimeToSend": "morning | afternoon | evening | anytime",
  "suggestedFollowUp": "Gợi ý follow-up nếu cần",
  "urgency": "LOW | MEDIUM | HIGH"
}

CHỈ TRẢ VỀ JSON - KHÔNG DÙNG MARKDOWN.
    `;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Bạn là Mina - CSKH chuyên nghiệp. Tạo tin nhắn nhắc lịch thân thiện, cá nhân hóa. Trả về JSON hợp lệ.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const rawOutput = completion.choices[0]?.message?.content;

    if (!rawOutput) {
      throw new Error("AI did not return message");
    }

    // Parse JSON
    let result;
    try {
      result = JSON.parse(rawOutput);
    } catch (parseError) {
      const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse AI response as JSON");
      }
    }

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (err: any) {
    console.error("AI smart reminder error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to generate AI reminder",
      },
      { status: 500 }
    );
  }
}

