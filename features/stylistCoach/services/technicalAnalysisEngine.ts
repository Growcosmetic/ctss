// ============================================
// Stylist Coach - Technical Analysis Engine
// ============================================

import { callOpenAI } from "@/lib/ai/openai";
import type { TechnicalHairProfile } from "../types/technicalProfile";
import type { TechnicalNote } from "../types/technicalNotes";
import type { SessionInput } from "../types/sessionInput";

interface Customer360Data {
  insights?: {
    persona?: string;
  };
}

interface AnalyzeHairTechnicalParams {
  hairProfile: TechnicalHairProfile;
  technicalNotes?: TechnicalNote[];
  sessionInput: SessionInput;
  customer360?: Customer360Data;
}

interface TechnicalAnalysisResult {
  lastProcessSummary: string | null;
  warnings: string[];
  strengths: string[];
  suggestions: string[];
  aiSummary: string;
}

// ============================================
// Main Analysis Function
// ============================================

export async function analyzeHairTechnical({
  hairProfile,
  technicalNotes = [],
  sessionInput,
  customer360,
}: AnalyzeHairTechnicalParams): Promise<TechnicalAnalysisResult> {
  if (!hairProfile || !sessionInput) {
    throw new Error("Missing required hairProfile or sessionInput");
  }

  // === BASIC RULE ENGINE ======================================================
  const warnings: string[] = [];
  const strengths: string[] = [];
  const suggestions: string[] = [];

  // Elasticity Analysis
  if (hairProfile.elasticity === "weak") {
    warnings.push("Tóc đàn hồi yếu → nguy cơ đứt gãy khi uốn.");
    suggestions.push("Nên sử dụng thuốc uốn nhẹ, giảm thời gian xử lý.");
  } else if (hairProfile.elasticity === "medium") {
    strengths.push("Độ đàn hồi trung bình → phù hợp đa số kiểu uốn nhẹ.");
  } else if (hairProfile.elasticity === "strong") {
    strengths.push("Độ đàn hồi tốt → tóc khỏe, dễ xử lý.");
  }

  // Porosity Analysis (độ rỗng tóc)
  if (hairProfile.porosity === "high") {
    warnings.push("Độ rỗng cao → dễ hút thuốc, dễ quá trình.");
    suggestions.push("Nên giảm thời gian xử lý thuốc.");
    suggestions.push("Cần kiểm tra thường xuyên trong quá trình uốn.");
  } else if (hairProfile.porosity === "low") {
    suggestions.push("Độ rỗng thấp → có thể cần tăng thời gian xử lý nhẹ.");
  } else {
    strengths.push("Độ rỗng trung bình → tóc hấp thụ thuốc ổn định.");
  }

  // Thickness Analysis
  if (hairProfile.thickness === "fine") {
    warnings.push("Tóc mỏng → dễ bị tổn thương, cần xử lý nhẹ nhàng.");
    suggestions.push("Sử dụng thuốc uốn dành cho tóc mỏng.");
  } else if (hairProfile.thickness === "coarse") {
    suggestions.push("Tóc dày → có thể cần thời gian xử lý lâu hơn.");
  }

  // Damage Level Analysis
  if (hairProfile.damageLevel >= 4) {
    warnings.push("Tóc hư tổn nặng → KHÔNG nên dùng thuốc mạnh.");
    suggestions.push("Bắt buộc treatment phục hồi trước khi uốn.");
    suggestions.push("Khuyến nghị: Olaplex No.3 hoặc K18 Intensive Treatment.");
  } else if (hairProfile.damageLevel === 3) {
    warnings.push("Tổn thương trung bình → cần giảm nhiệt + giảm thời gian uốn.");
    suggestions.push("Nên sử dụng thuốc uốn nhẹ, không dùng nhiệt cao.");
  } else if (hairProfile.damageLevel <= 2) {
    strengths.push("Tóc ít hư tổn → phù hợp xử lý hoá chất.");
  }

  // Chemical History Analysis
  const { perm, color, bleach, straightening } = hairProfile.previousChemicals;

  if (bleach > 0) {
    warnings.push("Tóc đã tẩy → cực kỳ nhạy cảm với thuốc uốn.");
    suggestions.push("Bắt buộc test strand trước khi uốn toàn bộ.");
    suggestions.push("Không nên uốn ngay sau khi tẩy, cần đợi ít nhất 2 tuần.");
  }

  if (perm > 2) {
    warnings.push("Tóc uốn nhiều lần → không nên uốn tiếp khu vực cũ.");
    suggestions.push("Chỉ uốn phần tóc mới mọc, tránh phần đã uốn trước đó.");
  } else if (perm > 0) {
    suggestions.push("Tóc đã uốn trước đó → cần kiểm tra tình trạng trước khi uốn lại.");
  }

  if (color > 0) {
    suggestions.push("Tóc đã nhuộm → cần kiểm tra độ bền màu trước khi uốn.");
  }

  if (straightening > 0) {
    warnings.push("Tóc đã duỗi → có thể ảnh hưởng đến kết quả uốn.");
    suggestions.push("Cần đợi tóc phục hồi trước khi uốn.");
  }

  // Scalp Condition
  if (hairProfile.scalpCondition) {
    const scalpLower = hairProfile.scalpCondition.toLowerCase();
    if (scalpLower.includes("nhạy cảm") || scalpLower.includes("kích ứng")) {
      warnings.push("Da đầu nhạy cảm → cần test thuốc trước khi sử dụng.");
      suggestions.push("Sử dụng thuốc uốn không chứa ammonia hoặc ít kích ứng.");
    }
  }

  // Session Input Analysis (real-time)
  if (sessionInput.damage >= 4) {
    suggestions.push("Khuyến nghị: phục hồi Plexis Aqua Intensive trước 3–5 ngày.");
    suggestions.push("Không nên thực hiện dịch vụ uốn/nhuộm trong tình trạng này.");
  } else if (sessionInput.damage === 3) {
    suggestions.push("Cần treatment phục hồi nhẹ trước khi xử lý.");
  }

  if (sessionInput.moisture === "low") {
    warnings.push("Tóc thiếu độ ẩm → dễ gãy khi xử lý.");
    suggestions.push("Cần bổ sung độ ẩm trước khi uốn (deep conditioning).");
  } else if (sessionInput.moisture === "high") {
    strengths.push("Tóc đủ độ ẩm → phù hợp xử lý hoá chất.");
  }

  if (sessionInput.previousChemistry) {
    warnings.push("Khách đã từng xử lý hoá chất → cần kiểm tra kỹ lưỡng.");
    suggestions.push("Test strand bắt buộc trước khi thực hiện.");
  }

  if (sessionInput.desiredStyle && sessionInput.desiredStyle.length > 0) {
    suggestions.push(`Kiểu khách mong muốn: ${sessionInput.desiredStyle}`);
    
    // Style-specific suggestions
    const styleLower = sessionInput.desiredStyle.toLowerCase();
    if (styleLower.includes("uốn") || styleLower.includes("perm")) {
      if (hairProfile.damageLevel >= 3) {
        suggestions.push("Với tóc hư tổn, nên chọn uốn nhẹ (loose wave) thay vì uốn chặt.");
      }
    }
    if (styleLower.includes("nhuộm") || styleLower.includes("color")) {
      if (hairProfile.porosity === "high") {
        suggestions.push("Tóc rỗng cao → màu sẽ lên nhanh, cần kiểm tra thường xuyên.");
      }
    }
  }

  if (sessionInput.customerConcern && sessionInput.customerConcern.length > 0) {
    suggestions.push(`Lưu ý từ khách: ${sessionInput.customerConcern}`);
  }

  // Technical Notes History Analysis
  const lastProcess = technicalNotes && technicalNotes.length > 0 ? technicalNotes[0] : null;
  let lastServiceSummary: string | null = null;

  if (lastProcess) {
    lastServiceSummary = `Dịch vụ gần nhất: ${lastProcess.service} – stylist: ${lastProcess.stylistName} – ngày ${lastProcess.date}.`;
    
    // Analyze last process for patterns
    if (lastProcess.formula) {
      suggestions.push(`Công thức đã dùng lần trước: ${lastProcess.formula}`);
    }
    
    if (lastProcess.processingTime) {
      suggestions.push(`Thời gian xử lý lần trước: ${lastProcess.processingTime}`);
    }
    
    // Check if same service was done recently
    const lastDate = new Date(lastProcess.date);
    const daysSince = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSince < 30 && lastProcess.service.toLowerCase().includes("uốn")) {
      warnings.push(`Tóc mới uốn ${daysSince} ngày trước → không nên uốn lại ngay.`);
    }
  }

  // === AI SUMMARY USING OPENAI ===============================================
  const aiSummaryPrompt = `
Bạn là chuyên gia kỹ thuật tóc của Chí Tâm Hair Salon.

Phân tích tình trạng tóc dựa trên dữ liệu sau:

- Hair Profile: ${JSON.stringify(hairProfile, null, 2)}
- Session Input: ${JSON.stringify(sessionInput, null, 2)}
- Technical Notes (${technicalNotes.length} ghi chú): ${JSON.stringify(technicalNotes.slice(0, 3), null, 2)}
- Customer360 Persona: ${customer360?.insights?.persona ?? "Không có"}

Hãy tóm tắt:
1) Tình trạng sợi tóc hiện tại
2) Rủi ro kỹ thuật cần lưu ý
3) Có thể uốn/nhuộm không? (Có/Không/Có điều kiện)
4) Cần lưu ý gì khi xử lý?
5) Gợi ý công thức/phương pháp phù hợp

Giọng văn: chuyên gia kỹ thuật, dễ hiểu, tinh tế, chuyên nghiệp.
Viết bằng tiếng Việt, ngắn gọn nhưng đầy đủ thông tin (3-5 đoạn).
`;

  const systemPrompt = `Bạn là chuyên gia kỹ thuật tóc hàng đầu với 15+ năm kinh nghiệm. 
Bạn hiểu sâu về cấu trúc tóc, hoá chất, và các kỹ thuật uốn/nhuộm.
Bạn luôn ưu tiên an toàn và chất lượng dịch vụ.`;

  let aiSummary = "";

  try {
    const aiResponse = await callOpenAI(aiSummaryPrompt, systemPrompt);
    
    if (aiResponse.success && aiResponse.data) {
      aiSummary = aiResponse.data;
    } else {
      // Fallback summary if AI fails
      aiSummary = generateFallbackSummary(
        hairProfile,
        sessionInput,
        warnings,
        strengths,
        suggestions
      );
    }
  } catch (error) {
    console.error("Error calling OpenAI for technical analysis:", error);
    // Fallback to rule-based summary
    aiSummary = generateFallbackSummary(
      hairProfile,
      sessionInput,
      warnings,
      strengths,
      suggestions
    );
  }

  return {
    lastProcessSummary: lastServiceSummary,
    warnings,
    strengths,
    suggestions,
    aiSummary,
  };
}

// ============================================
// Fallback Summary Generator
// ============================================

function generateFallbackSummary(
  hairProfile: TechnicalHairProfile,
  sessionInput: SessionInput,
  warnings: string[],
  strengths: string[],
  suggestions: string[]
): string {
  let summary = "=== PHÂN TÍCH KỸ THUẬT TÓC ===\n\n";

  // Tình trạng tóc
  summary += "1. TÌNH TRẠNG SỢI TÓC:\n";
  summary += `- Độ đàn hồi: ${hairProfile.elasticity}\n`;
  summary += `- Độ rỗng: ${hairProfile.porosity}\n`;
  summary += `- Độ dày: ${hairProfile.thickness}\n`;
  summary += `- Mức độ hư tổn: ${hairProfile.damageLevel}/5\n`;
  if (hairProfile.scalpCondition) {
    summary += `- Tình trạng da đầu: ${hairProfile.scalpCondition}\n`;
  }
  summary += "\n";

  // Rủi ro
  if (warnings.length > 0) {
    summary += "2. RỦI RO KỸ THUẬT:\n";
    warnings.forEach((w, i) => {
      summary += `${i + 1}. ${w}\n`;
    });
    summary += "\n";
  }

  // Điểm mạnh
  if (strengths.length > 0) {
    summary += "3. ĐIỂM MẠNH:\n";
    strengths.forEach((s, i) => {
      summary += `${i + 1}. ${s}\n`;
    });
    summary += "\n";
  }

  // Khuyến nghị
  summary += "4. KHUYẾN NGHỊ:\n";
  if (hairProfile.damageLevel >= 4) {
    summary += "→ KHÔNG nên thực hiện dịch vụ uốn/nhuộm. Cần phục hồi trước.\n";
  } else if (hairProfile.damageLevel === 3) {
    summary += "→ Có thể thực hiện với điều kiện: treatment phục hồi trước, sử dụng thuốc nhẹ.\n";
  } else {
    summary += "→ Có thể thực hiện dịch vụ uốn/nhuộm bình thường.\n";
  }

  if (suggestions.length > 0) {
    summary += "\n5. LƯU Ý KHI XỬ LÝ:\n";
    suggestions.slice(0, 5).forEach((s, i) => {
      summary += `${i + 1}. ${s}\n`;
    });
  }

  return summary;
}

