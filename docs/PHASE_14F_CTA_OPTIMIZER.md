# Phase 14F - CTA Optimizer Engine

Hệ thống AI tối ưu CTA (Call-to-Action) tự động theo hành vi khách, segment, và mục tiêu chiến dịch.

## 🎯 Mục tiêu

Tối ưu CTA để:
- Tăng tỉ lệ khách nhắn tin
- Tăng tỉ lệ đặt lịch
- Tăng tương tác
- Phù hợp với từng segment
- Cá nhân hóa theo hành vi

## 🔗 Integration

Sử dụng dữ liệu từ:
- **Customer Journey** (Phase 13B)
- **Memory System** (Phase 13C)
- **Insight Engine** (Phase 13D)
- **Segmentation** (Phase 14D)

→ Tạo **CTA tối ưu** cho từng khách hàng.

## 🗂️ Files Structure

```
core/
├── cta/
│   ├── ctaRules.ts       # Rule-based CTA recommendations
│   ├── ctaOptimizer.ts   # CTA optimization logic
│   └── index.ts
└── prompts/
    └── ctaPrompt.ts      # CTA optimization prompt

app/
├── api/
│   └── marketing/
│       └── cta/
│           ├── route.ts           # CTA optimizer API (batch)
│           └── optimize/
│               └── route.ts       # Single CTA optimization
└── (dashboard)/
    └── marketing/
        └── cta/
            └── page.tsx          # CTA optimizer UI
```

## 🚀 Usage

### Batch CTA Optimization API

```typescript
POST /api/marketing/cta
{
  "segment": "not_return_60",
  "goal": "kéo khách quay lại",
  "platform": "zalo",
  "contentType": "remarketing"
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
      "ruleCTA": "Tuần này salon còn vài slot đẹp...",
      "aiCTA": {
        "cta": "Dạo này tóc chị còn vào nếp tốt không ạ?...",
        "explanation": "CTA này phù hợp vì khách 60 ngày chưa quay lại...",
        "priority": "HIGH"
      },
      "recommended": "Dạo này tóc chị còn vào nếp tốt không ạ?..."
    }
  ]
}
```

### Single CTA Optimization API

```typescript
POST /api/marketing/cta/optimize
{
  "customer": { ...customerProfile },
  "segment": "vip",
  "goal": "upsell premium service",
  "platform": "zalo",
  "contentType": "remarketing"
}
```

### UI Page

Navigate to: `/marketing/cta`

Fill in:
- Nhóm khách hàng (Segment)
- Mục tiêu chiến dịch (Goal)
- Platform
- Loại nội dung (Optional)

Click "Tối ưu CTA" → Get optimized CTAs

## 📊 CTA Rules by Segment

| Segment | Rule CTA | Use Case |
|---------|----------|----------|
| recent_uon | "Nếu chị muốn em giữ slot đẹp trong tuần thì nhắn em nha ❤️" | Booking focus |
| recent_nhuom | "Nếu chị cần em xem lại tone hay chăm thêm cho bóng mượt thì nhắn em nha ✨" | Care focus |
| not_return_60 | "Tuần này salon còn vài slot đẹp, em giữ cho chị luôn cho tiện nha 💛" | Win-back |
| vip | "Chị muốn em ưu tiên lịch riêng cho chị không ạ? Em giữ ngay cho chị ♥️" | Exclusive |
| high_risk | "Nếu tóc chị có gì chưa ổn, cứ nhắn em xem lại ngay ạ 🥰" | Soft approach |

## 🧠 CTA Optimization Logic

### Two-Tier Approach:
1. **Rule-based CTA**: Quick, proven CTAs by segment
2. **AI-based CTA**: Personalized CTAs based on customer data

### Recommendation:
- Prefer AI CTA if available (more personalized)
- Fallback to rule CTA if AI fails
- Combine both for best results

## 🎨 CTA Guidelines

### Good CTAs:
- ✅ "Nếu chị muốn em giữ slot đẹp trong tuần thì nhắn em nha ❤️"
- ✅ "Chị có câu hỏi gì về tóc, cứ nhắn em để em tư vấn nha ✨"
- ✅ "Em giữ lịch đẹp cho chị luôn cho tiện nha 💛"

### Bad CTAs (Avoid):
- ❌ "Đặt lịch ngay!" (too pushy)
- ❌ "Click vào link để đặt lịch" (not natural)
- ❌ "Hãy đặt lịch ngay hôm nay" (hard sale)

## 🔧 Integration Points

### With Marketing Modules:
- **14A (Content)**: Can optimize CTA in posts
- **14B (Reels)**: Can optimize CTA in video scripts
- **14C (Calendar)**: Can optimize CTA in calendar items
- **14D (Remarketing)**: Auto-optimize CTA per customer
- **13F (Follow-up)**: Can optimize follow-up CTAs

## 📝 Output Structure

```typescript
{
  ruleCTA?: string;      // Rule-based CTA
  aiCTA: {
    cta: string;         // AI-generated CTA
    explanation?: string; // Why this CTA
    priority?: string;   // HIGH | MEDIUM | LOW
  };
  recommended: string;   // Best CTA (AI preferred)
}
```

## 🎉 Result

Sau Phase 14F, salon có:
- ✅ CTA tối ưu theo segment
- ✅ CTA cá nhân hóa theo hành vi
- ✅ CTA theo platform (Zalo/Facebook/SMS)
- ✅ Kết hợp rule + AI
- ✅ Tích hợp vào toàn bộ marketing system

**Nhiều salon lớn còn chưa có chuyện này.**

---

# 🎊 PHASE 14 HOÀN THÀNH

**Trọn bộ AI Marketing Engine:**

- ✅ **14A**: Marketing Content Generator
- ✅ **14B**: Reels / Shorts Engine
- ✅ **14C**: Marketing Calendar Generator
- ✅ **14D**: Remarketing AI Engine
- ✅ **14E**: Content Library Manager
- ✅ **14F**: CTA Optimizer Engine

**Salon anh giờ có hệ thống Marketing AI hoàn chỉnh như các thương hiệu lớn.**

