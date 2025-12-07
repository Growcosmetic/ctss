# PHASE 32 — FINANCIAL MODULE & PROFIT CONTROL

## Tổng quan

Phase 32 biến CTSS thành hệ thống quản lý tài chính hoàn chỉnh cấp doanh nghiệp, giúp salon quản lý toàn bộ chi phí, doanh thu, lãi/lỗ, và dòng tiền một cách chuyên nghiệp.

**Tính năng chính:**
- ✅ Revenue data pipeline - Thu thập doanh thu từ nhiều nguồn
- ✅ Expense management - Quản lý chi phí chi tiết
- ✅ COGS calculation - Tự động tính chi phí nguyên vật liệu
- ✅ Profit engine - Tính lãi gộp, lãi vận hành, lãi ròng
- ✅ Cashflow tracking - Theo dõi dòng tiền real-time
- ✅ Financial forecasting AI - Dự đoán doanh thu, lợi nhuận
- ✅ Risk alerts - Cảnh báo rủi ro tài chính
- ✅ CEO Financial Dashboard - Dashboard tổng hợp

**CTSS giờ = ERP doanh nghiệp cấp quốc tế!**

---

## Các Module

### 32A — Revenue Data Pipeline

**Thu thập doanh thu từ nhiều nguồn:**
- SERVICE: Doanh thu từ dịch vụ
- PRODUCT: Bán sản phẩm
- COMBO: Combo kỹ thuật
- UPSELL: Upsale
- TIPS: Tips
- PARTNER_FEE: Phí franchise/partner
- PREPAYMENT: Thanh toán trước booking

**API Endpoint:**
```
POST /api/financial/revenue/create

Body:
{
  "date": "2024-01-15",
  "amount": 550000,
  "source": "SERVICE",
  "paymentMethod": "CASH",
  "branchId": "branch_id",
  "serviceId": "service_id",
  "invoiceId": "invoice_id",
  "customerId": "customer_id",
  "staffId": "staff_id"
}

GET /api/financial/revenue?startDate=2024-01-01&endDate=2024-01-31
```

---

### 32B — Expense Management

**Quản lý chi phí theo category:**
- PRODUCT: Chi phí sản phẩm
- STAFF: Chi phí nhân sự
- UTILITY: Điện, nước
- RENT: Mặt bằng
- MARKETING: Marketing
- TRAINING: Đào tạo
- DEPRECIATION: Khấu hao
- OPERATION: Vận hành
- TOOLS_SUPPLIES: Công cụ & vật tư

**Features:**
- Receipt/invoice upload
- Approval workflow
- Recurring expenses
- Category breakdown

**API Endpoint:**
```
POST /api/financial/expense/create

Body:
{
  "date": "2024-01-15",
  "amount": 12450000,
  "category": "PRODUCT",
  "subCategory": "Plexis Purchase",
  "description": "Mua Plexis nhập sỉ",
  "branchId": "branch_id",
  "receiptUrl": "url_to_receipt",
  "vendor": "Supplier Name"
}
```

---

### 32C — COGS & Product Cost Engine

**Tự động tính chi phí nguyên vật liệu:**
- Tính theo gram/ml
- Tính theo từng dịch vụ
- Track product usage
- Per-unit COGS

**API Endpoint:**
```
POST /api/financial/cogs/calculate

Body:
{
  "serviceId": "service_id",
  "bookingId": "booking_id",
  "productsUsed": [
    {
      "productId": "product_id",
      "quantity": 80,
      "unit": "g"
    }
  ]
}

Response:
{
  "totalCOGS": 92000,
  "productsUsed": [
    {
      "productName": "Plexis S1",
      "quantity": 80,
      "unitCost": 1150,
      "totalCost": 92000
    }
  ]
}
```

---

### 32D — Profit Engine

**Tính toán lợi nhuận:**
- **Gross Profit** = Revenue - COGS
- **Gross Margin** = (Gross Profit / Revenue) × 100
- **Operating Profit** = Gross Profit - Operating Expenses
- **Operating Margin** = (Operating Profit / Revenue) × 100
- **Net Profit** = Operating Profit - Taxes - Depreciation
- **Net Margin** = (Net Profit / Revenue) × 100

**API Endpoint:**
```
POST /api/financial/profit/calculate

Body:
{
  "periodStart": "2024-01-01",
  "periodEnd": "2024-01-31",
  "periodType": "MONTHLY",
  "branchId": "branch_id"
}

Response:
{
  "totalRevenue": 480000000,
  "totalCOGS": 42600000,
  "operatingExpenses": 138000000,
  "grossProfit": 437400000,
  "grossMargin": 91.1,
  "netProfit": 299400000,
  "netMargin": 62.4
}
```

---

### 32E — Cashflow Tracking

**Theo dõi dòng tiền:**
- Inflow (tiền vào)
- Outflow (tiền ra)
- Net cashflow
- Opening/Closing balance
- Payment methods breakdown

**API Endpoint:**
```
POST /api/financial/cashflow/calculate

Body:
{
  "date": "2024-01-15",
  "branchId": "branch_id"
}

Response:
{
  "totalInflow": 78500000,
  "totalOutflow": 22300000,
  "netCashflow": 56200000,
  "openingBalance": 150000000,
  "closingBalance": 206200000,
  "cashAmount": 30000000,
  "cardAmount": 30000000,
  "transferAmount": 18500000
}
```

---

### 32F — Financial Forecasting AI

**Dự đoán tài chính:**
- Forecast revenue
- Forecast expenses
- Forecast profit
- Factors & assumptions
- Confidence scores
- Recommendations

**API Endpoint:**
```
POST /api/financial/forecast

Body:
{
  "periodType": "MONTHLY",
  "periods": 1,
  "branchId": "branch_id"
}

Response:
{
  "forecastRevenue": 520000000,
  "forecastExpenses": 180000000,
  "forecastProfit": 340000000,
  "revenueChangePercent": 14.3,
  "confidence": 0.82,
  "factors": {
    "bookingTrend": "increasing",
    "seasonalEvents": ["Tết season approaching"]
  },
  "recommendations": [
    "Tăng booking online để đạt forecast",
    "Chuẩn bị sản phẩm cho mùa Tết"
  ]
}
```

---

### 32G — Financial Risk Alerts

**Cảnh báo rủi ro:**
- COGS_INCREASE: COGS tăng bất thường
- REVENUE_DECREASE: Doanh thu giảm
- EXPENSE_SPIKE: Chi phí tăng đột biến
- LOSS_MARGIN: Margin giảm nghiêm trọng
- WASTAGE_HIGH: Hao hụt cao
- STAFF_COST_HIGH: Chi phí nhân sự vượt mức
- MARKETING_INEFFICIENT: Marketing kém hiệu quả
- UPSELL_DECREASE: Upsale giảm

**API Endpoint:**
```
POST /api/financial/risk-alerts/check

Body:
{
  "periodStart": "2024-01-01",
  "periodEnd": "2024-01-31",
  "branchId": "branch_id"
}

Response:
{
  "alerts": [
    {
      "alertType": "COGS_INCREASE",
      "severity": "HIGH",
      "title": "COGS tăng 17% so với tháng trước",
      "message": "COGS hiện tại: 50,000,000 (tháng trước: 42,600,000)",
      "changePercent": 17.4,
      "recommendations": [
        "Kiểm soát định lượng S1: 80g -> 65g",
        "Training lại stylist về định lượng"
      ]
    }
  ]
}
```

---

### 32H — CEO Financial Dashboard

**Dashboard tổng hợp:**
- Overview metrics (Revenue, Expenses, Profit, Margins)
- Cashflow summary
- Revenue/Expense breakdowns
- Revenue trends (chart data)
- Top revenue-generating services
- Financial forecasts
- Active risk alerts

**API Endpoint:**
```
GET /api/financial/dashboard?periodStart=2024-01-01&periodEnd=2024-01-31

Response:
{
  "overview": {
    "totalRevenue": 480000000,
    "totalExpenses": 138000000,
    "totalCOGS": 42600000,
    "grossProfit": 437400000,
    "grossMargin": 91.1,
    "netProfit": 299400000,
    "netMargin": 62.4
  },
  "cashflow": {...},
  "breakdowns": {...},
  "trends": {...},
  "topServices": [...],
  "forecasts": [...],
  "alerts": [...]
}
```

---

## Database Schema

### Revenue
- Tất cả doanh thu từ mọi nguồn
- Tracking by source, payment method, branch, customer, staff

### Expense
- Tất cả chi phí với categories
- Receipt tracking, approval workflow
- Recurring expenses support

### COGSCalculation
- Product cost calculations
- Per-service COGS tracking
- Product usage details

### ProfitCalculation
- Period-based profit calculations
- Gross, Operating, Net profit
- Margin calculations
- Breakdowns by category

### Cashflow
- Daily cashflow tracking
- Inflow/Outflow breakdown
- Balance tracking
- Payment methods

### FinancialForecast
- AI-generated forecasts
- Confidence scores
- Factors and assumptions
- Recommendations

### FinancialRiskAlert
- Risk detection alerts
- Severity levels
- Recommendations
- Status tracking

### FinancialMetric
- Aggregated metrics
- Period-based summaries

---

## Workflow Examples

### Example 1: Record Service Revenue
```javascript
// When service completed
await fetch('/api/financial/revenue/create', {
  method: 'POST',
  body: JSON.stringify({
    date: new Date(),
    amount: 550000,
    source: 'SERVICE',
    serviceId: 'service_id',
    invoiceId: 'invoice_id',
    customerId: 'customer_id',
    staffId: 'staff_id',
    branchId: 'branch_id'
  })
});
```

### Example 2: Calculate Profit
```javascript
// Monthly profit calculation
const profit = await fetch('/api/financial/profit/calculate', {
  method: 'POST',
  body: JSON.stringify({
    periodStart: '2024-01-01',
    periodEnd: '2024-01-31',
    periodType: 'MONTHLY',
    branchId: 'branch_id'
  })
});

console.log(`Net Profit: ${profit.data.netProfit}`);
console.log(`Net Margin: ${profit.data.netMargin}%`);
```

### Example 3: Daily Cashflow
```javascript
// Calculate daily cashflow
const cashflow = await fetch('/api/financial/cashflow/calculate', {
  method: 'POST',
  body: JSON.stringify({
    date: '2024-01-15',
    branchId: 'branch_id'
  })
});

console.log(`Net Cashflow: ${cashflow.data.netCashflow}`);
```

---

## Benefits

✅ **Complete financial control** - Biết chính xác salon lời/lỗ  
✅ **Real-time tracking** - Theo dõi dòng tiền real-time  
✅ **Automated calculations** - Tự động tính lãi/lỗ, COGS  
✅ **Risk detection** - Phát hiện rủi ro sớm  
✅ **AI forecasting** - Dự đoán tài chính thông minh  
✅ **Enterprise-grade** - Module tài chính cấp doanh nghiệp  

---

## Phase 32 Complete ✅

**Salon Chí Tâm giờ đây có:**
- ✅ Hệ thống quản lý tài chính hoàn chỉnh
- ✅ Theo dõi doanh thu từ mọi nguồn
- ✅ Quản lý chi phí chi tiết
- ✅ Tự động tính lãi/lỗ, COGS, margins
- ✅ Theo dõi dòng tiền real-time
- ✅ AI dự đoán tài chính
- ✅ Cảnh báo rủi ro tự động
- ✅ CEO Financial Dashboard đỉnh cao

**CTSS = ERP doanh nghiệp cấp quốc tế.**

**Không salon nào ở Việt Nam có module tài chính như vậy! 🚀💰**

