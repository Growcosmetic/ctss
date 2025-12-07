// ============================================
// Financial Forecasting Prompt (32F)
// ============================================

export function financialForecastingPrompt(
  historicalData: {
    revenues?: any[];
    expenses?: any[];
    profits?: any[];
    bookings?: any[];
    trends?: any;
  },
  periodType: string = "MONTHLY"
): string {
  return `
Bạn là AI chuyên dự đoán tài chính cho salon tại Chí Tâm Hair Salon.

DỮ LIỆU LỊCH SỬ:

Doanh thu:
${JSON.stringify(historicalData.revenues || [], null, 2)}

Chi phí:
${JSON.stringify(historicalData.expenses || [], null, 2)}

Lợi nhuận:
${JSON.stringify(historicalData.profits || [], null, 2)}

Bookings:
${JSON.stringify(historicalData.bookings || [], null, 2)}

Xu hướng:
${JSON.stringify(historicalData.trends || {}, null, 2)}

NHIỆM VỤ:
Dự đoán doanh thu, chi phí, và lợi nhuận cho kỳ tiếp theo.

PHÂN TÍCH CẦN THIẾT:

1. FORECAST REVENUE:
   - Dự đoán doanh thu dựa trên xu hướng
   - Xem xét: booking trends, seasonality, customer retention
   - Factors: events (Tết, mùa cưới), marketing campaigns, etc.

2. FORECAST EXPENSES:
   - Dự đoán chi phí dựa trên lịch sử
   - Fixed costs vs variable costs
   - Seasonal variations

3. FORECAST PROFIT:
   - Forecast revenue - Forecast expenses
   - Expected margins

4. FACTORS:
   - Các yếu tố ảnh hưởng
   - Booking trends
   - Customer return rate
   - Marketing performance
   - Seasonal events
   - Staff capacity

5. ASSUMPTIONS:
   - Giả định đã sử dụng

6. RECOMMENDATIONS:
   - Khuyến nghị để đạt forecast
   - Cảnh báo rủi ro

TRẢ VỀ JSON:
{
  "forecastRevenue": 520000000,
  "forecastExpenses": 180000000,
  "forecastProfit": 340000000,
  "revenueChangePercent": 14.3,
  "expenseChangePercent": 5.2,
  "profitChangePercent": 18.5,
  "confidence": 0.82,
  "factors": {
    "bookingTrend": "increasing",
    "customerReturn": "stable",
    "seasonalEvents": ["Tết season approaching"],
    "marketingImpact": "positive"
  },
  "assumptions": [
    "Booking rate continues at current trend",
    "Customer return rate maintains 75%",
    "No major expense increases"
  ],
  "recommendations": [
    "Tăng booking online để đạt forecast",
    "Chuẩn bị sản phẩm cho mùa Tết",
    "Monitor chi phí sản phẩm để không vượt budget"
  ],
  "aiAnalysis": "Dự báo doanh thu tháng sau tăng 14.3% do booking tăng và mùa Tết sắp đến. Lợi nhuận dự kiến tăng 18.5% với margin tốt."
}
`;
}

