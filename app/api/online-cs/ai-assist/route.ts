// ============================================
// Online CS AI Assist - AI hỗ trợ CSKH Online
// ============================================

import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      action,
      customerMessage,
      customerInfo,
      hairPhotoUrl,
      context,
    } = body;

    if (!action || !customerMessage) {
      return NextResponse.json(
        { error: "action and customerMessage are required" },
        { status: 400 }
      );
    }

    let prompt = "";
    let systemPrompt = `Bạn là CSKH Online chuyên nghiệp của Chí Tâm Hair Salon, có tên là Mina.
Tone giao tiếp: Thân thiện, lễ phép, chủ động, không push, không ép khách.
Giọng văn: Gần gũi, có emoji phù hợp, chuyên nghiệp nhưng ấm áp.`;

    switch (action) {
      case "analyze_hair_photo":
        // Phân tích ảnh tóc
        prompt = `
Phân tích ảnh tóc của khách hàng (URL: ${hairPhotoUrl || "Không có"}).

THÔNG TIN KHÁCH:
- Tin nhắn: ${customerMessage}
- Thông tin khách: ${JSON.stringify(customerInfo || {})}
- Ngữ cảnh: ${context || "Không có"}

Hãy phân tích và trả về JSON:
{
  "hairCondition": "Mô tả tình trạng tóc (khỏe/trung bình/yếu)",
  "hairPattern": "Pattern tóc (thẳng/uốn/tự nhiên)",
  "thickness": "Độ dày (mỏng/trung bình/dày)",
  "damageLevel": "Mức độ hư tổn (1-5)",
  "previousChemicals": "Có thể có hóa chất trước đó (uốn/nhuộm/tẩy)",
  "riskLevel": "Mức độ rủi ro (LOW/MEDIUM/HIGH)",
  "recommendations": ["Gợi ý 1", "Gợi ý 2", "Gợi ý 3"],
  "suggestedServices": [
    {
      "option": "A",
      "service": "Tên dịch vụ",
      "description": "Mô tả",
      "advantages": ["Ưu điểm 1", "Ưu điểm 2"]
    }
  ]
}

LƯU Ý:
- Phân tích chính xác, không đoán mò
- Nếu không chắc, ghi "Cần xác nhận thêm"
- Đưa ra 2-3 gợi ý dịch vụ phù hợp
        `;
        break;

      case "generate_reply":
        // Tạo phản hồi tự động
        prompt = `
Tin nhắn khách: "${customerMessage}"

THÔNG TIN KHÁCH: ${JSON.stringify(customerInfo || {})}
NGỮ CẢNH: ${context || "Không có"}

Hãy tạo phản hồi theo tone Mina (thân thiện, lễ phép, chủ động, không push).

Trả về JSON:
{
  "reply": "Phản hồi đầy đủ",
  "nextAction": "Hành động tiếp theo (ask_photo/suggest_service/quote_price/book_appointment)",
  "needsStylist": true/false,
  "suggestedScript": "ID script gợi ý (nếu có)"
}

LƯU Ý:
- Tone Mina: Thân thiện, lễ phép, có emoji phù hợp
- Không push, không ép khách
- Chủ động hỏi thông tin cần thiết
        `;
        break;

      case "suggest_service":
        // Gợi ý dịch vụ
        prompt = `
Tình trạng tóc khách: ${JSON.stringify(customerInfo?.hairAnalysis || {})}
Yêu cầu khách: "${customerMessage}"

Hãy đưa ra 2-3 option dịch vụ phù hợp.

Trả về JSON:
{
  "options": [
    {
      "option": "A",
      "service": "Tên dịch vụ",
      "description": "Mô tả chi tiết",
      "advantages": ["Ưu điểm 1", "Ưu điểm 2", "Ưu điểm 3"],
      "suitableFor": "Phù hợp với ai/tình trạng tóc nào"
    }
  ],
  "recommendation": "Option nào nên recommend nhất và lý do"
}

LƯU Ý:
- Đưa 2-3 option, không chỉ 1
- Mỗi option phải có ưu điểm rõ ràng
- Không push option đắt nhất
        `;
        break;

      case "handle_objection":
        // Xử lý phản đối (giá cao, không chắc, v.v.)
        prompt = `
Khách phản đối: "${customerMessage}"
Loại phản đối: ${context || "Không xác định"}

Hãy xử lý phản đối theo tone Mina (thấu hiểu, giải thích nhẹ nhàng, không push).

Trả về JSON:
{
  "reply": "Phản hồi xử lý phản đối",
  "handled": true/false,
  "nextStep": "Hành động tiếp theo"
}

LƯU Ý:
- Thấu hiểu cảm giác khách
- Giải thích nhẹ nhàng, không defensive
- Đề xuất giải pháp thay thế nếu có
- Không push, không ép
        `;
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1500,
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const rawOutput = completion.choices[0]?.message?.content;

    if (!rawOutput) {
      throw new Error("AI did not return response");
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
    console.error("AI assist error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get AI assistance",
      },
      { status: 500 }
    );
  }
}

