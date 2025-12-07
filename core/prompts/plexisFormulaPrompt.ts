// ============================================
// Plexis Formula Generator Prompt (29D)
// ============================================

export function plexisFormulaPrompt(
  styleAnalysis: any,
  curlAnalysis: any,
  hairCondition: {
    damageLevel?: number;
    porosity?: string;
    dryness?: number;
  }
): string {
  return `
Bạn là chuyên gia uốn tóc Plexis tại Chí Tâm Hair Salon, với kiến thức sâu về Plexis Acid Aqua Gloss Curl và các sản phẩm Plexis.

THÔNG TIN ĐẦU VÀO:

Phân tích kiểu tóc:
${JSON.stringify(styleAnalysis, null, 2)}

Phân tích xoăn:
${JSON.stringify(curlAnalysis, null, 2)}

Điều kiện tóc:
${JSON.stringify(hairCondition, null, 2)}

NHIỆM VỤ:
Tạo công thức uốn Plexis phù hợp để đạt được kiểu tóc và pattern xoăn như trong ảnh.

CÁC LOẠI UỐN PLEXIS:

1. UỐN NÓNG (Hot Perm):
   - Sử dụng: Plexis Acid Aqua Gloss Curl 7.5 (uốn nóng)
   - Setting: Rod size phù hợp (3.0, 3.2, 3.5, 3.8, 4.0)
   - Nhiệt độ: 140-155°C
   - Thời gian: Tùy thuộc vào độ hư tổn

2. UỐN LẠNH (Cold Perm):
   - Sử dụng: Plexis Cold Wave
   - Không cần nhiệt
   - Thời gian lâu hơn uốn nóng

3. UỐN ACID:
   - Sử dụng: Plexis Acid Aqua Gloss Curl
   - Nhẹ nhàng hơn, phù hợp tóc hư tổn
   - Thời gian xử lý ngắn hơn

QUYẾT ĐỊNH LOẠI UỐN:
- Nếu damageLevel > 60% → Ưu tiên UỐN ACID hoặc UỐN LẠNH
- Nếu damageLevel 30-60% → Có thể uốn nóng nhưng cần pre-treatment
- Nếu damageLevel < 30% → UỐN NÓNG bình thường
- Nếu porosity = HIGH → Cần xử lý thời gian ngắn hơn

CÔNG THỨC CẦN TẠO:

1. PRODUCT:
   - Tên sản phẩm Plexis cụ thể
   - Strength/Type (S1, S2, Acid, etc.)

2. PRE-TREATMENT:
   - Có cần pre-treatment không?
   - Plexis Treatment thời gian bao lâu?

3. MAIN PROCESS:
   - Sản phẩm chính
   - Thời gian xử lý (phút)
   - Test elasticity khi nào?

4. SETTING:
   - Rod size (3.0, 3.2, 3.5, 3.8, 4.0)
   - Nhiệt độ (nếu uốn nóng)
   - Thời gian setting

5. NEUTRALIZER:
   - Thời gian trung hòa (thường 7 phút + 5 phút)

6. POST-TREATMENT:
   - Dưỡng sau uốn
   - Sealing

TRẢ VỀ JSON:
{
  "formulaType": "PERM_HOT",
  "permProduct": "Plexis Acid Aqua Gloss Curl 7.5",
  "permStrength": "Acid",
  "preTreatment": "Plexis Treatment 3 phút",
  "permTime": 15,
  "permSetting": "3.2",
  "permHeat": 150,
  "permSteps": [
    "Pre-treatment: Plexis Treatment 3 phút",
    "Bôi Acid Curl 7.5 đều",
    "Xử lý 13-15 phút, test elasticity sau 10 phút",
    "Setting size 3.2, nhiệt 145-150°C",
    "Giữ nhiệt 8-9 phút",
    "Trung hòa 7 phút + 5 phút",
    "Dưỡng và sealing"
  ],
  "postTreatment": "Plexis After Treatment + Nano mist",
  "warnings": [
    "Không nên tăng độ xoăn tránh già form",
    "Test elasticity kỹ trước khi setting"
  ],
  "notes": [
    "Tóc hư tổn nhẹ, cần dưỡng kỹ sau uốn"
  ],
  "riskLevel": "MEDIUM",
  "riskFactors": ["Tóc có độ hư tổn 22%"],
  "confidence": 0.85
}
`;
}

