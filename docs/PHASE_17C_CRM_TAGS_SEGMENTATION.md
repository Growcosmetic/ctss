# Phase 17C - CRM Tags & Segmentation

Hệ thống CRM Tags & Segmentation - Phân nhóm khách hàng thông minh tự động - Chí Tâm Hair Salon.

## 🎯 Mục tiêu

Tạo hệ thống tagging và segmentation để:
- Tự động gán tag theo hành vi, tần suất, kỹ thuật
- Phân nhóm khách hàng (VIP, Risky, Overdue, Lost, etc.)
- Gợi ý dịch vụ và stylist phù hợp
- Tích hợp với Marketing Engine và Follow-up Engine
- AI phân tích hành vi và đưa ra insight

## 📋 Tag Categories

### 1. Behavior Tags (Hành vi)
- New Customer
- Returning Customer
- VIP (chi tiêu > 8 triệu/6m hoặc > 20 triệu tổng)
- High Value
- Low Value

### 2. Visit Frequency Tags (Tần suất)
- Active (0-30 ngày)
- Warm (30-60 ngày)
- Cold (60-90 ngày)
- Overdue (90-180 ngày)
- Lost (180+ ngày)

### 3. Technical Profile Tags (Kỹ thuật)
- Bleached Hair
- Heavily Processed
- Risky Hair
- Natural Hair
- Sensitive Scalp
- High-Damage History

### 4. Service Preference Tags (Dịch vụ)
- Hay uốn
- Hay nhuộm
- Hay phục hồi
- Chỉ cắt
- Thích style Hàn
- Thích màu nâu lạnh
- Thích màu sáng

### 5. Complaint Tags (Phàn nàn)
- Complaint History
- Redo Case
- Not satisfied (recent)

### 6. Stylist Relation Tags (Quan hệ)
- Preferred: [Stylist Name]

## 🗂️ Files Structure

```
prisma/
└── schema.prisma              # Added CustomerTag model

core/
├── crm/
│   └── tagRules.ts            # Tag generation rules engine
└── prompts/
    └── crmInsightPrompt.ts    # AI insight prompt

app/
├── api/
│   └── crm/
│       ├── tags/
│       │   ├── refresh/
│       │   │   └── route.ts  # Refresh customer tags
│       │   └── get/
│       │       └── route.ts  # Get customer tags
│       ├── insight/
│       │   └── route.ts      # AI insight analysis
│       └── segmentation/
│           └── list/
│               └── route.ts  # List customers by segment/tag
└── (dashboard)/
    ├── customers/
    │   └── [id]/
    │       └── page.tsx      # Updated - Tags display + AI Insight
    └── crm/
        └── segmentation/
            └── page.tsx      # Segmentation page
```

## 📊 Prisma Model

### CustomerTag

```prisma
model CustomerTag {
  id         String   @id @default(cuid())
  customerId String
  tag        String   // Tag name
  category   String?  // behavior | frequency | technical | service | complaint | stylist
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  customer Customer @relation(...)

  @@unique([customerId, tag])
  @@index([customerId])
  @@index([tag])
}
```

## 🚀 API Endpoints

### POST /api/crm/tags/refresh

Refresh tags cho khách hàng.

**Request:**
```json
{
  "customerId": "customer_id"
}
```

**Response:**
```json
{
  "success": true,
  "tags": [
    { "tag": "VIP", "category": "behavior" },
    { "tag": "Active", "category": "frequency" },
    ...
  ],
  "segment": "A",
  "total": 8
}
```

### POST /api/crm/tags/get

Lấy tags của khách hàng.

**Request:**
```json
{
  "customerId": "customer_id"
}
```

### POST /api/crm/insight

AI phân tích khách hàng.

**Request:**
```json
{
  "customerId": "customer_id"
}
```

**Response:**
```json
{
  "success": true,
  "insight": {
    "insight": "Khách hàng VIP, thường xuyên làm uốn và nhuộm...",
    "riskLevel": "MEDIUM",
    "idealServiceForNextVisit": "Phục hồi + Nhuộm dặm màu",
    "nextBestAction": "Nhắc lịch sau 6 tuần",
    "personalizedCare": "Khách cần phục hồi thường xuyên...",
    "recommendedStylist": "Chí Tâm",
    "urgency": "MEDIUM"
  }
}
```

### POST /api/crm/segmentation/list

Lấy danh sách khách hàng theo segment/tag.

**Request:**
```json
{
  "segment": "A",  // optional
  "tag": "VIP",    // optional
  "category": "behavior"  // optional
}
```

## 🎨 UI Pages

### /customers/[id]

Customer Profile Page với:
- Tags display (grouped by category)
- Refresh Tags button
- AI Insight button
- AI Insight panel với gợi ý

### /crm/segmentation

Segmentation Page với:
- Segment buttons (A-G)
- Popular tags filter
- Customer list with tags
- Link to customer profile

## 🔗 Tích hợp

### Phase 14 - Marketing Engine
```typescript
// Get customers by segment for remarketing
const customers = await fetch("/api/crm/segmentation/list", {
  method: "POST",
  body: JSON.stringify({ segment: "C" }), // Overdue customers
});
```

### Phase 17D - Reminders
```typescript
// Auto reminder based on tags
if (tags.includes("Hay uốn")) {
  // Remind after 6-8 weeks
} else if (tags.includes("Hay nhuộm")) {
  // Remind after 4-6 weeks
}
```

### Stylist Coach (Phase 11)
```typescript
// Use tags to personalize AI analysis
if (tags.includes("Risky Hair")) {
  // Extra caution in analysis
}
```

## ✅ Phase 17C Checklist

- ✅ Prisma Model CustomerTag
- ✅ Tag Rules Engine (6 categories)
- ✅ API refresh/get tags
- ✅ AI Insight API
- ✅ Segmentation API
- ✅ UI Tags display (grouped)
- ✅ UI Segmentation page
- ✅ Integration ready

## 🎉 Kết quả

Sau Phase 17C, salon đã có:
- ✅ Hệ thống tag thông minh (6 categories)
- ✅ Tự động gán tag theo hành vi, kỹ thuật, tiêu dùng
- ✅ Phân nhóm khách hàng (7 segments)
- ✅ AI phân tích và gợi ý
- ✅ Segmentation dashboard
- ✅ Tích hợp Marketing & Follow-up

**Đây là CRM phân nhóm thông minh nhất trong ngành salon Việt Nam!**

