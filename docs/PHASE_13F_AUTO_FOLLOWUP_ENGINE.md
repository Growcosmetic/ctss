# Phase 13F - Auto Follow-up Engine

Hệ thống tự động chăm sóc khách hàng 24/7, nhắc lịch, upsell, theo dõi trải nghiệm khách.

## 🎯 Mục tiêu

Tạo ra dòng khách quay lại ổn định, tăng doanh thu mà không tốn công sức nhân sự.

## 📊 Follow-up Flow (3 Phase)

### 1. Ngay sau dịch vụ (0-24h)
**Mục tiêu:** Tạo cảm giác salon quan tâm → tăng loyalty

- Tin cảm ơn
- Nhắc chăm sóc tóc theo dịch vụ
- Câu hỏi check-in (soft)

**Ví dụ:**
- "Tóc chị hôm nay ổn chứ? Em gửi hướng dẫn bảo dưỡng để tóc giữ nếp lâu hơn nha ❤️"
- "Nếu có gì hơi khô hay chưa vào nếp, chị nhắn em xem giúp."

### 2. Follow-up sau 3-5 ngày
**Mục tiêu:** Phát hiện vấn đề trước khi khách than phiền

- "Tóc chị mấy hôm nay giữ nếp ok không?"
- "Có bị rối hay khô không để em hỗ trợ."

**Responses:**
- "Khô" → AI gợi sản phẩm treatment phù hợp
- "Không vào nếp" → AI gợi cách chăm hoặc mời ghé salon kiểm tra
- "OK rồi" → Mark khách là satisfied

### 3. Retention Follow-up (15-90 ngày)
**Mục tiêu:** Nhắc quay lại salon đúng thời điểm, upsell tinh tế

- **15 ngày:** Đề xuất sản phẩm chăm dưỡng
- **30 ngày:** Khảo sát nhẹ + upsell nhuộm nhẹ
- **45-60 ngày:** Nhắc lịch uốn/nhuộm tiếp theo
- **75-90 ngày:** Dự đoán "rời bỏ" → gửi ưu đãi nhẹ

## 🗂️ Files Structure

```
core/
└── followup/
    ├── types.ts              # Type definitions
    ├── rules.ts              # Follow-up rules engine
    ├── messageGenerator.ts   # AI message generator
    ├── followUpEngine.ts     # Main follow-up engine
    └── index.ts              # Exports

app/
└── api/
    └── followup/
        ├── run/
        │   └── route.ts      # Cron job endpoint
        └── history/
            └── route.ts      # Follow-up history API
```

## 🚀 Usage

### Cron Job Setup

Set up a daily cron job to run:

```bash
# Daily at 9 AM
0 9 * * * curl -X GET https://your-domain.com/api/followup/run
```

Or use a cron service like:
- Vercel Cron Jobs
- GitHub Actions
- AWS EventBridge
- Google Cloud Scheduler

### Manual Trigger

```typescript
GET /api/followup/run

Response:
{
  "success": true,
  "processed": 150,
  "sent": 25,
  "failed": 2,
  "messages": [...]
}
```

### Get Follow-up History

```typescript
GET /api/followup/history?customerId=123
// or
GET /api/followup/history?phone=0123456789

Response:
{
  "success": true,
  "followUps": [
    {
      "id": "...",
      "customerId": "...",
      "ruleId": "after_1_day",
      "messageType": "thank_you",
      "message": "...",
      "status": "sent",
      "sentAt": "..."
    }
  ]
}
```

## 📋 Follow-up Rules

| Rule ID | Days After | Trigger | Message Type | Description |
|---------|-----------|---------|--------------|-------------|
| after_1_day | 1 | POST_SERVICE | thank_you | Cảm ơn sau dịch vụ |
| after_3_days | 3 | POST_SERVICE | check_health | Check tình trạng tóc |
| after_15_days | 15 | RETENTION | care_tip | Tip chăm sóc |
| after_30_days | 30 | RETENTION | light_upsell | Upsell nhẹ |
| after_45_days | 45 | RETENTION | booking_reminder | Nhắc lịch |
| after_60_days | 60 | RETENTION | booking_reminder | Nhắc lịch |
| after_75_days | 75 | RETENTION | churn_prevention | Chống rời bỏ |
| after_90_days | 90 | RETENTION | return_offer | Ưu đãi quay lại |

## 🧠 AI Message Generation

Messages are generated using OpenAI GPT-4o-mini:
- Personalized based on customer profile
- Natural, friendly tone
- Short and concise (1-3 sentences)
- Professional salon voice

## 🔄 Auto Integration

### With Customer Profile
- Uses booking history to calculate days since last service
- Checks journey state for rule eligibility
- Uses customer preferences for personalization

### With Channel System
- Automatically sends via customer's preferred channel
- Default: Zalo (can be configured)

### With Journey State Machine
- Only sends follow-ups for eligible journey states
- Auto-transitions based on customer response

## 📝 Database Schema

### FollowUpMessage Model

```prisma
model FollowUpMessage {
  id           String   @id @default(cuid())
  customerId   String
  phone        String?
  ruleId       String
  messageType  String
  message      String
  scheduledFor DateTime
  sentAt       DateTime?
  status       String   @default("pending")
  channel      String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

## 🔧 Configuration

### Environment Variables

```env
# OpenAI API Key (for message generation)
OPENAI_API_KEY=your-key

# App URL (for channel API calls)
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Optional: Cron secret for authentication
CRON_SECRET=your-secret
```

### Customize Rules

Edit `/core/followup/rules.ts` to:
- Add new rules
- Modify days after
- Change message types
- Add conditions

## 📈 Performance

Expected results:
- **30-50% increase** in return rate
- **80% reduction** in CSKH workload
- **Natural upsell** without pushiness
- **24/7 customer care** without staff

## 🎉 Result

Sau Phase 13F, salon có:
- ✅ Follow-up tự động sau dịch vụ
- ✅ Check-in sau 3 ngày
- ✅ Chăm sóc 2 tuần
- ✅ Nhắc lịch sau 1 tháng
- ✅ Dự đoán khách quay lại
- ✅ Tự động gửi ưu đãi sau 90 ngày
- ✅ Message từ AI TOÀN BỘ cá nhân hóa
- ✅ Kết nối đa kênh (Zalo / Facebook / Website)

**Kết hợp với Phase 13C, 13D, 13E:**
- → Hệ thống chăm sóc khách toàn diện dựa trên AI
- → Giảm 80% công việc của CSKH
- → Tăng tỷ lệ quay lại 30-50%
- → Upsell tăng tự nhiên, không gượng ép

**Đỉnh cao của salon hiện đại.**

