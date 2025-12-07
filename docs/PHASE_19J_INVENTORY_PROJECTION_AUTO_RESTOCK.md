# Phase 19J - Inventory Projection & Auto Restock

Hệ thống dự đoán tồn kho thông minh và tự động đề xuất nhập hàng.

## 🎯 Mục tiêu

- Dự đoán khi nào sản phẩm sắp hết
- Dự đoán lượng dùng trong 7/14/30 ngày
- Tự tạo danh sách đề xuất đặt hàng
- Tự so sánh với lịch sử tiêu thụ
- Giảm 90% nguy cơ "hết hàng giữa dịch vụ"
- Hỗ trợ quản lý kho khi không có mặt tại salon

## 📋 Components

### 19J.1 - Consumption Tracking
- Theo dõi tiêu thụ hàng ngày
- Tính toán trung bình, peak, low usage
- Xác định nhân viên dùng nhiều nhất

### 19J.2 - Projection Algorithm
- AI dự đoán tồn kho
- Điều chỉnh theo seasonal, trend, peak
- Tính toán days until empty

### 19J.3 - Auto Restock Trigger
- Trigger khi tồn kho < safety stock
- Trigger khi dự báo hết trong 10 ngày
- Trigger khi hao hụt tăng bất thường
- Trigger khi lượng dùng tăng đột biến

### 19J.4 - AI Generated Restock List
- Tự động tạo danh sách đề xuất nhập hàng
- Tính toán số lượng đề xuất
- Ưu tiên hóa sản phẩm
- Phân loại theo budget category

### 19J.5 - Safety Stock System
- Mỗi sản phẩm có mức tồn kho an toàn
- Cảnh báo khi thấp hơn mức an toàn

### 19J.6 - Budget-based Optimization
- Tối ưu nhập hàng theo ngân sách
- Phân loại: ESSENTIAL, IMPORTANT, OPTIONAL
- Đánh dấu sản phẩm có thể hoãn

### 19J.7 - Restock Dashboard
- Sản phẩm sắp hết
- Sản phẩm tồn kho dư
- Đề xuất nhập hàng (AI)
- Cảnh báo tự động

## 🗂️ Files Structure

```
prisma/
└── schema.prisma              # ConsumptionTracking, InventoryProjection, RestockRecommendation, RestockTrigger models

core/
└── prompts/
    ├── inventoryProjectionPrompt.ts    # AI projection prompt
    └── restockRecommendationPrompt.ts  # AI recommendation prompt

app/
├── api/
│   └── inventory/
│       ├── consumption/
│       │   └── track/
│       │       └── route.ts           # Consumption tracking
│       ├── projection/
│       │   └── calculate/
│       │       └── route.ts           # Projection calculation
│       └── restock/
│           ├── trigger/
│           │   └── route.ts           # Restock triggers
│           └── recommend/
│               └── route.ts           # AI recommendations
└── (dashboard)/
    └── inventory/
        └── restock/
            └── page.tsx               # Restock Dashboard UI
```

## 📊 Prisma Models

### ConsumptionTracking
```prisma
model ConsumptionTracking {
  id            String   @id @default(cuid())
  productId     String
  date          DateTime @db.Date
  quantityUsed  Float
  serviceCount  Int
  peakUsage     Float?
  lowUsage      Float?
  topStaffId    String?
}
```

### InventoryProjection
```prisma
model InventoryProjection {
  id                String   @id @default(cuid())
  productId         String
  projectionDate    DateTime @default(now())
  
  currentStock      Float
  safetyStock       Float?
  averageDailyUsage Float
  peakDailyUsage    Float?
  lowDailyUsage     Float?
  
  projection7Days   Float
  projection14Days  Float
  projection30Days  Float
  
  daysUntilEmpty    Float?
  seasonalFactor    Float?
  trendFactor       Float?
  adjustedProjection30Days Float?
  
  needsRestock      Boolean
  restockPriority   String?
}
```

### RestockRecommendation
```prisma
model RestockRecommendation {
  id              String   @id @default(cuid())
  productId       String
  projectionId    String?
  
  currentStock    Float
  recommendedQty  Float
  recommendedUnit String?
  estimatedCost   Float?
  priority        String
  reason          String?
  budgetCategory  String?
  canDefer        Boolean
  
  status          String   @default("PENDING")
}
```

### RestockTrigger
```prisma
model RestockTrigger {
  id            String   @id @default(cuid())
  productId     String
  triggerType   String   // LOW_STOCK | PROJECTED_OUT | INCREASED_USAGE | WASTAGE_SPIKE
  severity      String   // INFO | WARNING | URGENT
  currentStock  Float
  threshold     Float?
  message       String?
  status        String   @default("ACTIVE")
}
```

## 🚀 API Endpoints

### POST /api/inventory/consumption/track
Track consumption for a specific date.

**Request:**
```json
{
  "productId": "product_id",
  "date": "2024-01-15"
}
```

### GET /api/inventory/consumption/track
Get consumption statistics.

**Query Params:**
- `productId`: Required
- `days`: Period in days (default: 30)

### POST /api/inventory/projection/calculate
Calculate projection for a product.

**Request:**
```json
{
  "productId": "product_id"
}
```

### GET /api/inventory/projection/calculate
Get all projections.

**Query Params:**
- `needsRestock`: Filter by needsRestock (true/false)

### POST /api/inventory/restock/trigger
Check and create restock triggers.

### GET /api/inventory/restock/trigger
Get active triggers.

**Query Params:**
- `severity`: INFO | WARNING | URGENT
- `triggerType`: LOW_STOCK | PROJECTED_OUT | INCREASED_USAGE

### POST /api/inventory/restock/recommend
Generate AI recommendations.

**Request:**
```json
{
  "budget": 6000000,  // Optional
  "productIds": []    // Optional, filter specific products
}
```

### GET /api/inventory/restock/recommend
Get recommendations.

**Query Params:**
- `status`: PENDING | APPROVED | ORDERED | RECEIVED | CANCELLED

## 🎨 UI Features

### Restock Dashboard
- Generate AI recommendations with optional budget
- Active triggers/alerts
- Products running low (needs restock)
- AI-generated restock recommendations with cost
- Excess stock products
- Total cost summary

## ✅ Phase 19J Checklist

- ✅ Prisma Models (ConsumptionTracking, InventoryProjection, RestockRecommendation, RestockTrigger)
- ✅ Consumption Tracking API
- ✅ Projection Algorithm (AI)
- ✅ Auto Restock Trigger System
- ✅ AI Generated Restock List
- ✅ Safety Stock System
- ✅ Budget-based Optimization
- ✅ Restock Dashboard UI

## 🎉 Kết quả

Sau Phase 19J, salon đã có:
- ✅ Hệ thống dự đoán tồn kho thông minh
- ✅ Theo dõi tiêu thụ hàng ngày
- ✅ AI dự đoán lượng dùng 7/14/30 ngày
- ✅ Tự động cảnh báo khi sắp hết
- ✅ AI tạo danh sách đề xuất nhập hàng
- ✅ Tối ưu theo ngân sách
- ✅ Dashboard quản lý tồn kho trực quan

**Hệ thống tồn kho thông minh giống chuỗi salon lớn - không salon nào ở Việt Nam đang làm được level này!**

