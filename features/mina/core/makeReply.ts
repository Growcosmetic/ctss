// ============================================
// Mina AI - Reply Handler with Stylist Mode
// ============================================

import { generateTechnicalRecommendation } from "@/features/stylistCoach/services/technicalRecommendationEngine";
import { analyzeHairTechnical } from "@/features/stylistCoach/services/technicalAnalysisEngine";
import { getCustomer360API } from "@/features/customer360/services/customer360Api";
import type { TechnicalHairProfile } from "@/features/stylistCoach/types/technicalProfile";
import type { TechnicalNote } from "@/features/stylistCoach/types/technicalNotes";
import type { SessionInput } from "@/features/stylistCoach/types/sessionInput";

interface MakeReplyParams {
  message: string;
  customerId?: string | null;
  payload?: {
    hairProfile?: TechnicalHairProfile;
    sessionInput?: SessionInput;
    technicalNotes?: TechnicalNote[];
  };
}

interface MakeReplyResult {
  type: "assistant" | "stylist";
  text: string;
  shouldUseAI?: boolean; // If false, return this response directly without OpenAI
}

// ============================================
// Detect Stylist Mode
// ============================================

function detectStylistMode(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  
  return (
    lowerMessage.includes("phân tích tóc") ||
    lowerMessage.includes("kiểu uốn phù hợp") ||
    lowerMessage.includes("uốn được không") ||
    lowerMessage.includes("tóc này có làm được không") ||
    lowerMessage.includes("có nên uốn") ||
    lowerMessage.includes("có nên nhuộm") ||
    lowerMessage.includes("gợi ý kỹ thuật") ||
    lowerMessage.includes("lời khuyên stylist") ||
    lowerMessage.includes("tóc này") ||
    lowerMessage.includes("tình trạng tóc") ||
    lowerMessage.includes("có thể uốn") ||
    lowerMessage.includes("có thể nhuộm") ||
    lowerMessage.includes("rủi ro") ||
    lowerMessage.includes("thuốc uốn") ||
    lowerMessage.includes("công thức uốn")
  );
}

// ============================================
// Main Reply Handler
// ============================================

export async function makeReply({
  message,
  customerId,
  payload,
}: MakeReplyParams): Promise<MakeReplyResult | null> {
  // Detect mode
  let mode: "STYLIST" | "DEFAULT" = "DEFAULT";

  if (detectStylistMode(message)) {
    mode = "STYLIST";
  }

  // === STYLIST MODE HANDLER ============================================
  if (mode === "STYLIST") {
    try {
      // Get Customer360 data if customerId is available
      const customer360 = customerId
        ? await getCustomer360API(customerId).catch(() => null)
        : null;

      // Load hairProfile + sessionInput from payload
      const { hairProfile, sessionInput, technicalNotes } = payload || {};

      // Validate required data
      if (!hairProfile || !sessionInput) {
        return {
          type: "stylist",
          text: `Mina (AI Stylist Coach) đây 💇‍♀️✨

Em cần thêm thông tin để phân tích kỹ thuật cho mình:

📋 **Thông tin cần có:**
- Tình trạng tóc (độ đàn hồi, độ rỗng, độ dày)
- Mức độ hư tổn (1-5)
- Lịch sử hoá chất (uốn, nhuộm, tẩy, duỗi)
- Phong cách khách mong muốn

Vui lòng cung cấp thông tin này hoặc sử dụng form nhập liệu để em có thể phân tích chính xác hơn nhé! ❤️`,
          shouldUseAI: false,
        };
      }

      // Generate technical recommendation
      const recommendation = await generateTechnicalRecommendation({
        hairProfile,
        sessionInput,
        technicalNotes: technicalNotes || [],
        customer360: customer360 || undefined,
      });

      // Format response
      const responseText = `
Mina (AI Stylist Coach) đây 💇‍♀️✨  

Em phân tích cho mình như sau:

🔥 **TÓM TẮT TÌNH TRẠNG TÓC**

${recommendation.analysis.aiSummary}

⚠️ **MỨC ĐỘ RỦI RO**: ${recommendation.riskLevel}

⏱ **THỜI GIAN DỰ KIẾN**: ${recommendation.estimatedTime} phút

💡 **GỢI Ý KỸ THUẬT**:

${recommendation.aiGeneratedProcess}

🧴 **SẢN PHẨM ĐỀ XUẤT**:

${recommendation.productSuggestions.map((s) => "- " + s).join("\n")}

${recommendation.analysis.warnings.length > 0 ? `\n⚠️ **CẢNH BÁO**:\n${recommendation.analysis.warnings.map((w) => "- " + w).join("\n")}\n` : ""}

${recommendation.analysis.strengths.length > 0 ? `\n✅ **ĐIỂM MẠNH**:\n${recommendation.analysis.strengths.map((s) => "- " + s).join("\n")}\n` : ""}

Nếu cần chi tiết từng bước thực hiện hoặc em phân tích sâu hơn, cứ hỏi em nha ❤️
      `.trim();

      return {
        type: "stylist",
        text: responseText,
        shouldUseAI: false, // Return directly, don't use OpenAI
      };
    } catch (error: any) {
      console.error("Stylist Coach error:", error);
      
      // Fallback response
      return {
        type: "stylist",
        text: `Mina (AI Stylist Coach) đây 💇‍♀️✨

Xin lỗi, em gặp lỗi khi phân tích kỹ thuật: ${error.message || "Lỗi không xác định"}

Vui lòng thử lại hoặc cung cấp đầy đủ thông tin về tình trạng tóc để em có thể hỗ trợ tốt hơn nhé! ❤️`,
        shouldUseAI: false,
      };
    }
  }

  // === DEFAULT MODE (NON stylist mode) =================================
  // Return null to continue with normal AI flow
  return null;
}

