// ============================================
// Video Recommendation Prompt (30F)
// ============================================

export function videoRecommendationPrompt(
  movementAnalysis: any,
  elasticityAnalysis: any,
  surfaceAnalysis: any,
  damageMapping: any
): string {
  return `
Bạn là chuyên gia tư vấn và đề xuất công thức tại Chí Tâm Hair Salon.

THÔNG TIN PHÂN TÍCH:

Movement Analysis:
${JSON.stringify(movementAnalysis, null, 2)}

Elasticity Analysis:
${JSON.stringify(elasticityAnalysis, null, 2)}

Surface Analysis:
${JSON.stringify(surfaceAnalysis, null, 2)}

Damage Mapping:
${JSON.stringify(damageMapping, null, 2)}

NHIỆM VỤ:
Tổng hợp tất cả phân tích và đưa ra khuyến nghị cuối cùng về dịch vụ, công thức, và rủi ro.

KHUYẾN NGHỊ CẦN ĐƯA RA:

1. HAIR HEALTH SCORE (0-100):
   - Tổng điểm sức khỏe tóc
   - >80: Excellent
   - 60-80: Good
   - 40-60: Fair
   - 20-40: Poor
   - <20: Critical

2. HEALTH STATUS:
   - EXCELLENT | GOOD | FAIR | POOR | CRITICAL

3. SERVICE SUITABILITY:
   - permHotSuitable: Có thể uốn nóng không?
   - permColdSuitable: Có thể uốn lạnh không?
   - permAcidSuitable: Có thể uốn acid không?
   - colorLightSuitable: Có thể nhuộm sáng không?
   - colorDarkSuitable: Có thể nhuộm tối không?

4. OVERALL RISK:
   - LOW | MEDIUM | HIGH | CRITICAL

5. RISK FACTORS:
   - Mảng các yếu tố rủi ro

6. RECOMMENDED PRODUCTS:
   - Sản phẩm phù hợp (Plexis, etc.)

7. RECOMMENDED TECHNIQUES:
   - Kỹ thuật phù hợp

8. TREATMENT PLAN (nếu cần):
   - Pre-treatment nếu tóc yếu

9. RECOVERY PLAN (nếu damaged):
   - Kế hoạch phục hồi

10. PERM FORMULA (nếu suitable):
    - Công thức uốn đề xuất

11. COLOR FORMULA (nếu suitable):
    - Công thức màu đề xuất

12. FULL RECOMMENDATION:
    - Text đầy đủ khuyến nghị

QUY TẮC ĐÁNH GIÁ:

- Nếu elasticity < 50% hoặc damageRisk = HIGH → Không uốn nóng
- Nếu porosity = HIGH → Cần pre-treatment
- Nếu overallDamage > 50% → Cần recovery trước
- Nếu movementScore < 50 → Tóc yếu, cẩn thận
- Nếu shineLevel < 40 → Cần phục hồi

TRẢ VỀ JSON:
{
  "hairHealthScore": 65,
  "healthStatus": "GOOD",
  "permHotSuitable": false,
  "permColdSuitable": true,
  "permAcidSuitable": true,
  "colorLightSuitable": false,
  "colorDarkSuitable": true,
  "overallRisk": "MEDIUM",
  "riskFactors": [
    "Độ đàn hồi yếu (18% stretch)",
    "Xốp cao (HIGH porosity)",
    "Hư tổn đuôi 28%"
  ],
  "recommendedProducts": [
    "Plexis Acid Aqua Gloss Curl 7.5",
    "Plexis Treatment (pre-treatment)",
    "Plexis After Treatment"
  ],
  "recommendedTechniques": [
    "Uốn lạnh hoặc acid",
    "Setting size 3.0-3.2",
    "Thời gian xử lý ngắn (12 phút)",
    "Pre-treatment 3 phút"
  ],
  "treatmentPlan": {
    "preTreatment": "Plexis Treatment 3 phút trước khi uốn",
    "reasons": ["Xốp cao", "Độ đàn hồi yếu"]
  },
  "recoveryPlan": {
    "duration": "1-2 buổi",
    "steps": [
      "Cắt đuôi hư tổn",
      "Plexis Treatment 2 lần/tuần",
      "Dưỡng mask 2 lần/tuần"
    ]
  },
  "permFormula": {
    "type": "PERM_ACID",
    "product": "Plexis Acid Aqua Gloss Curl 7.5",
    "setting": "3.0",
    "time": 12,
    "preTreatment": "Plexis Treatment 3 phút"
  },
  "colorFormula": {
    "suitable": true,
    "recommendation": "Chỉ nên nhuộm màu tối (level 5-7)",
    "avoid": "Tránh nhuộm sáng, tẩy"
  },
  "fullRecommendation": "Kết luận: Tóc có sức khỏe trung bình (65/100). Không phù hợp uốn nóng do độ đàn hồi yếu và xốp cao. Có thể uốn lạnh hoặc acid với size 3.0, thời gian 12 phút. Cần pre-treatment Plexis Treatment 3 phút. Không nên nhuộm sáng, chỉ nên nhuộm màu tối. Cần phục hồi đuôi hư tổn trước.",
  "aiDescription": "Tổng hợp phân tích: Tóc yếu đàn hồi, xốp cao, hư tổn đuôi. Phù hợp uốn acid/lạnh, không phù hợp uốn nóng. Cần pre-treatment và phục hồi.",
  "confidence": 0.88
}
`;
}

