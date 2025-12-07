// ============================================
// Hairstyle Recommendation Prompt
// ============================================

export function hairstyleRecommendationPrompt(data: {
  faceShape?: string;
  faceVibe?: string;
  hairCondition?: any;
  personalStyle?: string;
  preferences?: string[];
}): string {
  return `
Bạn là AI Hairstyle Recommendation Specialist cho Chí Tâm Hair Salon.

DỮ LIỆU KHÁCH HÀNG:
- Khuôn mặt: ${data.faceShape || "N/A"}
- Vibe: ${data.faceVibe || "N/A"}
- Chất tóc: ${JSON.stringify(data.hairCondition || {})}
- Phong cách: ${data.personalStyle || "N/A"}
- Sở thích: ${data.preferences?.join(", ") || "Không có"}

Hãy đề xuất kiểu tóc phù hợp, trả về JSON:

{
  "recommendedStyle": "Tên kiểu tóc",
  "styleCategory": "LAYER | CURL | STRAIGHT | BOB | MULLET",
  "description": "Mô tả kiểu tóc",
  "curlSize": "3.2 | 3.8 | 4.5 | etc. (nếu có xoăn)",
  "layerStyle": "LONG_LAYER | SHORT_LAYER | TEXTURED",
  "length": "LONG | MEDIUM | SHORT",
  "recommendedProduct": "Plexis S1 | S2 | Acid Aqua Gloss | etc.",
  "permSetting": {
    "time": "14-16 phút",
    "temperature": "145°C",
    "rodSize": "3.2"
  },
  "reasons": ["Lý do 1", "Lý do 2"],
  "benefits": ["Lợi ích 1", "Lợi ích 2"],
  "warnings": ["Lưu ý (nếu có)"],
  "confidence": 0-100,
  "matchScore": 0-100,
  "faceShapeMatch": {
    "description": "Cách kiểu tóc bổ sung cho khuôn mặt"
  },
  "alternatives": [
    {
      "style": "Tên kiểu thay thế",
      "reason": "Lý do"
    }
  ]
}

KIỂU TÓC PHỔ BIẾN:
- Layer Hàn dài
- Xoăn lơi 3.2
- Xoăn sóng nước 3.8
- Uốn lạnh sương mù
- Tóc ngắn bob Hàn
- Xoăn Hime
- Mullet nữ

CHỈ TRẢ VỀ JSON - KHÔNG DÙNG MARKDOWN.
  `;
}

