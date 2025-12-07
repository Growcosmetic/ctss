// ============================================
// Stylist Coach API Route
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { successResponse, errorResponse } from "@/lib/api-response";

// Initialize OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// ===============================
// PROMPT SYSTEM
// ===============================
const SYSTEM_PROMPT = `
Bạn là AI Stylist Coach — chuyên gia phân tích và đề xuất kỹ thuật uốn/nhuộm/phục hồi.

Trả về đúng JSON với các field sau:

{
  "analysis": {
    "warnings": [],
    "strengths": [],
    "suggestions": [],
    "aiSummary": "",
    "lastProcessSummary": "",
    "technicalNotes": []
  },
  "processSteps": [],
  "productSuggestions": [],
  "riskLevel": "LOW" | "MEDIUM" | "HIGH",
  "estimatedTime": 0,
  "aiGeneratedProcess": ""
}

YÊU CẦU:
- Tuyệt đối không dùng markdown.
- Không nói lan man.
- Không thêm ký tự ngoài JSON.
- Không thêm bình luận.
- Chỉ trả JSON hợp lệ.
- Luôn có đầy đủ field (không được thiếu).
`;

// Simple token validation
function validateToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [userId] = decoded.split(":");
    return userId || null;
  } catch {
    return null;
  }
}

// POST /api/stylist-coach
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return errorResponse("Not authenticated", 401);
    }

    const userId = validateToken(token);
    if (!userId) {
      return errorResponse("Invalid token", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isActive) {
      return errorResponse("User not found or inactive", 401);
    }

    // Check if user has stylist permissions
    // Only STYLIST, MANAGER, and ADMIN can use Stylist Coach
    if (!["STYLIST", "MANAGER", "ADMIN"].includes(user.role)) {
      return errorResponse("Access denied. Stylist Coach is only available for stylists, managers, and admins.", 403);
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return errorResponse("OpenAI API key is not configured", 500);
    }

    // Parse request body
    const body = await request.json();
    const {
      hairCondition,
      hairHistory,
      customerGoal,
      curlType,
      hairDamageLevel,
      stylistNote,
    } = body;

    // Validate required fields
    if (!hairCondition) {
      return errorResponse("hairCondition is required", 400);
    }

    if (!hairHistory) {
      return errorResponse("hairHistory is required", 400);
    }

    if (!customerGoal) {
      return errorResponse("customerGoal is required", 400);
    }

    // ===============================
    // PROMPT USER
    // ===============================
    const userPrompt = `
Thông tin khách:
- Tình trạng tóc: ${hairCondition}
- Lịch sử hóa chất: ${hairHistory}
- Mục tiêu khách: ${customerGoal}
- Loại xoăn mong muốn: ${curlType || "Không chỉ định"}
- Mức độ hư tổn: ${hairDamageLevel || "Không chỉ định"}
- Ghi chú stylist: ${stylistNote || "Không có"}

Hãy phân tích & trả về đúng JSON theo cấu trúc quy định.
`;

    // ===============================
    // GPT CALL
    // ===============================
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" }, // Force JSON response
    });

    const raw = response.choices[0]?.message?.content;

    if (!raw) {
      throw new Error("No response from OpenAI");
    }

    // Parse JSON response
    let json;
    try {
      // Clean the response (remove markdown code blocks if any)
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      json = JSON.parse(cleaned);
    } catch (parseError: any) {
      console.error("Failed to parse OpenAI JSON response:", parseError);
      console.error("Raw response:", raw);
      
      // Return error with fallback structure
      return errorResponse("AI phân tích lỗi: không thể parse JSON. Vui lòng thử lại.", 500);
    }

    // Validate response structure
    if (!json.analysis || !json.processSteps || !json.productSuggestions) {
      console.error("Invalid response structure:", json);
      return errorResponse("AI trả về cấu trúc không đúng. Vui lòng thử lại.", 500);
    }

    // Ensure all required fields exist
    const validatedResponse = {
      analysis: {
        warnings: json.analysis?.warnings || [],
        strengths: json.analysis?.strengths || [],
        suggestions: json.analysis?.suggestions || [],
        aiSummary: json.analysis?.aiSummary || "",
        lastProcessSummary: json.analysis?.lastProcessSummary || "",
        technicalNotes: json.analysis?.technicalNotes || [],
      },
      processSteps: json.processSteps || [],
      productSuggestions: json.productSuggestions || [],
      riskLevel: json.riskLevel || "MEDIUM",
      estimatedTime: json.estimatedTime || 120,
      aiGeneratedProcess: json.aiGeneratedProcess || "",
    };

    return NextResponse.json(validatedResponse);
  } catch (error: any) {
    console.error("StylistCoach API error:", error);
    return NextResponse.json(
      { error: "AI phân tích lỗi, thử lại sau." },
      { status: 500 }
    );
  }
}

// GET /api/stylist-coach (optional: return example request structure)
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return errorResponse("Not authenticated", 401);
    }

    const userId = validateToken(token);
    if (!userId) {
      return errorResponse("Invalid token", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isActive) {
      return errorResponse("User not found or inactive", 401);
    }

    // Return API documentation / example structure
    return successResponse({
      message: "Stylist Coach API",
      description: "POST endpoint for generating technical hair recommendations using AI",
      requiredFields: {
        hairCondition: "string - Mô tả tình trạng tóc hiện tại",
        hairHistory: "string - Lịch sử hóa chất đã sử dụng",
        customerGoal: "string - Mục tiêu/kiểu tóc khách muốn",
      },
      optionalFields: {
        curlType: "string - Loại xoăn mong muốn",
        hairDamageLevel: "string - Mức độ hư tổn (1-5)",
        stylistNote: "string - Ghi chú thêm từ stylist",
      },
      responseFormat: {
        analysis: {
          warnings: "string[]",
          strengths: "string[]",
          suggestions: "string[]",
          aiSummary: "string",
          lastProcessSummary: "string",
          technicalNotes: "string[]",
        },
        processSteps: "string[]",
        productSuggestions: "string[]",
        riskLevel: "LOW | MEDIUM | HIGH",
        estimatedTime: "number (minutes)",
        aiGeneratedProcess: "string",
      },
    });
  } catch (error: any) {
    console.error("Stylist Coach API error:", error);
    return errorResponse(
      error.message || "Failed to get API information",
      500
    );
  }
}

