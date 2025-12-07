# Phase 14D - Remarketing AI Engine

Hệ thống AI remarketing cá nhân hóa, tự động phân nhóm khách hàng và tạo nội dung phù hợp.

## 🎯 Mục tiêu

- Gửi nội dung marketing **đúng nhóm khách**
- Đúng thời điểm
- Đúng mục tiêu
- Đúng phong cách Chí Tâm Hair Salon
- Không spam, không gây khó chịu

**Y như hệ thống CRM enterprise (Sephora, L'Oréal Pro, Aveda).**

## 🔗 Integration

Sử dụng dữ liệu từ:
- **Customer Journey** (Phase 13B)
- **Memory System** (Phase 13C)
- **Insight Engine** (Phase 13D)
- **Follow-up Engine** (Phase 13F)

→ Tạo **remarketing thông minh**, không spam, không gây khó chịu.

## 🗂️ Files Structure

```
core/
├── remarketing/
│   ├── segmentCustomers.ts  # Customer segmentation engine
│   └── index.ts
└── prompts/
    └── remarketingPrompt.ts  # Remarketing message prompt

app/
├── api/
│   └── marketing/
│       └── remarketing/
│           └── route.ts      # Remarketing API
└── (dashboard)/
    └── marketing/
        └── remarketing/
            └── page.tsx      # Remarketing UI
```

## 🚀 Usage

### API Endpoint

```typescript
POST /api/marketing/remarketing
{
  "segment": "not_return_60",
  "goal": "kéo khách quay lại",
  "platform": "zalo",
  "style": "friendly"
}
```

Response:
```json
{
  "success": true,
  "segment": "not_return_60",
  "totalCustomers": 25,
  "results": [
    {
      "customerId": "...",
      "phone": "0123456789",
      "name": "Chị Lan",
      "message": "Dạo này tóc chị còn vào nếp tốt không ạ? ...",
      "cta": "Nếu chị muốn giữ lịch trong tuần thì nhắn em một tiếng...",
      "reason": "Khách 60 ngày chưa quay lại — có nguy cơ form tóc xuống.",
      "segment": "not_return_60",
      "priority": "HIGH"
    }
  ]
}
```

### UI Page

Navigate to: `/marketing/remarketing`

Fill in:
- Chọn nhóm khách hàng (Segment)
- Mục tiêu chiến dịch (Goal)
- Platform (Zalo/Facebook/Instagram/SMS)
- Phong cách (Friendly/Luxury/Professional)

Click "Tạo nội dung remarketing" → Get personalized messages for each customer

## 📊 Customer Segments

| Segment | Description | Use Case |
|---------|-------------|----------|
| `recent_uon` | Khách mới uốn trong 30 ngày | Follow-up care, product recommendations |
| `recent_nhuom` | Khách mới nhuộm trong 30 ngày | Color care tips, maintenance |
| `not_return_60` | 60 ngày chưa quay lại | Re-engagement, check-in |
| `vip` | Khách VIP (loyalty score ≥ 80) | Special offers, VIP treatment |
| `high_risk` | Khách có nguy cơ churn | Churn prevention, win-back |
| `all` | Tất cả khách hàng | Broad campaigns |

## 🧠 Segmentation Logic

### Recent Uon (recent_uon)
- Filter: Bookings with "uốn/perm/curl" service
- Timeframe: Last 30 days
- Use for: Care tips, product recommendations

### Recent Nhuom (recent_nhuom)
- Filter: Bookings with "nhuộm/color/dye/balayage" service
- Timeframe: Last 30 days
- Use for: Color maintenance, touch-up reminders

### Not Return 60 (not_return_60)
- Filter: Last booking ≥ 60 days ago
- Use for: Re-engagement, win-back campaigns

### VIP
- Filter: Loyalty score ≥ 80 or high lifetime value
- Use for: Exclusive offers, premium experiences

### High Risk
- Filter: High churn probability OR ≥ 90 days no return OR risk signals
- Use for: Churn prevention, special attention

## 📝 Output Structure

```typescript
{
  customerId: string;
  phone: string;
  name?: string;
  message: string;      // Personalized remarketing message
  cta: string;         // Call-to-action
  reason: string;      // Why this message was suggested
  segment: string;     // Customer segment
  priority: "HIGH" | "MEDIUM" | "LOW";
}
```

## 🎨 Message Personalization

Messages are personalized based on:
- **Service History**: Last services, frequency
- **Preferences**: Hair style preferences, product preferences
- **Insights**: Behavior patterns, churn risk, loyalty score
- **Journey State**: Current stage in customer journey
- **Booking Patterns**: Visit frequency, preferred times

## 🔄 Integration Points

### With Follow-up Engine
- Can trigger automated follow-ups based on segments
- Combine with scheduled follow-ups

### With Channel System
- Send via Zalo, Facebook, Instagram, SMS
- Unified channel intake API

### With Customer Profile
- Use full customer data for personalization
- Update profile after sending

## 📈 Best Practices

1. **Don't Over-Message**: Respect customer preferences
2. **Personalize**: Use actual customer data
3. **Time It Right**: Consider last visit, journey state
4. **Soft CTA**: Never hard sell, be friendly
5. **Test Segments**: Start small, scale based on results

## 🎉 Result

Sau Phase 14D, salon có:
- ✅ Hệ thống REMARKETING AI như chuỗi salon lớn
- ✅ Tự động phân nhóm khách
- ✅ Tạo nội dung riêng cho từng khách
- ✅ CTA theo hành vi
- ✅ Cá nhân hóa theo hồ sơ trong CTSS
- ✅ Dùng được cho Zalo / Facebook / Instagram / SMS
- ✅ Tích hợp với Workflow Engine

**Đây là module mà 99% salon không có được.**

