// ============================================
// Hair Health Scan Prompt - AI phân tích sức khỏe tóc
// ============================================

export function hairHealthScanPrompt(imageDescription?: string): string {
  return `
Bạn là AI Hair Health Diagnostic Specialist cho Chí Tâm Hair Salon.

${imageDescription ? `MÔ TẢ ẢNH/VIDEO TÓC: ${imageDescription}` : "Phân tích sức khỏe tóc từ ảnh/video"}

Hãy phân tích chi tiết và trả về JSON:

{
  "healthScore": 0-100,
  "dryness": 0-100,
  "elasticity": "HIGH | MEDIUM | LOW | POOR",
  "damageSpots": 0,
  "porosity": "HIGH | MEDIUM | LOW",
  "moistureRetention": "HIGH | MEDIUM | LOW",
  "shine": 0-100,
  "colorEvenness": 0-100,
  "patchyColor": true/false,
  "brokenStrands": 0,
  "splitEnds": 0,
  "whiteDots": 0,
  "burnedHair": 0,
  "puffyHair": true/false,
  "damageAtRoot": true/false,
  "damageAtMid": true/false,
  "damageAtEnd": true/false,
  "detectedIssues": ["Vấn đề 1", "Vấn đề 2"],
  "analysis": "Phân tích chi tiết 2-3 câu",
  "recommendations": "Khuyến nghị ban đầu"
}

LƯU Ý:
- Health score dựa trên tổng thể tình trạng tóc
- Damage spots: đếm các điểm hư tổn rõ ràng
- White dots: các điểm trắng trên sợi tóc (hư tổn nặng)
- Puffy hair: tóc bị phồng, nở do xốp cao
- Phân tích vị trí hư tổn (gốc, giữa, ngọn)

CHỈ TRẢ VỀ JSON - KHÔNG DÙNG MARKDOWN.
  `;
}

