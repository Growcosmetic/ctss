# Phase 17F - AI Customer Insights

Hệ thống AI Customer Insights - Trí tuệ nhân tạo cao cấp nhất trong CRM 360° - Chí Tâm Hair Salon.

## 🎯 Mục tiêu

Tạo hệ thống AI phân tích khách hàng để:
- Dự đoán khách nào sắp quay lại
- Cảnh báo khách nào sắp "mất" → Cần cứu
- Gợi ý dịch vụ tiếp theo phù hợp
- Phân tích hành vi tiêu dùng
- Gợi ý ưu đãi cá nhân hóa
- Phân tích cảm xúc và rủi ro kỹ thuật
- Đưa ra Next Best Action cho salon

## 📋 Insight Categories

### 1. Churn Insight
- HIGH: Khách lâu không quay lại (>90 ngày) + tag "Lost"/"Overdue"
- MEDIUM: Khách có dấu hiệu giảm tần suất hoặc complaint
- LOW: Khách thường xuyên quay lại, không có dấu hiệu bất thường

### 2. Revisit Prediction
- 3-5 tuần: Khách hay nhuộm (dặm màu)
- 6-8 tuần: Khách hay uốn (chỉnh nếp)
- 2-3 tháng: Khách ít đến
- Không chắc: Random customer

### 3. Next Best Service
- Dựa trên lịch sử timeline
- Dựa trên kỹ thuật
- Dựa trên tình trạng tóc
- Dựa trên sở thích màu tóc
- Dựa trên nhu cầu tiềm năng

### 4. Promotion Suggestion
- VIP/High Value: Ưu đãi nhẹ (5-10%)
- Overdue/Lost: Ưu đãi mạnh (15-20%)
- Risky Hair: Ưu đãi treatment phục hồi
- Hay nhuộm: Ưu đãi dặm chân màu

### 5. Customer Profile Summary
- Sở thích
- Lịch sử hóa chất
- Hành vi tiêu dùng
- Mức độ rủi ro
- Tính cách
- Mức độ trung thành

### 6. Next Best Action
- Checklist hành động cụ thể
- Priority (HIGH/MEDIUM/LOW)
- Ví dụ: "Gửi ưu đãi comeback 15% trong 48h"

### 7. Predictions
- LTV (Lifetime Value)
- Next Purchase
- Service Interest
- Product Upsell
- Best Contact Time
- Emotional State

## 🗂️ Files Structure

```
prisma/
└── schema.prisma              # Added CustomerInsight model

core/
└── prompts/
    └── customerInsightPrompt.ts  # AI Super Prompt

app/
├── api/
│   └── crm/
│       └── insight/
│           ├── generate/
│           │   └── route.ts  # Generate customer insight
│           └── get/
│               └── route.ts  # Get customer insight
└── (dashboard)/
    └── customers/
        └── [id]/
            └── page.tsx      # Updated - AI Insight Panel
```

## 📊 Prisma Model

### CustomerInsight

```prisma
model CustomerInsight {
  id             String   @id @default(cuid())
  customerId     String
  churnRisk      String   // HIGH | MEDIUM | LOW
  revisitWindow  String   // 3-5 tuần | 6-8 tuần | etc.
  nextService    String   // Dịch vụ gợi ý
  promotion      String   // Ưu đãi phù hợp
  summary        String   // Tóm tắt khách hàng
  actionSteps    Json     // [{action, priority}]
  predictions    Json?    // {ltv, nextPurchase, etc.}
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  customer Customer @relation(...)

  @@index([customerId])
  @@index([churnRisk])
  @@index([createdAt])
}
```

## 🚀 API Endpoints

### POST /api/crm/insight/generate

Generate AI customer insight.

**Request:**
```json
{
  "customerId": "customer_id",
  "forceRefresh": false  // optional
}
```

**Response:**
```json
{
  "success": true,
  "insight": {
    "id": "...",
    "customerId": "...",
    "churnRisk": "MEDIUM",
    "revisitWindow": "6-8 tuần",
    "nextService": "Uốn nhẹ Hàn Quốc",
    "promotion": "Giảm 10% treatment 20'",
    "summary": "...",
    "actionSteps": [...],
    "predictions": {...}
  },
  "cached": false
}
```

**Note:** Insight is cached for 7 days. Use `forceRefresh: true` to regenerate.

### POST /api/crm/insight/get

Get existing customer insight.

**Request:**
```json
{
  "customerId": "customer_id"
}
```

## 🎨 UI Features

### AI Insight Panel
- Churn Risk indicator (color-coded)
- Revisit Window prediction
- Next Service recommendation
- Promotion suggestion
- Customer Summary
- Next Best Actions (with priority)
- AI Predictions (LTV, Next Purchase, etc.)
- Last Updated timestamp

### Auto Integration
- Auto-create reminders for HIGH churn risk
- Auto-update customer riskLevel
- Integration with Phase 17C (Tags)
- Integration with Phase 17D (Reminders)

## 🔗 Tích hợp

### Phase 17C - Tags
- Uses tags to improve insight accuracy
- "Hay nhuộm" → suggests color touch-up in 4-6 weeks
- "Hay uốn" → suggests perm refresh in 6-8 weeks
- "Risky Hair" → prioritizes recovery
- "Preferred Stylist" → suggests booking with preferred stylist

### Phase 17D - Reminders
- Auto-creates reminders based on insight
- HIGH churn risk → creates urgent reminder
- Action steps with "nhắc" → auto-creates reminder
- Integration with reminder engine

### Phase 17B - Visit Timeline
- Uses visit history for analysis
- Considers service patterns
- Analyzes technical records

## ✅ Phase 17F Checklist

- ✅ Prisma Model CustomerInsight
- ✅ AI Super Prompt (comprehensive)
- ✅ API Generate Insight
- ✅ API Get Insight
- ✅ UI Insight Panel (full features)
- ✅ Auto-create reminders integration
- ✅ Auto-update riskLevel
- ✅ Integration with 17C (Tags)
- ✅ Integration with 17D (Reminders)
- ✅ Predictions engine

## 🎉 Kết quả

Sau Phase 17F, salon đã có:
- ✅ AI phân tích hành vi khách hàng
- ✅ Dự đoán khả năng quay lại
- ✅ Cảnh báo nguy cơ mất khách
- ✅ Gợi ý dịch vụ tiếp theo
- ✅ Gợi ý ưu đãi cá nhân hóa
- ✅ Đưa ra action plan cho CSKH
- ✅ Tự động hòa vào Reminder Engine
- ✅ Predictions (LTV, Next Purchase, etc.)

**CRM 360° của salon chính thức hoàn thiện – mạnh nhất Việt Nam!**

## 📊 Mục tiêu KPIs

- 🤖 **AI Accuracy**: > 85%
- ⚡ **Insight Generation Time**: < 5 seconds
- 📈 **Churn Prediction Accuracy**: > 80%
- 🎯 **Service Recommendation Relevance**: > 90%
- 🔄 **Auto-Integration Rate**: 100%

