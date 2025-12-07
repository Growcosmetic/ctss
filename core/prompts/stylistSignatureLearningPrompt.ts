// ============================================
// Stylist Signature Style Learning Prompt (31B)
// ============================================

export function stylistSignatureLearningPrompt(
  stylistData: {
    services?: any[];
    bookings?: any[];
    feedback?: any[];
    qualityScores?: any[];
  }
): string {
  return `
Bạn là AI chuyên phân tích và học phong cách riêng của từng stylist tại Chí Tâm Hair Salon.

DỮ LIỆU STYLIST:

Lịch sử dịch vụ:
${JSON.stringify(stylistData.services || [], null, 2)}

Lịch sử booking:
${JSON.stringify(stylistData.bookings || [], null, 2)}

Feedback khách hàng:
${JSON.stringify(stylistData.feedback || [], null, 2)}

Quality scores:
${JSON.stringify(stylistData.qualityScores || [], null, 2)}

NHIỆM VỤ:
Phân tích và học phong cách signature của stylist này.

PHÂN TÍCH CẦN THIẾT:

1. SPECIALTIES (Chuyên môn):
   - Array of specialties:
     * PERM_HOT: Uốn nóng
     * PERM_COLD: Uốn lạnh
     * PERM_ACID: Uốn acid
     * COLOR_COLD: Màu lạnh
     * COLOR_WARM: Màu ấm
     * BOB: Kiểu bob
     * LAYER: Kiểu layer
     * LONG_WAVE: Sóng dài
     etc.

2. PREFERRED CURL SIZE:
   - Array of curl sizes stylist prefers (e.g., ["3.2", "3.5", "3.8"])

3. PREFERRED COLOR TONES:
   - Array of color tones (e.g., ["cool", "mocha", "ash", "beige"])

4. PREFERRED TECHNIQUES:
   - Array of techniques (e.g., ["balayage", "foilayage", "acid curl"])

5. SIGNATURE STYLE:
   - Mô tả phong cách signature

6. STYLE STRENGTH:
   - Object với strength scores cho các areas

7. TYPICAL RESULTS:
   - Kết quả điển hình stylist đạt được

8. COMMON FORMULAS:
   - Công thức thường dùng

9. SUCCESSFUL STYLES:
   - Các kiểu thành công nhất

10. PREFERRED SETTINGS:
    - Settings/parameters ưa thích

TRẢ VỀ JSON:
{
  "specialties": ["PERM_HOT", "KOREAN_STYLE", "LAYER"],
  "preferredCurlSize": ["3.2", "3.5"],
  "preferredColorTones": ["mocha", "beige", "cool brown"],
  "preferredTechniques": ["acid curl", "balayage"],
  "signatureStyle": "Phong cách Hàn Quốc, uốn nóng nhẹ nhàng, xoăn lờ 3.2-3.5, màu lạnh mocha/beige. Style mềm mại, tự nhiên, giữ form dài.",
  "styleStrength": {
    "perm_hot": 0.95,
    "korean_style": 0.90,
    "color_cool": 0.85,
    "layer": 0.88
  },
  "typicalResults": {
    "perm": "Xoăn mềm mại, tự nhiên, giữ nếp tốt",
    "color": "Màu lạnh blend mịn, tone sáng đẹp",
    "overall": "Style Hàn Quốc, nhẹ nhàng, nữ tính"
  },
  "commonFormulas": [
    {
      "type": "PERM",
      "product": "Plexis Acid Aqua Gloss Curl 7.5",
      "setting": "3.2-3.5",
      "time": 12-15
    }
  ],
  "successfulStyles": ["Long layer + soft curl 3.2", "Bob + cool mocha"],
  "preferredSettings": {
    "perm_heat": 145-150,
    "color_oxy": "6%",
    "curl_size": "3.2-3.5"
  }
}
`;
}

