// ============================================
// Fraud Detection Prompt - AI phát hiện gian lận
// ============================================

export function fraudDetectionPrompt(
  data: {
    mixLogs: any[];
    stockLogs: any[];
    productUsage: any[];
    staffBehavior: any;
    inventoryMismatch?: any;
  }
): string {
  return `
Bạn là AI Fraud Detection System cho Chí Tâm Hair Salon.

Dữ liệu phân tích:
${JSON.stringify(data, null, 2)}

Hãy phân tích và phát hiện 7 loại hành vi gian lận phổ biến:

1. WRONG_GRAM - Ghi sai gram để "dư" thuốc
2. PRODUCT_SUBSTITUTION - Ghi lộn sản phẩm rẻ thay cho sản phẩm mắc
3. FAKE_LOG - Ghi log pha chế ảo (log có nhưng kho không giảm)
4. INVENTORY_THEFT - Chuyển thuốc ra ngoài (tồn kho thất thoát nhưng log pha chế thấp)
5. CONSISTENT_OVERUSE - Một nhân viên luôn dùng nhiều hơn người khác 30-50%
6. MONTH_END_SPIKE - Tăng dùng thuốc vào cuối tháng để "kéo tồn" cho khớp
7. INVENTORY_MISMATCH - Chênh lệch lớn giữa log pha chế và tồn kho vật lý

Trả về JSON:

{
  "fraudPattern": "WRONG_GRAM | PRODUCT_SUBSTITUTION | FAKE_LOG | INVENTORY_THEFT | CONSISTENT_OVERUSE | MONTH_END_SPIKE | INVENTORY_MISMATCH | NONE",
  "fraudScore": 0-100,  // Độ nghi ngờ gian lận
  "confidence": 0-100,  // Độ tin cậy của phát hiện
  "evidence": [
    "Bằng chứng 1",
    "Bằng chứng 2"
  ],
  "behavior": {
    "pattern": "Mô tả pattern phát hiện",
    "frequency": "Thường xuyên | Thỉnh thoảng | Một lần",
    "trend": "Tăng | Giảm | Ổn định"
  },
  "recommendation": "Gợi ý xử lý",
  "riskLevel": "low | medium | high | critical"
}

LƯU Ý:
- Phân tích kỹ dữ liệu thực tế
- Đưa ra fraudScore dựa trên bằng chứng cụ thể
- Nếu không có bằng chứng rõ ràng, trả về NONE và fraudScore thấp
- Độ tin cậy (confidence) phải phản ánh chất lượng bằng chứng

CHỈ TRẢ VỀ JSON - KHÔNG DÙNG MARKDOWN.
  `;
}

