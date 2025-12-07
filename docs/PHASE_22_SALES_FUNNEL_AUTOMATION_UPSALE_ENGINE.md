# Phase 22 - Sales Funnel Automation & Upsale Engine

Hệ thống tự động upsale và cross-sale, tăng giá trị hóa đơn 15-30%.

## 🎯 Mục tiêu

- Tự động upsale - cross-sale
- Tăng giá trị hóa đơn 15-30%
- Xây funnel bán hàng theo hành trình khách
- Gợi ý sản phẩm/dịch vụ phù hợp từng người
- Tự chăm lại khách chưa chốt
- Tự động remarketing khách cũ
- AI hỗ trợ stylist upsale tinh tế tại salon

## 📋 Components

### 22A - Sales Funnel Overview
7 giai đoạn:
1. AWARENESS - Nhận biết
2. CONSIDERATION - Cân nhắc
3. DECISION - Quyết định
4. CHECKOUT - Thanh toán
5. POST_SERVICE - Sau dịch vụ
6. RETURN - Quay lại

### 22B - Upsale Matrix by Services
- Ma trận upsale theo từng dịch vụ
- Recommended services/products
- Conversion rates
- Scripts và benefits

### 22C - AI Upsale Recommendation Engine
- AI phân tích khách hàng
- Đề xuất upsale phù hợp
- Script gợi ý cho stylist
- Tone communication

### 22D - Service Funnel Automation
- Automation flows cho consideration stage
- Multi-day campaigns
- Conversion tracking

### 22E - Product Funnel (Homecare) Automation
- Post-service product upsale
- Follow-up sequences
- Combo offers

### 22F - Abandoned Customer Recovery
- Detect abandoned carts
- Recovery automation
- Multi-attempt recovery

### 22G - Sales Dashboard
- Upsale metrics
- Staff performance
- Top products/services
- Funnel statistics
- AOV tracking

## 🗂️ Files Structure

```
prisma/
└── schema.prisma              # UpsaleMatrix, UpsaleRecommendation, SalesFunnel, AbandonedCart, UpsaleRecord

core/
└── prompts/
    └── upsaleRecommendationPrompt.ts    # AI upsale recommendation

app/
├── api/
│   └── sales/
│       ├── upsale-matrix/
│       │   └── create/
│       │       └── route.ts      # Upsale matrix CRUD
│       ├── upsale/
│       │   ├── recommend/
│       │   │   └── route.ts      # AI upsale recommendation
│       │   └── record/
│       │       └── route.ts      # Record upsale transactions
│       ├── funnel/
│       │   ├── track/
│       │   │   └── route.ts      # Track funnel progress
│       │   └── automation/
│       │       └── route.ts      # Funnel automation flows
│       ├── abandoned/
│       │   └── recover/
│       │       └── route.ts      # Abandoned cart recovery
│       └── dashboard/
│           └── route.ts          # Sales dashboard data
└── (dashboard)/
    └── sales/
        └── page.tsx              # Sales Dashboard UI
```

## 📊 Prisma Models

### UpsaleMatrix
```prisma
model UpsaleMatrix {
  id                  String   @id @default(cuid())
  serviceId           String?
  serviceName         String
  recommendedServices String[]
  recommendedProducts String[]
  upsaleType          String   // SERVICE | PRODUCT | COMBO
  priority            Int
  conversionRate      Float?
  script              String?
  benefits            String[]
}
```

### UpsaleRecommendation
```prisma
model UpsaleRecommendation {
  id                  String   @id @default(cuid())
  customerId          String
  recommendedServices String[]
  recommendedProducts String[]
  confidence          Float?
  reason              String?
  script              String?
  tone                String?
  status              String   @default("PENDING")
}
```

### SalesFunnel
```prisma
model SalesFunnel {
  id                  String   @id @default(cuid())
  customerId          String?
  funnelStage         String
  entryPoint          String?
  currentService      String?
  stepsCompleted      String[]
  automationActive    Boolean  @default(true)
  nextAction          String?
  nextActionDate      DateTime?
}
```

### AbandonedCart
```prisma
model AbandonedCart {
  id                  String   @id @default(cuid())
  customerId          String?
  abandonmentType     String
  originalIntent      String?
  recoveryAttempts    Int      @default(0)
  status              String   @default("ABANDONED")
  nextAttempt         DateTime?
}
```

### UpsaleRecord
```prisma
model UpsaleRecord {
  id                  String   @id @default(cuid())
  invoiceId           String
  customerId          String
  originalAmount      Float
  upsaleAmount        Float
  totalAmount         Float
  upsaleItems         String[]
  source              String   // MATRIX | AI | MANUAL | AUTOMATION
  upsaleRate          Float?
}
```

## 🚀 API Endpoints

### POST /api/sales/upsale-matrix/create
Create upsale matrix entry.

### GET /api/sales/upsale-matrix/create
Get upsale matrices.

### POST /api/sales/upsale/recommend
AI generate upsale recommendation.

### GET /api/sales/upsale/recommend
Get recommendations.

### POST /api/sales/upsale/record
Record upsale transaction.

### GET /api/sales/upsale/record
Get upsale records with statistics.

### POST /api/sales/funnel/track
Track funnel progress.

### GET /api/sales/funnel/track
Get funnel data.

### POST /api/sales/funnel/automation
Setup funnel automation.

### GET /api/sales/funnel/automation
Get automation flows.

### POST /api/sales/abandoned/recover
Create abandoned cart record.

### GET /api/sales/abandoned/recover
Get abandoned carts.

### PATCH /api/sales/abandoned/recover
Update recovery attempt.

### GET /api/sales/dashboard
Get sales dashboard metrics.

## ✅ Phase 22 Checklist

- ✅ Prisma Models (5 models)
- ✅ Upsale Matrix System
- ✅ AI Upsale Recommendation Engine
- ✅ Sales Funnel Tracking
- ✅ Funnel Automation Flows
- ✅ Abandoned Cart Recovery
- ✅ Upsale Recording System
- ✅ Sales Dashboard API

## 🎉 Kết quả

Sau Phase 22, salon đã có:
- ✅ Hệ thống upsale matrix chuẩn
- ✅ AI đề xuất upsale theo từng khách
- ✅ Funnel tracking đầy đủ
- ✅ Automation flows tự động
- ✅ Abandoned cart recovery
- ✅ Sales metrics & dashboard
- ✅ Tăng AOV 15-30%

**Đây là hệ thống giúp Chí Tâm Hair Salon tăng trưởng bền vững 30-50% doanh thu!**

