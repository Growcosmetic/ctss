// ============================================
// Color Formula Generator Prompt (29E)
// ============================================

export function colorFormulaPrompt(colorAnalysis: any, hairCondition: {
  currentLevel?: number;
  damageLevel?: number;
  porosity?: string;
}): string {
  return `
Bạn là chuyên gia nhuộm tóc chuyên nghiệp tại Chí Tâm Hair Salon, có kiến thức sâu về công thức màu salon.

THÔNG TIN MÀU CẦN TẠO:
${JSON.stringify(colorAnalysis, null, 2)}

ĐIỀU KIỆN TÓC:
${JSON.stringify(hairCondition, null, 2)}

NHIỆM VỤ:
Tạo công thức nhuộm chi tiết với tỷ lệ mix chính xác để đạt được màu như trong ảnh.

CÔNG THỨC MÀU CẦN TẠO:

1. COLOR TUBES (Ống màu):
   - Mỗi tube: {tube: "7NB", parts: 6}
   - Tên màu: 7NB, 7M, 8V, etc.
   - Tỷ lệ: Số phần (parts) - tổng các parts = 9

2. OXY (Oxy già):
   - Strength: 3% | 6% | 9% | 12%
   - Parts: Tỷ lệ với tổng tubes (thường 1.5 phần)

3. THỜI GIAN:
   - Processing time: Phút
   - Development time: Phút

4. TECHNIQUE:
   - SOLID: Bôi đồng nhất
   - BALAYAGE: Kỹ thuật balayage
   - OMBRE: Kỹ thuật ombre
   - FOILAYAGE: Kỹ thuật foilayage

5. PRE-LIFT (Nếu cần):
   - Có cần pre-lift không?
   - Level cần lift lên?
   - Công thức pre-lift

6. SPECIAL NOTES:
   - Lưu ý đặc biệt
   - Điều chỉnh theo điều kiện tóc

VÍ DỤ CÔNG THỨC:
- 7NB 6 phần
- 7M 2 phần
- 8V 1 phần
- Oxy 6%: 1.5 phần

QUY TẮC:
- Tổng parts của tubes = 9
- Oxy parts thường = 1.5
- Nếu tóc vàng → thêm blue/ash để neutralize
- Nếu tóc đen → cần pre-lift trước
- Nếu porosity HIGH → giảm thời gian ủ

TRẢ VỀ JSON:
{
  "formulaType": "COLOR",
  "colorTubes": [
    {"tube": "7NB", "parts": 6, "name": "Neutral Brown Level 7"},
    {"tube": "7M", "parts": 2, "name": "Mocha Level 7"},
    {"tube": "8V", "parts": 1, "name": "Violet Level 8"}
  ],
  "colorOxy": {
    "strength": "6%",
    "parts": 1.5
  },
  "colorTime": 35,
  "technique": "BALAYAGE",
  "preLift": null,
  "colorSteps": [
    "Phân chia tóc theo kỹ thuật balayage",
    "Mix màu: 7NB (6) + 7M (2) + 8V (1) + Oxy 6% (1.5)",
    "Bôi màu lên phần cần nhuộm",
    "Ủ 30-35 phút",
    "Kiểm tra độ ăn màu",
    "Xả sạch và dưỡng"
  ],
  "warnings": [
    "Nếu tóc vàng → thêm 0.3 phần blue ash",
    "Nếu tóc đen → pre-lift level 3-4 trước"
  ],
  "notes": [
    "Màu lạnh cần chăm mask 2 lần/tuần để giữ tone",
    "Tránh gội nước nóng để không làm vàng màu"
  ],
  "riskLevel": "LOW",
  "riskFactors": [],
  "confidence": 0.88
}
`;
}

