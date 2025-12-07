// ============================================
// AI Prompt for Partner Performance Analysis
// ============================================

export async function analyzePartnerPerformance(data: any): Promise<{
  analysis: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}> {
  const prompt = `
Bạn là AI chuyên phân tích hiệu suất salon. Hãy phân tích dữ liệu sau và đưa ra nhận xét chi tiết:

**Thông tin Partner:**
- Salon: ${data.salonName}
- Kỳ phân tích: ${data.periodStart} - ${data.periodEnd}

**Chỉ số:**
- Doanh thu: ${data.revenue.toLocaleString('vi-VN')} VNĐ
- Lợi nhuận: ${data.profit.toLocaleString('vi-VN')} VNĐ
- Số khách hàng: ${data.totalCustomers}
- Số dịch vụ: ${data.totalServices}
- Điểm chất lượng trung bình: ${data.avgQualityScore?.toFixed(1) || 'N/A'}/100
- Tỷ lệ lỗi: ${data.errorRate.toFixed(2)}%
- Chi phí sản phẩm: ${data.productCost.toLocaleString('vi-VN')} VNĐ

**Yêu cầu phân tích:**
1. Điểm mạnh (3-5 điểm)
2. Điểm yếu cần cải thiện (3-5 điểm)
3. Đề xuất hành động cụ thể (3-5 đề xuất)

Hãy trả về kết quả dưới dạng JSON:
{
  "analysis": "Phân tích chi tiết...",
  "strengths": ["Điểm mạnh 1", "Điểm mạnh 2", ...],
  "weaknesses": ["Điểm yếu 1", "Điểm yếu 2", ...],
  "recommendations": ["Đề xuất 1", "Đề xuất 2", ...]
}
`;

  // In production, call OpenAI or your AI service
  // For now, return mock analysis
  return {
    analysis: `Salon ${data.salonName} đạt doanh thu ${data.revenue.toLocaleString('vi-VN')} VNĐ trong kỳ này. Chất lượng dịch vụ ${data.avgQualityScore && data.avgQualityScore >= 85 ? 'tốt' : 'cần cải thiện'} với điểm ${data.avgQualityScore?.toFixed(1) || 'N/A'}/100.`,
    strengths: [
      `Doanh thu ổn định: ${data.revenue.toLocaleString('vi-VN')} VNĐ`,
      data.totalCustomers > 100 ? "Số lượng khách hàng tốt" : "Đang phát triển khách hàng",
      data.errorRate < 5 ? "Tỷ lệ lỗi thấp" : "Cần giảm lỗi kỹ thuật",
    ],
    weaknesses: [
      data.errorRate > 10 ? `Tỷ lệ lỗi cao: ${data.errorRate.toFixed(2)}%` : "Tỷ lệ lỗi đang được kiểm soát",
      data.avgQualityScore && data.avgQualityScore < 80 ? `Chất lượng dịch vụ cần cải thiện: ${data.avgQualityScore.toFixed(1)}/100` : "Chất lượng dịch vụ đang tốt",
      data.productCost / data.revenue > 0.3 ? "Chi phí sản phẩm cao so với doanh thu" : "Chi phí sản phẩm hợp lý",
    ],
    recommendations: [
      data.errorRate > 10 ? "Tổ chức training lại về SOP và kỹ thuật" : "Duy trì chất lượng hiện tại",
      data.avgQualityScore && data.avgQualityScore < 85 ? "Tăng cường giám sát chất lượng dịch vụ" : "Tiếp tục duy trì chuẩn chất lượng",
      "Xem xét các chương trình marketing để tăng số khách hàng mới",
    ],
  };
}

