# Phase 19L - Monthly Summary Dashboard

Báo cáo tổng hợp tháng - CEO Dashboard.

## 🎯 Mục tiêu

- Nắm doanh thu, lợi nhuận, chi phí sản phẩm
- Kiểm soát tồn kho, hao hụt
- Đánh giá nhân viên
- Phát hiện thất thoát theo tháng
- Biết dịch vụ nào lời nhất/lỗ nhất
- Đọc báo cáo dạng CEO Dashboard
- Quyết định chiến lược tháng sau

## 📋 Components

### 19L.1 - Monthly Revenue Summary
- Tổng doanh thu tháng
- Tổng chi phí sản phẩm
- Lợi nhuận gộp
- Tỷ lệ khách quay lại
- So sánh với tháng trước

### 19L.2 - Service Performance Analysis
- Doanh thu theo dịch vụ
- Chi phí theo dịch vụ
- Lợi nhuận theo dịch vụ
- Xu hướng dịch vụ (tăng/giảm)

### 19L.3 - Product Usage & Cost Summary
- Tổng lượng sản phẩm dùng
- Tỷ lệ sử dụng trung bình mỗi dịch vụ
- Chi phí sản phẩm theo nhóm

### 19L.4 - Inventory Movement Report
- Nhập - Xuất - Tồn
- Sản phẩm dư kho nhiều
- Sản phẩm sắp hết

### 19L.5 - Loss & Fraud Detection (Monthly)
- Tổng hao hụt tháng
- Sản phẩm hao hụt cao bất thường
- Stylist/pha chế có hành vi nghi vấn
- Khớp tồn kho vs log pha chế

### 19L.6 - Staff Performance Ranking
- Top stylist theo doanh thu
- Top stylist theo tiết kiệm sản phẩm
- Nhân viên cần đào tạo lại

### 19L.7 - AI Recommendations
- Tối ưu chi phí
- Tối ưu tồn kho
- Gợi ý marketing
- Nhu cầu đào tạo

### 19L.8 - CEO Dashboard UI
- KPI tổng hợp tháng
- Service performance table
- Product usage by category
- Inventory movement
- Loss & fraud summary
- Staff ranking
- AI recommendations

## 🗂️ Files Structure

```
prisma/
└── schema.prisma              # MonthlyReport model

core/
└── prompts/
    └── monthlyReportRecommendationsPrompt.ts  # AI recommendations prompt

app/
├── api/
│   └── reports/
│       └── monthly/
│           ├── generate/
│           │   └── route.ts   # Generate monthly report
│           └── list/
│               └── route.ts   # List reports
└── (dashboard)/
    └── reports/
        └── monthly/
            └── page.tsx       # Monthly Dashboard UI
```

## 📊 Prisma Model

### MonthlyReport
```prisma
model MonthlyReport {
  id              String   @id @default(cuid())
  reportMonth     Int      // 1-12
  reportYear      Int      // 2024, 2025
  
  // Revenue Summary
  totalRevenue    Float
  totalCost       Float
  profit          Float
  margin          Float
  revenueGrowth   Float?
  costChange      Float?
  
  // Customer Metrics
  totalCustomers  Int
  returningCustomers Int
  newCustomers    Int
  returnRate      Float?
  
  // Service Performance
  servicesByCategory Json?
  serviceRevenue    Json?
  serviceCost       Json?
  serviceProfit     Json?
  serviceTrends     Json?
  
  // Product Usage
  totalProductUsage Json?
  usageByCategory   Json?
  averageUsagePerService Json?
  productCostByCategory Json?
  
  // Inventory Movement
  stockIn          Float
  stockOut         Float
  endingStock      Float
  excessStock      Json?
  lowStockItems    Json?
  
  // Loss & Fraud
  averageLossRate  Float?
  lossChange       Float?
  highLossProducts Json?
  suspiciousStaff  Json?
  inventoryMismatch Float?
  
  // Staff Performance
  staffRevenue     Json?
  staffEfficiency  Json?
  staffWarnings    Json?
  topPerformers    Json?
  
  // AI Recommendations
  costOptimization Json?
  inventoryOptimization Json?
  marketingSuggestions Json?
  trainingNeeds    Json?
  aiSummary        String?
}
```

## 🚀 API Endpoints

### POST /api/reports/monthly/generate
Generate monthly report.

**Request:**
```json
{
  "month": 12,
  "year": 2024
}
```

### GET /api/reports/monthly/generate
Get existing monthly report.

**Query Params:**
- `month`: 1-12
- `year`: 2024, 2025, etc.

### GET /api/reports/monthly/list
List all monthly reports.

**Query Params:**
- `limit`: Max results (default: 12)
- `year`: Filter by year

## 🎨 UI Features

### Monthly Dashboard
- Month/Year selector
- Generate report button
- KPI summary cards (Revenue, Cost, Profit, Return Rate)
- Service performance table
- Product usage by category
- Inventory movement summary
- Loss & fraud detection
- Staff performance ranking
- AI recommendations

## ✅ Phase 19L Checklist

- ✅ Prisma Model (MonthlyReport)
- ✅ Monthly Revenue Summary
- ✅ Service Performance Analysis
- ✅ Product Usage & Cost Summary
- ✅ Inventory Movement Report
- ✅ Loss & Fraud Detection (Monthly)
- ✅ Staff Performance Ranking
- ✅ AI-generated Recommendations
- ✅ CEO Dashboard UI

## 🎉 Kết quả

Sau Phase 19L, salon đã có:
- ✅ Báo cáo tổng hợp tháng đầy đủ
- ✅ Phân tích doanh thu, lợi nhuận, chi phí
- ✅ Phân tích dịch vụ (lời/lỗ)
- ✅ Kiểm soát tồn kho và hao hụt
- ✅ Đánh giá nhân viên
- ✅ Phát hiện thất thoát theo tháng
- ✅ AI recommendations chiến lược
- ✅ CEO Dashboard trực quan

**Boss chỉ cần 3 phút cuối tháng → biết toàn bộ tình hình salon!**

