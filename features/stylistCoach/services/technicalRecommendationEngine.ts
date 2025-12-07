// ============================================
// Stylist Coach - Technical Recommendation Engine
// ============================================

import { callOpenAI } from "@/lib/ai/openai";
import { analyzeHairTechnical } from "./technicalAnalysisEngine";
import type { TechnicalHairProfile } from "../types/technicalProfile";
import type { TechnicalNote } from "../types/technicalNotes";
import type { SessionInput } from "../types/sessionInput";

interface Customer360Data {
  insights?: {
    persona?: string;
  };
}

interface GenerateTechnicalRecommendationParams {
  hairProfile: TechnicalHairProfile;
  technicalNotes?: TechnicalNote[];
  sessionInput: SessionInput;
  customer360?: Customer360Data;
}

interface TechnicalRecommendationResult {
  analysis: {
    lastProcessSummary: string | null;
    warnings: string[];
    strengths: string[];
    suggestions: string[];
    aiSummary: string;
  };
  processSteps: string[];
  productSuggestions: string[];
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  estimatedTime: number;
  aiGeneratedProcess: string;
}

// ============================================
// Main Recommendation Function
// ============================================

export async function generateTechnicalRecommendation({
  hairProfile,
  technicalNotes = [],
  sessionInput,
  customer360,
}: GenerateTechnicalRecommendationParams): Promise<TechnicalRecommendationResult> {
  // Get technical analysis first
  const analysis = await analyzeHairTechnical({
    hairProfile,
    technicalNotes,
    sessionInput,
    customer360,
  });

  // === BASIC RULE ENGINE FOR RECOMMENDATIONS ===================
  const processSteps: string[] = [];
  const productSuggestions: string[] = [];
  let riskLevel: "LOW" | "MEDIUM" | "HIGH" = "LOW";
  let estimatedTime = 120; // default minutes

  // Damage Level Recommendations
  if (hairProfile.damageLevel >= 4 || sessionInput.damage >= 4) {
    productSuggestions.push("Plexis Aqua Intensive – phục hồi trước khi xử lý.");
    productSuggestions.push("Olaplex No.3 – treatment phục hồi cấu trúc tóc.");
    productSuggestions.push("K18 Intensive Treatment – phục hồi keratin.");
    estimatedTime += 30; // Extra time for pre-treatment
    riskLevel = "HIGH";
  } else if (hairProfile.damageLevel === 3 || sessionInput.damage === 3) {
    productSuggestions.push("Plexis Aqua Intensive – phục hồi nhẹ trước khi xử lý.");
    estimatedTime += 20;
    riskLevel = "MEDIUM";
  } else {
    productSuggestions.push("Plexis Aqua Gloss – dưỡng ẩm nhẹ.");
  }

  // Elasticity + Porosity Recommendations
  if (hairProfile.elasticity === "weak") {
    productSuggestions.push("Khuyến nghị dùng thuốc Acid Aqua Gloss Curl (nhẹ).");
    productSuggestions.push("Không dùng thuốc uốn mạnh (Alkaline).");
    estimatedTime += 10; // More careful processing
    riskLevel = riskLevel === "LOW" ? "MEDIUM" : riskLevel;
  } else if (hairProfile.elasticity === "strong") {
    productSuggestions.push("Có thể dùng thuốc uốn Alkaline nếu cần uốn chặt.");
  }

  if (hairProfile.porosity === "high") {
    productSuggestions.push("Giảm thời gian ngấm thuốc 20–30% để tránh quá trình.");
    productSuggestions.push("Kiểm tra độ giãn mẫu thường xuyên (mỗi 3–5 phút).");
    processSteps.push("⚠️ Lưu ý: Tóc rỗng cao → kiểm tra thường xuyên trong quá trình.");
  } else if (hairProfile.porosity === "low") {
    productSuggestions.push("Có thể cần tăng thời gian ngấm thuốc nhẹ (5–10%).");
    productSuggestions.push("Pre-treatment với heat để mở lớp cuticle.");
  }

  // Thickness Recommendations
  if (hairProfile.thickness === "fine") {
    productSuggestions.push("Sử dụng thuốc uốn dành cho tóc mỏng.");
    productSuggestions.push("Lô cuốn nhỏ hơn (size 16–18).");
    estimatedTime -= 10; // Fine hair processes faster
  } else if (hairProfile.thickness === "coarse") {
    productSuggestions.push("Lô cuốn lớn hơn (size 20–22).");
    estimatedTime += 15; // Coarse hair needs more time
  }

  // Chemical History Recommendations
  if (hairProfile.previousChemicals.bleach > 0) {
    productSuggestions.push("Không dùng thuốc uốn mạnh. Chỉ nên tạo phồng nhẹ / texture.");
    productSuggestions.push("Bắt buộc test strand trước khi thực hiện.");
    productSuggestions.push("Sử dụng thuốc Acid hoặc thuốc uốn không ammonia.");
    riskLevel = riskLevel === "LOW" ? "MEDIUM" : "HIGH";
    estimatedTime += 15; // Extra time for testing
  }

  if (hairProfile.previousChemicals.perm > 2) {
    productSuggestions.push("Chỉ uốn phần tóc mới mọc, tránh phần đã uốn.");
    productSuggestions.push("Sử dụng thuốc uốn nhẹ để tránh over-processing.");
    riskLevel = "MEDIUM";
  }

  if (hairProfile.previousChemicals.color > 0) {
    productSuggestions.push("Kiểm tra độ bền màu trước khi uốn.");
    productSuggestions.push("Có thể cần refresh màu sau khi uốn.");
  }

  if (hairProfile.previousChemicals.straightening > 0) {
    productSuggestions.push("Tóc đã duỗi → cần đợi tóc phục hồi trước khi uốn.");
    if (hairProfile.damageLevel >= 3) {
      riskLevel = "HIGH";
    }
  }

  // Scalp Condition Recommendations
  if (hairProfile.scalpCondition) {
    const scalpLower = hairProfile.scalpCondition.toLowerCase();
    if (scalpLower.includes("nhạy cảm") || scalpLower.includes("kích ứng")) {
      productSuggestions.push("Sử dụng thuốc uốn không chứa ammonia hoặc ít kích ứng.");
      productSuggestions.push("Test thuốc trên da tay trước khi thoa lên tóc.");
      processSteps.push("⚠️ Lưu ý: Da đầu nhạy cảm → tránh để thuốc dính da đầu.");
    }
  }

  // Session Input Recommendations
  if (sessionInput.moisture === "low") {
    productSuggestions.push("Deep conditioning treatment trước khi uốn.");
    productSuggestions.push("Sử dụng sản phẩm dưỡng ẩm trong quá trình.");
    estimatedTime += 15;
  }

  if (sessionInput.previousChemistry) {
    productSuggestions.push("Test strand bắt buộc trước khi thực hiện.");
    estimatedTime += 10;
  }

  // Desired Style Recommendations
  if (sessionInput.desiredStyle && sessionInput.desiredStyle.length > 0) {
    processSteps.push(`Phong cách khách muốn: ${sessionInput.desiredStyle}`);
    
    const styleLower = sessionInput.desiredStyle.toLowerCase();
    
    if (styleLower.includes("uốn") || styleLower.includes("perm")) {
      if (styleLower.includes("nhẹ") || styleLower.includes("loose")) {
        productSuggestions.push("Thuốc uốn Acid Aqua Gloss Curl – tạo sóng nhẹ tự nhiên.");
        productSuggestions.push("Lô cuốn lớn (size 20–22).");
      } else if (styleLower.includes("chặt") || styleLower.includes("tight")) {
        if (hairProfile.damageLevel < 3) {
          productSuggestions.push("Thuốc uốn Alkaline – tạo sóng chặt.");
          productSuggestions.push("Lô cuốn nhỏ (size 16–18).");
        } else {
          productSuggestions.push("Không nên uốn chặt với tóc hư tổn. Chỉ nên uốn nhẹ.");
        }
      } else {
        productSuggestions.push("Thuốc uốn Acid – tạo sóng trung bình.");
      }
    }
    
    if (styleLower.includes("nhuộm") || styleLower.includes("color")) {
      if (hairProfile.porosity === "high") {
        productSuggestions.push("Màu sẽ lên nhanh → kiểm tra thường xuyên.");
      }
      if (hairProfile.previousChemicals.color > 0) {
        productSuggestions.push("Cần refresh màu sau khi uốn.");
      }
    }
  }

  if (sessionInput.customerConcern && sessionInput.customerConcern.length > 0) {
    processSteps.push(`Lưu ý đặc biệt từ khách: ${sessionInput.customerConcern}`);
  }

  // Technical Notes History Recommendations
  if (technicalNotes && technicalNotes.length > 0) {
    const lastProcess = technicalNotes[0];
    const lastDate = new Date(lastProcess.date);
    const daysSince = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSince < 30 && lastProcess.service.toLowerCase().includes("uốn")) {
      productSuggestions.push("Tóc mới uốn gần đây → chỉ nên uốn phần tóc mới mọc.");
      riskLevel = "MEDIUM";
    }
    
    if (lastProcess.formula) {
      productSuggestions.push(`Công thức đã dùng lần trước: ${lastProcess.formula} (tham khảo)`);
    }
  }

  // === CREATE CORE PROCESS OUTLINE ===========================================
  processSteps.push("1) Kiểm tra tóc trực tiếp trước khi thực hiện.");
  processSteps.push("2) Gội sạch – sấy khô 80%.");
  
  // Add pre-treatment step if needed
  if (hairProfile.damageLevel >= 3 || sessionInput.damage >= 3) {
    processSteps.push("3) Thoa pre-treatment Plexis tùy độ hư tổn (15–20 phút).");
  } else {
    processSteps.push("3) Thoa pre-treatment Plexis Aqua Gloss (5–10 phút).");
  }
  
  processSteps.push("4) Bôi thuốc uốn theo phân vùng (từ dưới lên trên).");
  processSteps.push("5) Kiểm tra độ giãn mẫu từ 5–8 phút/lần.");
  processSteps.push("6) Xả sạch thuốc – tạo form – cuốn lô.");
  processSteps.push("7) Sấy nhiệt thấp (120–140°C) để ổn định cấu trúc.");
  processSteps.push("8) Trung hòa theo thời gian quy định.");
  processSteps.push("9) Dưỡng phục hồi (Olaplex No.5 hoặc K18).");
  processSteps.push("10) Sấy hoàn thiện và tư vấn chăm sóc.");

  // === RISK LEVEL DECISION ====================================================
  // Count critical warnings
  const criticalWarnings = analysis.warnings.filter(w => 
    w.includes("KHÔNG") || 
    w.includes("cực kỳ") || 
    w.includes("bắt buộc") ||
    w.includes("hư tổn nặng")
  ).length;

  if (criticalWarnings >= 2 || analysis.warnings.length >= 4) {
    riskLevel = "HIGH";
  } else if (criticalWarnings >= 1 || analysis.warnings.length >= 2) {
    riskLevel = "MEDIUM";
  } else {
    riskLevel = "LOW";
  }

  // Additional risk factors
  if (hairProfile.damageLevel >= 4 || sessionInput.damage >= 4) {
    riskLevel = "HIGH";
  } else if (hairProfile.previousChemicals.bleach > 0 && hairProfile.damageLevel >= 3) {
    riskLevel = "HIGH";
  }

  // === AI-GENERATED FINAL STEP-BY-STEP =======================================
  const aiPrompt = `
Bạn là chuyên gia tạo mẫu tóc của Chí Tâm Hair Salon với 20+ năm kinh nghiệm.

Hãy đưa ra quy trình kỹ thuật uốn phù hợp dựa trên:

HairProfile: ${JSON.stringify(hairProfile, null, 2)}

SessionInput: ${JSON.stringify(sessionInput, null, 2)}

Warnings: ${JSON.stringify(analysis.warnings)}

Strengths: ${JSON.stringify(analysis.strengths)}

Suggestions: ${JSON.stringify(analysis.suggestions)}

TechnicalNotes (${technicalNotes.length} ghi chú): ${JSON.stringify(technicalNotes.slice(0, 3), null, 2)}

Personality: ${customer360?.insights?.persona ?? "Không có"}

Hãy viết một quy trình kỹ thuật chi tiết bao gồm:

1) ĐÁNH GIÁ TỔNG QUÁT (2-3 câu)
   - Tình trạng tóc hiện tại
   - Có thể thực hiện dịch vụ không?

2) QUY TRÌNH KỸ THUẬT ĐỀ XUẤT (chi tiết từng bước)
   - Chuẩn bị
   - Pre-treatment
   - Quy trình uốn (thời gian, nhiệt độ, sản phẩm)
   - Post-treatment
   - Hoàn thiện

3) THỜI GIAN DỰ KIẾN
   - Tổng thời gian
   - Thời gian từng bước

4) LƯU Ý RỦI RO
   - Những điểm cần cẩn thận
   - Dấu hiệu cần dừng lại

5) SẢN PHẨM ĐỀ XUẤT
   - Thuốc uốn (tên, loại, lý do)
   - Sản phẩm phục hồi
   - Sản phẩm chăm sóc sau

6) LỜI KHUYÊN THÊM CHO STYLIST
   - Kỹ thuật đặc biệt
   - Mẹo xử lý
   - Cách tư vấn khách

Giọng văn: chuyên gia – tinh tế – chuyên môn cao, rõ ràng, dễ hiểu.
Viết bằng tiếng Việt, chi tiết nhưng không quá dài (5-7 đoạn).
`;

  const systemPrompt = `Bạn là chuyên gia tạo mẫu tóc hàng đầu với 20+ năm kinh nghiệm.
Bạn am hiểu sâu về kỹ thuật uốn, nhuộm, và chăm sóc tóc.
Bạn luôn ưu tiên an toàn, chất lượng, và sự hài lòng của khách hàng.
Bạn có khả năng giải thích kỹ thuật phức tạp một cách dễ hiểu.`;

  let aiGeneratedProcess = "";

  try {
    const aiResponse = await callOpenAI(aiPrompt, systemPrompt);
    
    if (aiResponse.success && aiResponse.data) {
      aiGeneratedProcess = aiResponse.data;
    } else {
      // Fallback to rule-based process
      aiGeneratedProcess = generateFallbackProcess(
        hairProfile,
        sessionInput,
        analysis,
        processSteps,
        productSuggestions,
        riskLevel,
        estimatedTime
      );
    }
  } catch (error) {
    console.error("Error calling OpenAI for technical recommendation:", error);
    // Fallback to rule-based process
    aiGeneratedProcess = generateFallbackProcess(
      hairProfile,
      sessionInput,
      analysis,
      processSteps,
      productSuggestions,
      riskLevel,
      estimatedTime
    );
  }

  return {
    analysis,
    processSteps,
    productSuggestions,
    riskLevel,
    estimatedTime,
    aiGeneratedProcess,
  };
}

// ============================================
// Fallback Process Generator
// ============================================

function generateFallbackProcess(
  hairProfile: TechnicalHairProfile,
  sessionInput: SessionInput,
  analysis: {
    warnings: string[];
    strengths: string[];
    suggestions: string[];
  },
  processSteps: string[],
  productSuggestions: string[],
  riskLevel: "LOW" | "MEDIUM" | "HIGH",
  estimatedTime: number
): string {
  let process = "=== QUY TRÌNH KỸ THUẬT ĐỀ XUẤT ===\n\n";

  // 1. Đánh giá tổng quát
  process += "1. ĐÁNH GIÁ TỔNG QUÁT:\n";
  if (hairProfile.damageLevel >= 4 || sessionInput.damage >= 4) {
    process += "Tóc hư tổn nặng. KHÔNG nên thực hiện dịch vụ uốn/nhuộm tại thời điểm này.\n";
    process += "Cần phục hồi tóc trước (ít nhất 2-3 tuần) với treatment chuyên sâu.\n\n";
  } else if (hairProfile.damageLevel === 3 || sessionInput.damage === 3) {
    process += "Tóc có tổn thương trung bình. Có thể thực hiện với điều kiện:\n";
    process += "- Pre-treatment phục hồi bắt buộc\n";
    process += "- Sử dụng thuốc uốn nhẹ (Acid)\n";
    process += "- Giảm thời gian xử lý\n\n";
  } else {
    process += "Tóc ở tình trạng tốt. Có thể thực hiện dịch vụ uốn bình thường.\n\n";
  }

  // 2. Quy trình kỹ thuật
  process += "2. QUY TRÌNH KỸ THUẤT:\n";
  processSteps.forEach((step, index) => {
    if (index < 10) {
      process += `${step}\n`;
    }
  });
  process += "\n";

  // 3. Thời gian dự kiến
  process += `3. THỜI GIAN DỰ KIẾN: ${estimatedTime} phút\n`;
  process += "- Chuẩn bị: 10 phút\n";
  process += "- Pre-treatment: 15-20 phút\n";
  process += "- Quy trình uốn: 60-90 phút\n";
  process += "- Hoàn thiện: 20-30 phút\n\n";

  // 4. Lưu ý rủi ro
  if (analysis.warnings.length > 0) {
    process += "4. LƯU Ý RỦI RO:\n";
    analysis.warnings.slice(0, 5).forEach((warning, i) => {
      process += `${i + 1}. ${warning}\n`;
    });
    process += "\n";
  }

  // 5. Sản phẩm đề xuất
  if (productSuggestions.length > 0) {
    process += "5. SẢN PHẨM ĐỀ XUẤT:\n";
    productSuggestions.slice(0, 8).forEach((product, i) => {
      process += `${i + 1}. ${product}\n`;
    });
    process += "\n";
  }

  // 6. Lời khuyên cho stylist
  process += "6. LỜI KHUYÊN CHO STYLIST:\n";
  process += `- Mức độ rủi ro: ${riskLevel}\n`;
  if (riskLevel === "HIGH") {
    process += "- Bắt buộc test strand trước khi thực hiện\n";
    process += "- Thông báo rõ ràng với khách về rủi ro\n";
    process += "- Cân nhắc đề xuất treatment phục hồi trước\n";
  } else if (riskLevel === "MEDIUM") {
    process += "- Nên test strand để đảm bảo an toàn\n";
    process += "- Theo dõi sát trong quá trình xử lý\n";
  } else {
    process += "- Thực hiện theo quy trình chuẩn\n";
    process += "- Đảm bảo chất lượng dịch vụ\n";
  }

  if (sessionInput.desiredStyle) {
    process += `- Phong cách khách muốn: ${sessionInput.desiredStyle}\n`;
  }

  return process;
}

