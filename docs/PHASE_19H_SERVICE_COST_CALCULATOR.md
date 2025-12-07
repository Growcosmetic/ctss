# Phase 19H - Service Cost Calculator

Hệ thống tính chi phí dịch vụ theo gram, tự động tính lãi/lỗ và tối ưu.

## 🎯 Mục tiêu

Tạo hệ thống:
- Tính chi phí sản phẩm cho từng dịch vụ
- Tự động tính lãi/lỗ theo từng dịch vụ
- So sánh giữa các stylist
- Dự đoán tồn kho
- Kiểm soát chi phí theo ngày/tháng
- AI tối ưu chi phí

## 📋 Công Thức

### Chi Phí Dịch Vụ
```
cost = sum( quantity(g) × pricePerUnit )
```

### Lợi Nhuận
```
profit = servicePrice - cost
margin% = (profit / servicePrice) × 100
```

## 🗂️ Files Structure

```
prisma/
└── schema.prisma              # ServiceCost model

core/
└── prompts/
    └── costOptimizationPrompt.ts  # AI cost optimization

app/
├── api/
│   └── services/
│       ├── route.ts           # List services
│       └── cost/
│           ├── calculate/
│           │   └── route.ts   # Calculate service cost
│           ├── analysis/
│           │   └── route.ts   # Analyze by stylist
│           ├── comparison/
│           │   └── route.ts   # Compare services
│           └── optimize/
│               └── route.ts   # AI optimization
└── (dashboard)/
    └── services/
        └── cost/
            └── page.tsx       # Service Cost Calculator UI
```

## 📊 Prisma Model

### ServiceCost
```prisma
model ServiceCost {
  id            String   @id @default(cuid())
  serviceId     String
  visitId       String?
  invoiceId     String?
  productId     String
  quantityUsed  Float    // gram/ml
  unitPrice     Float
  totalCost     Float    // quantityUsed × unitPrice
  servicePrice  Float?
  margin        Float?   // Margin %
  createdAt     DateTime @default(now())
}
```

## 🚀 API Endpoints

### POST /api/services/cost/calculate

Calculate service cost.

**Request:**
```json
{
  "serviceId": "service_id",
  "servicePrice": 650000,
  "items": [
    { "productId": "product_id", "quantity": 35 },
    { "productId": "product_id2", "quantity": 40 }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "serviceId": "...",
  "servicePrice": 650000,
  "totalCost": 81000,
  "profit": 569000,
  "margin": 87.5,
  "items": [...],
  "breakdown": {
    "costPercentage": 12.5,
    "profitPercentage": 87.5
  }
}
```

### GET /api/services/cost/analysis

Analyze costs by stylist.

**Query Params:**
- `staffId`: Filter by staff
- `serviceId`: Filter by service
- `startDate`, `endDate`: Date range

### GET /api/services/cost/comparison

Compare costs between services.

### GET /api/services/cost/optimize

AI cost optimization.

**Query Params:**
- `productId`: Required
- `quantity`: Current quantity
- `serviceId`: Optional

## 🎨 UI Features

### Service Cost Calculator Page
- Service selection
- Product selection with real-time calculation
- Cost breakdown table
- Profit & margin display
- Color-coded margin (red < 70%, yellow 70-80%, green > 80%)

## ✅ Phase 19H Checklist

- ✅ Prisma Model (ServiceCost)
- ✅ API Calculate Cost
- ✅ API Analysis by Stylist
- ✅ API Service Comparison
- ✅ AI Cost Optimization
- ✅ UI Service Cost Calculator
- ✅ Real-time Calculation
- ✅ Cost Breakdown Display

## 🎉 Kết quả

Sau Phase 19H, salon đã có:
- ✅ Hệ thống tính chi phí dịch vụ theo gram
- ✅ Tự động tính lãi/lỗ
- ✅ Phân tích chi phí theo stylist
- ✅ So sánh dịch vụ
- ✅ AI tối ưu chi phí
- ✅ Real-time cost calculation
- ✅ Cost breakdown visualization

**Hệ thống tính chi phí dịch vụ chuyên nghiệp nhất Việt Nam!**

