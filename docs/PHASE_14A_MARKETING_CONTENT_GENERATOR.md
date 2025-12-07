# Phase 14A - Marketing Content Generator

Hệ thống AI tạo nội dung marketing hàng ngày cho salon (Facebook, Instagram, TikTok).

## 🎯 Mục tiêu

- AI tạo nội dung Facebook/TikTok/Instagram hàng ngày
- Đúng tone thương hiệu Chí Tâm Hair Salon
- Có CTA thông minh
- Có hashtag tối ưu
- Dễ dùng & dễ mở rộng
- Tích hợp được vào Workflow Engine

## 🗂️ Files Structure

```
core/
└── prompts/
    └── marketingContentPrompt.ts  # Marketing content prompt template

app/
├── api/
│   ├── marketing/
│   │   └── content/
│   │       └── route.ts          # Marketing content API
│   └── workflow/
│       └── route.ts              # Unified workflow API (includes marketing-content)
└── (dashboard)/
    └── marketing/
        └── content/
            └── page.tsx          # Marketing content UI
```

## 🚀 Usage

### Direct API

```typescript
POST /api/marketing/content
{
  "topic": "Uốn sóng Hàn",
  "goal": "Đặt lịch tuần này",
  "platform": "facebook",
  "style": "friendly",
  "additionalContext": "Optional additional context"
}
```

Response:
```json
{
  "success": true,
  "headline": "Tóc uốn sóng Hàn – đẹp tự nhiên mà vẫn giữ nếp lâu ✨",
  "content": "Chị thích phong cách nhẹ nhàng chuẩn Hàn?...",
  "hashtags": "#ChitamHairSalon #UonSongHan #LayerHair #TocDepMoiNgay",
  "cta": "Nếu chị muốn em giữ slot đẹp trong tuần thì nhắn em ngay nha ❤️",
  "style": "friendly"
}
```

### Via Workflow Engine

```typescript
POST /api/workflow
{
  "type": "marketing-content",
  "payload": {
    "topic": "Uốn sóng Hàn",
    "goal": "Đặt lịch tuần này",
    "platform": "facebook",
    "style": "friendly"
  }
}
```

### UI Page

Navigate to: `/marketing/content`

Fill in the form:
- Chủ đề (Topic)
- Mục tiêu (Goal)
- Platform (Facebook/Instagram/TikTok)
- Phong cách (Friendly/Luxury/Energetic/Professional)
- Context thêm (Optional)

Click "Tạo nội dung marketing" → Get AI-generated content

## 📊 Content Styles

| Style | Description | Use Case |
|-------|-------------|----------|
| friendly | Thân thiện, gần gũi | General posts, community engagement |
| luxury | Sang trọng, cao cấp | Premium services, VIP offerings |
| energetic | Tươi trẻ, năng động | Trendy styles, Gen Z audience |
| professional | Chuyên nghiệp, uy tín | Educational content, testimonials |

## 📱 Platform Guidelines

### Facebook
- Content: Chi tiết hơn, có thể dài
- Hashtags: 3-5 hashtag phổ biến
- CTA: "Nhắn tin ngay", "Đặt lịch ngay", "Comment để được tư vấn"

### Instagram
- Content: Visual-first, ngắn gọn, súc tích
- Hashtags: 5-10 hashtag mix phổ biến và niche
- CTA: "DM để đặt lịch", "Swipe để xem thêm", "Save để tham khảo"

### TikTok
- Content: Ngắn gọn, catchy, trending
- Hashtags: 3-5 hashtag trending
- CTA: "Comment ý kiến", "Follow để xem thêm", "Nhắn tin để book"

## 🎨 Output Structure

```typescript
{
  headline: string;      // Tiêu đề ngắn gọn, hấp dẫn
  content: string;       // Nội dung chính (2-4 câu)
  hashtags: string;      // Hashtags cách nhau bằng dấu cách
  cta: string;          // Call-to-action ngắn gọn
  style: string;        // Phong cách đã chọn
}
```

## 🔧 Integration

### With Workflow Engine

Marketing Content Generator đã được tích hợp vào Workflow Engine:
- Workflow type: `marketing-content`
- Validation: Checks for topic, goal, platform, style
- Prompt: Uses `marketingContentPrompt`
- Output: JSON format with headline, content, hashtags, cta

### With Automation

Có thể tự động hóa việc tạo content:
- Schedule daily content generation
- Generate content for upcoming campaigns
- Bulk generate for multiple topics

## 📝 Examples

### Example 1: Friendly Style for Facebook

**Input:**
```json
{
  "topic": "Uốn layer sóng Hàn",
  "goal": "Đặt lịch tuần này",
  "platform": "facebook",
  "style": "friendly"
}
```

**Output:**
```json
{
  "headline": "Tóc uốn sóng Hàn – đẹp tự nhiên mà vẫn giữ nếp lâu ✨",
  "content": "Chị thích phong cách nhẹ nhàng chuẩn Hàn? Mẫu uốn sóng layer này giúp tóc bồng bềnh, mềm mại và ôm mặt siêu xinh luôn ạ.\n\nKỹ thuật uốn của Chí Tâm đảm bảo tóc khỏe, mượt, không khô xơ sau khi làm.",
  "hashtags": "#ChitamHairSalon #UonSongHan #LayerHair #TocDepMoiNgay",
  "cta": "Nếu chị muốn em giữ slot đẹp trong tuần thì nhắn em ngay nha ❤️",
  "style": "friendly"
}
```

### Example 2: Luxury Style for Instagram

**Input:**
```json
{
  "topic": "Nhuộm nâu lạnh premium",
  "goal": "Tăng nhận diện thương hiệu",
  "platform": "instagram",
  "style": "luxury"
}
```

## 🎉 Result

Sau Phase 14A, salon có:
- ✅ AI tạo content marketing hàng ngày
- ✅ Chuẩn tone thương hiệu Chí Tâm
- ✅ CTA thông minh, tự nhiên
- ✅ Hashtag tối ưu cho từng platform
- ✅ UI dễ sử dụng
- ✅ API tích hợp vào automation
- ✅ Kết nối với Workflow Engine

**Salon giờ có AI Marketing Writer riêng.**

