// ============================================
// Customer Personality Profile Prompt (31A)
// ============================================

export function customerPersonalityPrompt(
  customerData: {
    bookings?: any[];
    services?: any[];
    feedback?: any[];
    interactions?: any[];
  }
): string {
  return `
Bạn là AI chuyên phân tích tính cách và thẩm mỹ khách hàng tại Chí Tâm Hair Salon.

DỮ LIỆU KHÁCH HÀNG:

Lịch sử booking:
${JSON.stringify(customerData.bookings || [], null, 2)}

Lịch sử dịch vụ:
${JSON.stringify(customerData.services || [], null, 2)}

Phản hồi/Feedback:
${JSON.stringify(customerData.feedback || [], null, 2)}

Tương tác với Mina:
${JSON.stringify(customerData.interactions || [], null, 2)}

NHIỆM VỤ:
Phân tích và tạo hồ sơ tính cách, sở thích, và thẩm mỹ của khách hàng.

PHÂN TÍCH CẦN THIẾT:

1. HAIR PREFERENCES (Gu tóc):
   - curlPreference: LOOSE | MEDIUM | TIGHT | STRAIGHT
   - lengthPreference: SHORT | MEDIUM | LONG | EXTRA_LONG
   - stylePreference: NATURAL | GLAM | CASUAL | ELEGANT

2. COLOR PREFERENCES (Gu màu):
   - colorPreference: Array of colors (e.g., ["brown", "mocha", "beige", "ash brown"])
   - colorTonePreference: WARM | COOL | NEUTRAL
   - colorIntensityPreference: LIGHT | MEDIUM | DARK

3. STYLE VIBE (Phong cách):
   - styleVibe: Array of vibes
     * FEMININE: Nữ tính
     * MINIMAL: Tối giản
     * SEDUCTIVE: Quyến rũ
     * YOUTHFUL: Trẻ trung
     * KOREAN: Style Hàn Quốc
     * MATURE: Trưởng thành
     * SOPHISTICATED: Tinh tế
   - personality: GENTLE | BOLD | ELEGANT | CASUAL | SOPHISTICATED

4. HABITS (Thói quen):
   - hairCareHabits: Array
     * LOW_MAINTENANCE: Ít chăm tóc
     * HEAT_STYLING: Hay kẹp/nhiệt
     * FREQUENT_DYEING: Hay nhuộm
     * NEGLECTFUL: Không chăm sóc
     * REGULAR_CARE: Chăm sóc đều
   - lifestyle: BUSY | RELAXED | ACTIVE

5. COMMUNICATION STYLE (Phong cách giao tiếp):
   - communicationStyle: QUIET | CHATTY | DETAIL_ORIENTED | DECISIVE
   - followUpPreference: SHORT | DETAILED | REMINDER_HEAVY

6. PERSONALITY SUMMARY:
   - Tóm tắt tính cách và sở thích

7. AESTHETIC PROFILE:
   - Chi tiết về thẩm mỹ và gu thời trang

TRẢ VỀ JSON:
{
  "curlPreference": "LOOSE",
  "lengthPreference": "LONG",
  "stylePreference": "NATURAL",
  "colorPreference": ["mocha", "beige", "brown"],
  "colorTonePreference": "COOL",
  "colorIntensityPreference": "MEDIUM",
  "styleVibe": ["FEMININE", "MINIMAL", "KOREAN"],
  "personality": "GENTLE",
  "hairCareHabits": ["LOW_MAINTENANCE", "HEAT_STYLING"],
  "lifestyle": "BUSY",
  "communicationStyle": "QUIET",
  "followUpPreference": "SHORT",
  "personalitySummary": "Khách hàng thích style nhẹ nhàng, tự nhiên, nữ tính theo phong cách Hàn Quốc. Ít chăm tóc, bận rộn, thích tóc dài xoăn lờ. Gu màu lạnh, mocha/beige.",
  "aestheticProfile": {
    "overallStyle": "Minimal Korean",
    "preferredLook": "Natural, gentle, feminine",
    "avoidStyles": ["too curly", "too glam", "too dark colors"]
  },
  "preferencesScore": {
    "curlPreference": 0.85,
    "colorPreference": 0.90,
    "styleVibe": 0.80
  }
}
`;
}

