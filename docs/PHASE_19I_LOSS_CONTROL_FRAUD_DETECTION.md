# Phase 19I - Loss Control & Fraud Detection

Hệ thống kiểm soát thất thoát và phát hiện gian lận - module quan trọng nhất trong hệ thống pha chế & kho.

## 🎯 Mục tiêu

- Phát hiện dùng thuốc dư bất thường
- Phát hiện gian lận / ghi sai gram
- Phát hiện thất thoát kho
- Phân tích hành vi nhân viên pha chế
- Gợi ý nguyên nhân thất thoát
- Cảnh báo tự động 3 cấp
- Lưu log toàn bộ hoạt động

## 📋 Components

### 19I.1 - Loss Detection Algorithm
- Tính toán hao hụt: `haoHut = usedQty - expectedQty`
- Tỷ lệ hao hụt: `tyLeHaoHut = haoHut / expectedQty * 100`
- So sánh với threshold và tạo alert

### 19I.2 - Fraud Pattern Recognition
AI phát hiện 7 loại hành vi gian lận:
1. WRONG_GRAM - Ghi sai gram để "dư" thuốc
2. PRODUCT_SUBSTITUTION - Ghi lộn sản phẩm rẻ thay cho sản phẩm mắc
3. FAKE_LOG - Ghi log pha chế ảo (log có nhưng kho không giảm)
4. INVENTORY_THEFT - Chuyển thuốc ra ngoài
5. CONSISTENT_OVERUSE - Một nhân viên luôn dùng nhiều hơn người khác 30-50%
6. MONTH_END_SPIKE - Tăng dùng thuốc vào cuối tháng
7. INVENTORY_MISMATCH - Chênh lệch lớn giữa log pha chế và tồn kho vật lý

### 19I.3 - Threshold Rules
Mức hao hụt chuẩn:

| Loại sản phẩm | Hao hụt an toàn | Warning | Alert | Critical |
| ------------- | --------------- | ------- | ----- | -------- |
| Plexis S1/S2  | 10-12%          | 12-15%  | 15-25%| > 25%    |
| Neutralizer   | 5-10%           | 10-12%  | 12-20%| > 20%    |
| Treatment     | 8-12%           | 12-15%  | 15-22%| > 22%    |
| Nhuộm màu     | 5-8%            | 8-12%   | 12-20%| > 20%    |
| Oxy           | 10-15%          | 15-18%  | 18-25%| > 25%    |

### 19I.4 - AI Behavior Analysis
- Phân tích hành vi nhân viên
- So sánh với mức chuẩn
- So sánh với nhân viên khác
- Phát hiện pattern bất thường

### 19I.5 - Warning System (3 cấp độ)
- **Level 1 - WARNING**: Dùng dư nhẹ (màu vàng)
- **Level 2 - ALERT**: Sai lệch 15-25%, lặp lại 3 ngày (màu cam)
- **Level 3 - CRITICAL**: Sai > 25%, lặp > 5 lần (màu đỏ)

### 19I.6 - Loss Control Dashboard
- Top 5 sản phẩm hao hụt cao nhất
- Top 5 nhân viên dùng nhiều thuốc nhất
- Tồn kho vs Log pha chế
- Lịch sử cảnh báo
- Đề xuất của AI

## 🗂️ Files Structure

```
prisma/
└── schema.prisma              # LossAlert, ThresholdRule models

lib/
└── thresholds.ts              # Threshold rules & calculations

core/
└── prompts/
    └── fraudDetectionPrompt.ts # AI fraud detection prompt

app/
├── api/
│   └── loss/
│       ├── detect/
│       │   └── route.ts       # Loss detection
│       ├── fraud-detect/
│       │   └── route.ts       # Fraud detection
│       ├── behavior-analysis/
│       │   └── route.ts       # Behavior analysis
│       ├── alerts/
│       │   └── route.ts       # Alerts management
│       └── dashboard/
│           └── route.ts       # Dashboard data
└── (dashboard)/
    └── loss-control/
        └── page.tsx           # Loss Control Dashboard UI
```

## 📊 Prisma Models

### LossAlert
```prisma
model LossAlert {
  id            String   @id @default(cuid())
  type          String   // LOSS | FRAUD | WASTAGE | INVENTORY_MISMATCH
  severity      String   // WARNING | ALERT | CRITICAL
  productId     String?
  staffId       String?
  serviceId     String?
  mixLogId      String?
  
  // Loss metrics
  expectedQty   Float?
  actualQty     Float?
  lossQty       Float?
  lossRate      Float?
  
  // Fraud detection
  fraudPattern  String?
  fraudScore    Float?
  behavior      String?
  
  // Threshold comparison
  thresholdType String?
  thresholdValue Float?
  deviation     Float?
  
  // Context
  description   String?
  recommendation String?
  status        String   @default("OPEN")
  
  // Tracking
  detectedAt    DateTime @default(now())
  reviewedAt    DateTime?
  reviewedBy    String?
  resolvedAt    DateTime?
}
```

### ThresholdRule
```prisma
model ThresholdRule {
  id              String   @id @default(cuid())
  productId       String?
  productCategory String?
  serviceId       String?
  serviceCategory String?
  
  normalMin       Float?
  normalMax       Float?
  warningMin      Float?
  warningMax      Float?
  alertMin        Float?
  alertMax        Float?
  criticalMin     Float?
  
  expectedMin     Float?
  expectedMax     Float?
  
  isActive        Boolean  @default(true)
}
```

## 🚀 API Endpoints

### POST /api/loss/detect
Detect loss from mix log.

**Request:**
```json
{
  "mixLogId": "mix_log_id"
}
```

### GET /api/loss/detect
Auto-detect loss for recent mix logs.

**Query Params:**
- `hours`: Number of hours to check (default: 24)
- `limit`: Max logs to check (default: 100)

### POST /api/loss/fraud-detect
Detect fraud patterns.

**Request:**
```json
{
  "mixLogId": "optional",
  "staffId": "optional",
  "productId": "optional",
  "startDate": "optional",
  "endDate": "optional"
}
```

### GET /api/loss/behavior-analysis
Analyze staff behavior.

**Query Params:**
- `staffId`: Optional
- `productId`: Optional
- `days`: Period in days (default: 30)

### GET /api/loss/alerts
Get loss alerts.

**Query Params:**
- `status`: OPEN | REVIEWED | RESOLVED | FALSE_ALARM
- `severity`: WARNING | ALERT | CRITICAL
- `type`: LOSS | FRAUD | WASTAGE | INVENTORY_MISMATCH
- `staffId`, `productId`: Filter
- `limit`: Max results (default: 50)

### PATCH /api/loss/alerts
Update alert status.

**Request:**
```json
{
  "alertId": "alert_id",
  "status": "REVIEWED | RESOLVED",
  "reviewedBy": "user_id"
}
```

### GET /api/loss/dashboard
Get dashboard data.

**Query Params:**
- `days`: Period in days (default: 30)

## 🎨 UI Features

### Loss Control Dashboard
- Alert statistics (Critical, Alert, Warning)
- Top 5 products with highest loss
- Top 5 staff with highest usage
- Inventory mismatch (Stock OUT vs Mix Log)
- Recent alerts timeline
- Color-coded severity indicators

## ✅ Phase 19I Checklist

- ✅ Prisma Models (LossAlert, ThresholdRule)
- ✅ Loss Detection Algorithm
- ✅ Fraud Pattern Recognition (AI)
- ✅ Threshold Rules System
- ✅ AI Behavior Analysis
- ✅ Warning System (3 levels)
- ✅ Loss Control Dashboard UI
- ✅ Alerts Management API
- ✅ Dashboard Data API

## 🎉 Kết quả

Sau Phase 19I, salon đã có:
- ✅ Hệ thống phát hiện hao hụt tự động
- ✅ AI phát hiện gian lận 7 pattern
- ✅ Phân tích hành vi nhân viên
- ✅ Cảnh báo tự động 3 cấp độ
- ✅ Dashboard kiểm soát thất thoát
- ✅ So sánh tồn kho vs log pha chế
- ✅ Lịch sử cảnh báo đầy đủ

**Hệ thống chống thất thoát cấp độ doanh nghiệp lớn - không salon nào ở Việt Nam đang làm được level này!**

