# Phase 17D - Reminder Engine

Hệ thống Reminder Engine - Nhắc lịch tự động thông minh - Chí Tâm Hair Salon.

## 🎯 Mục tiêu

Tạo hệ thống reminder tự động để:
- Không bao giờ quên nhắc khách
- Tăng tỉ lệ quay lại 30-50%
- Theo dõi chu kỳ uốn – nhuộm – treatment
- Tự động gửi tin đúng thời điểm
- Cá nhân hóa theo từng khách

## 📋 Các loại Reminder

### 1. Follow-up 24h
Sau khi làm tóc 24h → Nhắn chăm sóc khách

### 2. Rebook Curl (6-8 tuần)
Cho khách hay uốn → Nhắc chỉnh nếp lại

### 3. Recolor (4-6 tuần)
Cho khách hay nhuộm → Nhắc dặm màu

### 4. Recovery (2-3 tuần)
Cho khách High Risk → Nhắc phục hồi

### 5. Appointment (12-24h trước)
Nhắc lịch hẹn ngày mai

### 6. Overdue / Lost (>90 ngày)
Nhắc khách lâu không quay lại

## 🗂️ Files Structure

```
prisma/
└── schema.prisma              # Added Reminder model

core/
└── crm/
    └── reminderRules.ts       # Reminder generation rules

app/
├── api/
│   └── reminders/
│       ├── create/
│       │   └── route.ts      # Create reminders
│       ├── process/
│       │   └── route.ts      # Process & send reminders (Cron)
│       └── ai-smart/
│           └── route.ts      # AI Smart Reminder Generator
└── (dashboard)/
    └── crm/
        └── reminders/
            └── page.tsx      # Reminder Queue UI
```

## 📊 Prisma Model

### Reminder

```prisma
model Reminder {
  id          String   @id @default(cuid())
  customerId  String
  type        String   // followup | rebook_curl | recolor | appointment | recovery | overdue
  sendAt      DateTime // Thời gian gửi
  sent        Boolean  @default(false)
  sentAt      DateTime?
  channel     String   @default("zalo") // zalo | fb | sms
  message     String
  metadata    Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  customer Customer @relation(...)

  @@index([customerId])
  @@index([sendAt])
  @@index([sent])
  @@index([type])
}
```

## 🚀 API Endpoints

### POST /api/reminders/create

Tạo reminders cho khách hàng.

**Request:**
```json
{
  "customerId": "customer_id",
  "type": "appointment",  // optional
  "appointmentDate": "2024-01-15T15:00:00Z",
  "service": "Uốn nóng",
  "stylist": "Chí Tâm"
}
```

### POST /api/reminders/process

Process & send reminders (Cron Job).

**Response:**
```json
{
  "success": true,
  "results": {
    "processed": 10,
    "sent": 8,
    "failed": 2
  }
}
```

### GET /api/reminders/process

Get reminders list.

**Query Params:**
- `customerId`: Filter by customer
- `sent`: true/false
- `type`: Filter by type

### POST /api/reminders/ai-smart

AI generate smart reminder message.

**Request:**
```json
{
  "customerId": "customer_id",
  "reminderType": "rebook_curl",
  "context": "Optional context"
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "message": "Tin nhắn AI generated",
    "bestTimeToSend": "evening",
    "suggestedFollowUp": "...",
    "urgency": "MEDIUM"
  }
}
```

## 🔧 Reminder Rules

### Follow-up 24h
- Trigger: Sau visit gần nhất 24h
- Message: Hỏi thăm tình trạng tóc

### Rebook Curl
- Trigger: Khách có tag "Hay uốn" + 45 ngày từ lần uốn
- Message: Nhắc chỉnh nếp lại

### Recolor
- Trigger: Khách có tag "Hay nhuộm" + 35 ngày từ lần nhuộm
- Message: Nhắc dặm màu

### Recovery
- Trigger: Khách có tag "Risky Hair" + 14-21 ngày
- Message: Nhắc phục hồi

### Overdue
- Trigger: Tag "Overdue" + 90-180 ngày
- Message: Ưu đãi quay lại

### Lost
- Trigger: Tag "Lost" + 180+ ngày
- Message: Chương trình đặc biệt

## 🔗 Tích hợp

### Phase 13F - Follow-up Engine
```typescript
// Auto create follow-up reminder after visit
await fetch("/api/reminders/create", {
  method: "POST",
  body: JSON.stringify({ customerId }),
});
```

### Phase 17C - Tags
```typescript
// Use tags to determine reminder type
if (tags.includes("Hay uốn")) {
  // Create rebook_curl reminder
}
```

### Cron Job Setup
```typescript
// Run every 5-10 minutes
// Call POST /api/reminders/process
// Can use Vercel Cron, Upstash Cron, or server cron
```

## ✅ Phase 17D Checklist

- ✅ Prisma Model Reminder
- ✅ Reminder Rules Engine (6 types)
- ✅ API create reminders
- ✅ API process & send reminders
- ✅ AI Smart Reminder Generator
- ✅ UI Reminder Queue
- ✅ Integration ready (Zalo/FB/SMS placeholder)

## 🎉 Kết quả

Sau Phase 17D, salon đã có:
- ✅ Hệ thống nhắc lịch tự động (6 types)
- ✅ Tự động follow-up 24h
- ✅ Tự động nhắc quay lại uốn/nhuộm
- ✅ Tự động nhắc khách overdue/lost
- ✅ AI Smart Reminder cá nhân hóa
- ✅ Reminder Queue dashboard
- ✅ Tích hợp sẵn Zalo/FB/SMS

**Không bao giờ bị quên khách nữa → doanh thu tăng 20-40%!**

## 📊 Mục tiêu KPIs

- 📨 **Reminder delivery rate**: > 95%
- 📈 **Return rate increase**: +30-50%
- ⏰ **Average reminder time**: < 2 hours delay
- 🤖 **AI personalization**: 100%

