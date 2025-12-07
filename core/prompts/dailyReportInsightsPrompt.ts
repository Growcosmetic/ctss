// ============================================
// Daily Report Insights Prompt - AI phân tích báo cáo
// ============================================

export function dailyReportInsightsPrompt(reportData: any): string {
  return `
Bạn là AI Business Analyst chuyên nghiệp cho Chí Tâm Hair Salon.

BÁO CÁO CUỐI NGÀY:
${JSON.stringify(reportData, null, 2)}

Hãy phân tích và đưa ra insights, trả về JSON:

{
  "strengths": [
    "Điểm mạnh 1",
    "Điểm mạnh 2"
  ],
  "risks": [
    {
      "type": "LOSS | INVENTORY | STAFF | COST",
      "severity": "LOW | MEDIUM | HIGH",
      "description": "Mô tả rủi ro",
      "impact": "Tác động"
    }
  ],
  "predictions": [
    "Dự báo 1 cho ngày mai",
    "Dự báo 2"
  ],
  "recommendations": [
    {
      "priority": "HIGH | MEDIUM | LOW",
      "action": "Hành động đề xuất",
      "reason": "Lý do"
    }
  ],
  "summary": "Tóm tắt tổng quan 2-3 câu về ngày làm việc"
}

LƯU Ý:
- Phân tích dựa trên dữ liệu thực tế
- Điểm mạnh: tập trung vào thành tích tốt (tiết kiệm, doanh thu, hiệu suất)
- Rủi ro: xác định vấn đề tiềm ẩn (hao hụt cao, tồn kho thấp, nhân viên dùng dư)
- Dự báo: dựa trên trend và patterns (ngày mai, tuần tới)
- Recommendations: hành động cụ thể, ưu tiên cao trước
- Summary: tóm tắt ngắn gọn, dễ hiểu

CHỈ TRẢ VỀ JSON - KHÔNG DÙNG MARKDOWN.
  `;
}

