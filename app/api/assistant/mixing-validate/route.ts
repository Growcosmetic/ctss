// ============================================
// Assistant - Validate Mixing Formula
// AI hỗ trợ xác thực công thức pha thuốc
// ============================================

import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { formula, serviceType, hairCondition, stylistRequest } = body;

    if (!formula || !serviceType) {
      return NextResponse.json(
        { error: "formula and serviceType are required" },
        { status: 400 }
      );
    }

    const prompt = `
Bạn là chuyên gia kiểm tra công thức pha thuốc tại Chí Tâm Hair Salon.

NHIỆM VỤ:
Xác thực và đánh giá công thức pha thuốc có an toàn và phù hợp không.

CÔNG THỨC CẦN KIỂM TRA:
${JSON.stringify(formula, null, 2)}

LOẠI DỊCH VỤ: ${serviceType}

TÌNH TRẠNG TÓC: ${hairCondition || "Chưa có thông tin"}

YÊU CẦU STYLIST: ${stylistRequest || "Chưa có thông tin"}

Hãy đánh giá:

1. **isValid**: Công thức có hợp lệ không? (true/false)
2. **warnings**: Cảnh báo nếu có (oxy quá mạnh, tỉ lệ không phù hợp, sản phẩm không đúng loại)
3. **suggestions**: Gợi ý cải thiện (nếu có)
4. **safety**: Mức độ an toàn (SAFE / CAUTION / UNSAFE)
5. **recommendation**: Khuyến nghị (CÓ THỂ DÙNG / CẦN ĐIỀU CHỈNH / KHÔNG NÊN DÙNG)

FORMAT TRẢ VỀ (JSON):
{
  "isValid": true/false,
  "warnings": [
    "Cảnh báo 1",
    "Cảnh báo 2"
  ],
  "suggestions": [
    "Gợi ý 1",
    "Gợi ý 2"
  ],
  "safety": "SAFE | CAUTION | UNSAFE",
  "recommendation": "CÓ THỂ DÙNG | CẦN ĐIỀU CHỈNH | KHÔNG NÊN DÙNG",
  "reason": "Lý do cho khuyến nghị"
}

LƯU Ý:
- Ưu tiên an toàn cho khách hàng
- Kiểm tra tỉ lệ oxy có phù hợp với tình trạng tóc không
- Kiểm tra tỉ lệ pha có đúng chuẩn không
- Cảnh báo nếu có rủi ro

CHỈ TRẢ VỀ JSON hợp lệ - KHÔNG DÙNG MARKDOWN.
    `;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Bạn là chuyên gia kiểm tra công thức pha thuốc. Đánh giá chính xác, ưu tiên an toàn. Trả về JSON hợp lệ.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 800,
      temperature: 0.5, // Lower temperature for more consistent validation
      response_format: { type: "json_object" },
    });

    const rawOutput = completion.choices[0]?.message?.content;

    if (!rawOutput) {
      throw new Error("AI did not return validation");
    }

    // Parse JSON
    let validation;
    try {
      validation = JSON.parse(rawOutput);
    } catch (parseError) {
      const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        validation = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse AI response as JSON");
      }
    }

    return NextResponse.json({
      success: true,
      validation,
    });
  } catch (err: any) {
    console.error("Validate formula error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to validate formula",
      },
      { status: 500 }
    );
  }
}

