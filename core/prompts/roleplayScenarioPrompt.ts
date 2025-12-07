// ============================================
// Roleplay Scenario Generator Prompt
// ============================================

export function roleplayScenarioPrompt(
  customerType: string,
  role: string
): string {
  return `
Bạn là AI Scenario Generator cho Chí Tâm Hair Salon.

Tạo tình huống roleplay cho nhân viên ${role} với loại khách hàng: ${customerType}.

LOẠI KHÁCH HÀNG:
${getCustomerTypeDescription(customerType)}

Hãy tạo tình huống và trả về JSON:

{
  "scenario": "Mô tả tình huống (2-3 câu)",
  "persona": "Mô tả khách hàng: tuổi, tính cách, tâm trạng (2-3 câu)",
  "hairCondition": "Tình trạng tóc (nếu có)",
  "goal": "Mục tiêu của khách",
  "emotion": "Cảm xúc: nghi ngờ | lo lắng | gấp | khó chịu | vui vẻ",
  "initialMessage": "Câu đầu tiên khách sẽ nói",
  "expectedChallenges": ["Thử thách 1", "Thử thách 2"],
  "evaluationCriteria": ["Tiêu chí đánh giá 1", "Tiêu chí đánh giá 2"]
}

LƯU Ý:
- Tình huống phải thực tế, giống khách hàng thật
- Khách hàng phải có tính cách rõ ràng
- Câu đầu tiên phải tự nhiên, như khách thật nói
- Thử thách phù hợp với loại khách

CHỈ TRẢ VỀ JSON - KHÔNG DÙNG MARKDOWN.
  `;
}

function getCustomerTypeDescription(type: string): string {
  const descriptions: Record<string, string> = {
    khach_kho_tinh:
      "Khách khó tính: Hỏi giá liên tục, soi mói kỹ thuật, nghi ngờ stylist, dễ nổi nóng nếu trả lời sai",
    khach_gap:
      "Khách gấp: Muốn làm ngay, test khả năng xử lý lịch, hối thúc",
    khach_chua_ro_nhu_cau:
      "Khách chưa rõ nhu cầu: Không biết làm gì, cần tư vấn, test kỹ năng phân tích nhu cầu",
    khach_so_hu_toc:
      "Khách sợ hư tóc: Lo lắng tóc sẽ cháy/yếu, hỏi nhiều về rủi ro, test kỹ thuật + tâm lý",
    khach_muon_re:
      "Khách muốn rẻ: Hỏi giá liên tục, muốn giảm giá, test upsale mềm - tinh tế",
    khach_phan_nan:
      "Khách phàn nàn/tóc lỗi: Tóc làm xong không ưng ý, test kỹ năng xử lý rủi ro theo SOP Mina",
  };

  return descriptions[type] || "Khách hàng bình thường";
}

