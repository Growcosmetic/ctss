# Phase 17B - Visit Timeline

Hệ thống Visit Timeline mở rộng - "Hồ sơ bệnh án tóc" chi tiết từng lần khách đến - Chí Tâm Hair Salon.

## 🎯 Mục tiêu

Mở rộng Visit Timeline để:
- Lưu chi tiết kỹ thuật từ AI Stylist Coach
- Track sản phẩm đã dùng (gram + tiền) - Phase 54
- Lưu ảnh before/after đầy đủ
- Follow-up notes từ CSKH
- Auto tags (VIP, Risky, Overdue, Loyal, Premium)
- Tích hợp hoàn chỉnh với các phân hệ khác

## 📋 Chức năng chính

### Technical Record
- Hair condition (elasticity, porosity, breakageRisk)
- Chemical history 12 months
- Technique used
- Process steps
- Warnings
- AI Summary từ Stylist Coach

### Products Used (Phase 54)
- Product name
- Gram used
- Unit price
- Total cost
- Auto update totalSpent

### Follow-up System
- 24h follow-up notes
- 48h follow-up notes
- Auto append với timestamp

### Auto Tags
- **VIP**: Chi tiêu > 8 triệu
- **Premium**: Dùng nhiều technical service
- **Risky**: Risk HIGH hoặc có warnings
- **Loyal**: 3+ visits trong 6 tháng
- **Overdue**: 90 ngày chưa quay lại

## 🗂️ Files Structure

```
prisma/
└── schema.prisma              # Updated Visit model

app/
├── api/
│   └── visits/
│       ├── add/route.ts              # Updated - support technical, totalCharge, tags
│       ├── add-technical/route.ts    # NEW - Add technical record from Stylist Coach
│       ├── update-products/route.ts  # NEW - Update products from Assistant
│       ├── add-followup/route.ts     # NEW - Add follow-up notes
│       └── auto-tags/route.ts        # NEW - Auto generate tags
└── (dashboard)/
    └── customers/
        └── [id]/
            ├── timeline.tsx          # Updated - View detail button
            └── VisitDetailModal.tsx  # NEW - Detail modal
```

## 📊 Prisma Model (Updated)

### Visit

```prisma
model Visit {
  id            String   @id @default(cuid())
  customerId    String
  date          DateTime @default(now())
  
  // Dịch vụ & người thực hiện
  service       String
  stylist       String?
  assistant     String?
  
  // Phần kỹ thuật (chi tiết từ AI Stylist Coach)
  technical     Json?    // hairCondition, chemHistory, techniqueUsed, process, warnings, aiSummary
  
  // Sản phẩm đã dùng (Phase 54)
  productsUsed  Json?    // [{product, gram, unitPrice, total}]
  totalCharge   Int?     // Tổng chi phí dịch vụ
  
  // Ảnh
  photosBefore  String[]
  photosAfter   String[]
  
  // Follow-up & Đánh giá
  rating        Int?
  followUpNotes String?
  notes         String?
  
  // Auto Tags
  tags          String[] // ["VIP", "Risky", "Overdue", "Loyal", "Premium"]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  customer Customer @relation(...)
}
```

## 🚀 API Endpoints

### POST /api/visits/add-technical

Thêm technical record từ Stylist Coach.

**Request:**
```json
{
  "visitId": "visit_id",
  "technical": {
    "hairCondition": {
      "elasticity": "medium",
      "porosity": "high",
      "breakageRisk": "MEDIUM"
    },
    "chemHistory12Months": "Uốn 6 tháng trước",
    "techniqueUsed": "Uốn nóng - Acid Aqua Gloss",
    "process": {
      "step1": "Kiểm tra tóc",
      "step2": "Pha thuốc"
    },
    "warnings": ["Tóc xốp cao, cần giảm thời gian"],
    "aiSummary": "Tóm tắt từ AI..."
  }
}
```

### POST /api/visits/update-products

Cập nhật sản phẩm đã dùng từ Assistant.

**Request:**
```json
{
  "visitId": "visit_id",
  "productsUsed": [
    {
      "product": "Plexis S1",
      "gram": 32,
      "unitPrice": 10000,
      "total": 320000
    }
  ],
  "totalCharge": 5000000
}
```

### POST /api/visits/add-followup

Thêm follow-up notes.

**Request:**
```json
{
  "visitId": "visit_id",
  "followUpNotes": "Khách hài lòng, tóc vào nếp tốt"
}
```

### POST /api/visits/auto-tags

Tự động generate tags.

**Request:**
```json
{
  "visitId": "visit_id"
}
```

**Response:**
```json
{
  "success": true,
  "tags": ["VIP", "Premium", "Loyal"],
  "visit": {...}
}
```

## 🔗 Tích hợp

### Stylist Coach (Phase 11)
```typescript
// Sau khi AI phân tích
await fetch("/api/visits/add-technical", {
  method: "POST",
  body: JSON.stringify({
    visitId: visit.id,
    technical: {
      hairCondition: analysis.hairCondition,
      warnings: analysis.warnings,
      aiSummary: analysis.aiSummary,
      // ...
    },
  }),
});
```

### Assistant / Phase 54
```typescript
// Sau khi pha chế ghi nhận
await fetch("/api/visits/update-products", {
  method: "POST",
  body: JSON.stringify({
    visitId: visit.id,
    productsUsed: [
      { product: "Plexis S1", gram: 32, unitPrice: 10000, total: 320000 },
    ],
    totalCharge: 5000000,
  }),
});
```

### Follow-up Engine (Phase 13F)
```typescript
// Sau 24h follow-up
await fetch("/api/visits/add-followup", {
  method: "POST",
  body: JSON.stringify({
    visitId: visit.id,
    followUpNotes: "Khách hài lòng, tóc vào nếp tốt",
  }),
});

// Auto generate tags
await fetch("/api/visits/auto-tags", {
  method: "POST",
  body: JSON.stringify({ visitId: visit.id }),
});
```

## ✅ Phase 17B Checklist

- ✅ Updated Visit model (technical, totalCharge, tags)
- ✅ API add-technical
- ✅ API update-products
- ✅ API add-followup
- ✅ API auto-tags
- ✅ UI VisitDetailModal
- ✅ Updated Timeline UI với view detail button
- ✅ Integration ready (Stylist Coach, Phase 54, Follow-up)

## 🎉 Kết quả

Sau Phase 17B, salon đã có:
- ✅ Timeline chi tiết từng lần đến
- ✅ Technical record từ AI Stylist Coach
- ✅ Products tracking (Phase 54)
- ✅ Follow-up notes tự động
- ✅ Auto tags thông minh
- ✅ Visit Detail Modal đầy đủ thông tin

**Salon Chí Tâm đã có "Hair History System" mạnh nhất Việt Nam!**

