# Phase 14B - Reels / Shorts Engine

Hệ thống AI tạo kịch bản video ngắn (10-30s) cho TikTok, Instagram Reels, YouTube Shorts, Facebook Shorts.

## 🎯 Mục tiêu

- AI tạo ý tưởng video ngắn
- Kịch bản chi tiết 10-30 giây
- Gợi ý thoại, visual, nhạc
- Gợi ý góc quay, shot list
- Phù hợp với TikTok, Instagram Reels, YouTube Shorts, Facebook Shorts

## 🗂️ Files Structure

```
core/
└── prompts/
    └── reelsPrompt.ts          # Reels/shorts prompt template

app/
├── api/
│   └── marketing/
│       └── reels/
│           └── route.ts        # Reels script API
└── (dashboard)/
    └── marketing/
        └── reels/
            └── page.tsx        # Reels generator UI
```

## 🚀 Usage

### API Endpoint

```typescript
POST /api/marketing/reels
{
  "topic": "Uốn layer Hàn",
  "goal": "Viral",
  "platform": "tiktok",
  "style": "luxury",
  "additionalContext": "Optional context"
}
```

Response:
```json
{
  "success": true,
  "idea": "Biến mái tóc thường thành mái tóc sóng Hàn mềm mượt chỉ trong vài giây",
  "hook": "Đây là lý do 1000+ khách chọn uốn tại Chí Tâm ✨",
  "script": "1) Camera zoom nhanh vào mái tóc khô xơ...",
  "visualGuide": [
    "Shot 1: Close-up before tóc khô xơ",
    "Shot 2: Slow motion after uốn",
    "Shot 3: Stylist chỉnh form",
    "Shot 4: Quay 360° ánh sáng tự nhiên"
  ],
  "audioSuggestion": "Nhạc trending TikTok: tone chill luxury",
  "cta": "Muốn tóc vào nếp mềm như vậy? Nhắn em giữ lịch đẹp cho mình nha ❤️",
  "duration": "10-20s",
  "style": "luxury",
  "hashtags": "#ChitamHairSalon #UonSongHan #TocDep"
}
```

### UI Page

Navigate to: `/marketing/reels`

Fill in the form:
- Chủ đề (Topic)
- Mục tiêu (Goal)
- Nền tảng (Platform)
- Phong cách (Style)
- Context thêm (Optional)

Click "Tạo kịch bản video" → Get AI-generated script

## 📊 Video Styles

| Style | Description | Use Case |
|-------|-------------|----------|
| viral | Hấp dẫn, trending, dễ share | Maximize reach, go viral |
| chill | Thư giãn, nhẹ nhàng | Lifestyle content, behind-the-scenes |
| luxury | Sang trọng, cao cấp | Premium services, VIP offerings |
| professional | Chuyên nghiệp, uy tín | Educational, how-to content |

## 📱 Platform Guidelines

### TikTok
- Hook cực mạnh 1-3 giây đầu
- Trend sounds, trending hashtags
- Quick cuts, dynamic
- CTA: "Follow", "Comment", "DM"

### Instagram Reels
- Visual-first, aesthetic
- Trending audio
- Use trending hashtags
- CTA: "Save", "Share", "DM để book"

### YouTube Shorts
- Educational/entertaining
- Clear value proposition
- YouTube trending sounds
- CTA: "Subscribe", "Watch full video", "Book now"

### Facebook Shorts
- Informative, engaging
- Clear messaging
- Facebook trending sounds
- CTA: "Comment", "Share", "Message us"

## 🎬 Output Structure

```typescript
{
  idea: string;              // Ý tưởng tổng thể
  hook: string;              // Hook 1-3 giây đầu
  script: string;            // Kịch bản chi tiết
  visualGuide: string[];     // Shot list từng cảnh
  audioSuggestion: string;   // Gợi ý nhạc/âm thanh
  cta: string;              // Call-to-action
  duration: string;         // Thời lượng video
  style: string;            // Phong cách
  hashtags?: string;        // Hashtag trending
}
```

## 🎥 Video Structure

### 1. Hook (1-3s)
Câu mở đầu cực hấp dẫn, gây tò mò ngay từ giây đầu.

### 2. Content (10-20s)
Nội dung chính, giải quyết vấn đề/thể hiện giá trị.

### 3. CTA (2-3s)
Call-to-action rõ ràng, tự nhiên.

## 📝 Example Output

**Input:**
```json
{
  "topic": "Uốn layer Hàn",
  "goal": "Viral",
  "platform": "tiktok",
  "style": "luxury"
}
```

**Output:**
```json
{
  "idea": "Biến mái tóc thường thành mái tóc sóng Hàn mềm mượt chỉ trong vài giây",
  "hook": "Đây là lý do 1000+ khách chọn uốn tại Chí Tâm ✨",
  "script": "1) Camera zoom nhanh vào mái tóc khô xơ.\n2) Cut chuyển sang tóc sau uốn – sóng mềm, bóng mượt.\n3) Stylist vuốt nhẹ để lộ độ đàn hồi.\n4) Voice-over: 'Muốn tóc đẹp chuẩn Hàn? Chọn đúng nơi – đẹp đúng chuẩn.'",
  "visualGuide": [
    "Shot 1: Close-up before tóc khô xơ",
    "Shot 2: Slow motion after uốn",
    "Shot 3: Stylist chỉnh form",
    "Shot 4: Quay 360° ánh sáng tự nhiên"
  ],
  "audioSuggestion": "Nhạc trending TikTok: tone chill luxury",
  "cta": "Muốn tóc vào nếp mềm như vậy? Nhắn em giữ lịch đẹp cho mình nha ❤️",
  "duration": "10-20s",
  "style": "luxury"
}
```

## 🎨 Features

1. **Strong Hook**: Cực mạnh ở 1-3 giây đầu để giữ viewer
2. **Detailed Script**: Kịch bản chi tiết từng bước
3. **Visual Guide**: Shot list cụ thể, dễ thực hiện
4. **Audio Suggestion**: Gợi ý nhạc phù hợp platform
5. **Platform-Optimized**: Tối ưu cho từng platform
6. **Style Variations**: 4 phong cách khác nhau

## 🔧 Production Tips

1. **Hook is Critical**: Hook quyết định 80% thành công
2. **Quick Cuts**: Nhiều cut giữ viewer engaged
3. **Trending Audio**: Sử dụng trending sounds
4. **Visual Quality**: Đảm bảo ánh sáng tốt, góc quay đẹp
5. **CTA Clear**: CTA rõ ràng, dễ thực hiện

## 🎉 Result

Sau Phase 14B, salon có:
- ✅ AI tạo Reels Script hàng ngày
- ✅ Gợi ý shot list từng cảnh
- ✅ Hook mở đầu cực mạnh
- ✅ Visual guide chi tiết
- ✅ Audio gợi ý phù hợp
- ✅ CTA theo phong cách salon
- ✅ UI đẹp, dùng ngay
- ✅ JSON sạch để automation

**Salon giờ có AI Creative Director riêng.**

