import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function GET() {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
    }

    let items;
    try {
      // @ts-ignore - Model may not be generated yet
      items = await prisma.stylistAnalysis.findMany({
        orderBy: { createdAt: "desc" },
        take: 100, // Limit to last 100 for performance
      });
    } catch (dbError: any) {
      // Return empty if model doesn't exist
      if (dbError.message?.includes("does not exist") || dbError.message?.includes("Property 'stylistAnalysis'")) {
        items = [];
      } else {
        throw dbError;
      }
    }

    if (items.length === 0) {
      return NextResponse.json({
        insights: "Chưa có dữ liệu phân tích để tạo insights.",
      });
    }

    // Prepare summary data for AI
    const summaryData = {
      total: items.length,
      riskLevels: {} as Record<string, number>,
      damageLevels: {} as Record<string, number>,
      topGoals: {} as Record<string, number>,
      recentItems: items.slice(0, 10).map(item => ({
        hairCondition: item.hairCondition.substring(0, 100),
        customerGoal: item.customerGoal.substring(0, 100),
        damageLevel: item.hairDamageLevel,
        riskLevel: (item.resultJson as any).riskLevel,
        createdAt: item.createdAt.toISOString().split("T")[0],
      })),
    };

    items.forEach((item) => {
      const risk = (item.resultJson as any).riskLevel || "UNKNOWN";
      summaryData.riskLevels[risk] = (summaryData.riskLevels[risk] || 0) + 1;

      const damage = item.hairDamageLevel || "UNKNOWN";
      summaryData.damageLevels[damage] = (summaryData.damageLevels[damage] || 0) + 1;

      const goal = item.customerGoal.substring(0, 50);
      summaryData.topGoals[goal] = (summaryData.topGoals[goal] || 0) + 1;
    });

    const prompt = `
Dữ liệu phân tích kỹ thuật của salon (${summaryData.total} phân tích):

Tổng quan:
- Tổng số phân tích: ${summaryData.total}
- Phân bố rủi ro: ${JSON.stringify(summaryData.riskLevels)}
- Phân bố mức hư tổn: ${JSON.stringify(summaryData.damageLevels)}

Một số phân tích gần đây:
${JSON.stringify(summaryData.recentItems, null, 2)}

Hãy phân tích và trả về INSIGHTS ngắn gọn, rõ ràng:

- Top mục tiêu khách hàng
- Những vấn đề kỹ thuật xuất hiện nhiều nhất
- Tỷ lệ rủi ro tổng quan
- Gợi ý cải thiện chuyên môn cho team
- Dấu hiệu cảnh báo quan trọng (nếu có)

Không dùng markdown.
Trả về text thuần, dễ đọc.
`;

    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: "Bạn là chuyên gia phân tích dữ liệu salon với nhiều năm kinh nghiệm. Hãy đưa ra insights thực tế và hữu ích." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const insights = response.choices[0]?.message?.content || "Không thể tạo insights.";

    return NextResponse.json({
      insights,
    });
  } catch (err: any) {
    console.error("Insights error:", err);
    return NextResponse.json(
      { error: "Failed to generate insights: " + (err.message || "Unknown error") },
      { status: 500 }
    );
  }
}
