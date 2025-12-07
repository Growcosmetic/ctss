# Phase 15A - Training Curriculum System

Hệ thống chương trình đào tạo stylist chuẩn quốc tế + tự động hóa bằng AI.

## 🎯 Mục tiêu

Tạo khung chương trình đào tạo stylist chuyên nghiệp:
- Module-based structure
- Lesson-based content
- Database persistence
- API management
- UI display
- Foundation cho Phase 15B-15F

## 📋 Cấu trúc Chương trình Đào tạo

### MODULE 1 — Foundation (Nền tảng)
- Hình dáng thuần (Pure Forms)
- Dáng tóc không tầng (Solid Form)
- Layering cơ bản
- Độ rơi – độ nâng – độ chuyển tiếp
- Tư duy cắt tóc trong sáng tạo (Tư duy Prismatic)
- Phân tích khuôn mặt

### MODULE 2 — Chemical Theory (Lý thuyết hóa chất)
- Cấu trúc sợi tóc
- pH – độ giãn – độ đàn hồi
- Nguyên lý uốn nóng/lạnh
- Nguyên lý ép – duỗi
- Thuốc thời hệ (thế hệ 4, 4.5, 5 của Plexis)

### MODULE 3 — Technical Skills (Kỹ thuật thực thi)
- Uốn nóng
- Uốn lạnh
- Duỗi phồng
- Nhuộm
- Tẩy – phục hồi
- Oxygen control – Hydration control

### MODULE 4 — Creative Styling (Sáng tạo tạo kiểu)
- Kiểu layer Hàn
- Curtain bangs
- Wolf cut
- Blow styling
- Sấy finish

### MODULE 5 — Consultation & Communication
- Tư vấn khách
- Đặt câu hỏi
- Gợi ý style thông minh
- Xử lý khách khó
- Upsell tinh tế

### MODULE 6 — Safety & Troubleshooting
- Tóc cháy
- Tóc không vào nếp
- Xử lý màu sai
- Khắc phục lỗi kỹ thuật

## 🗂️ Database Schema

```prisma
model TrainingModule {
  id          String           @id @default(cuid())
  title       String
  desc        String?
  order       Int
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  lessons     TrainingLesson[]
}

model TrainingLesson {
  id          String           @id @default(cuid())
  moduleId    String
  title       String
  content     Json?
  order       Int
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  module      TrainingModule   @relation(fields: [moduleId], references: [id], onDelete: Cascade)
}
```

## 🚀 API Endpoints

### 1. Add Module
```
POST /api/training/module/add
{
  "title": "Foundation (Nền tảng)",
  "desc": "Module nền tảng về hình dáng và tư duy cắt tóc",
  "order": 1
}
```

### 2. Add Lesson
```
POST /api/training/lesson/add
{
  "moduleId": "...",
  "title": "Hình dáng thuần (Pure Forms)",
  "content": {
    "text": "...",
    "keyPoints": [...]
  },
  "order": 1
}
```

### 3. Get Curriculum
```
GET /api/training/curriculum
```

Response:
```json
{
  "success": true,
  "modules": [
    {
      "id": "...",
      "title": "Foundation",
      "desc": "...",
      "order": 1,
      "lessons": [
        {
          "id": "...",
          "title": "...",
          "content": {...},
          "order": 1
        }
      ]
    }
  ],
  "totalModules": 6,
  "totalLessons": 30
}
```

## 🎨 UI Page

**Path:** `/training/curriculum`

**Features:**
- Display all modules
- Display all lessons in each module
- Color-coded modules
- Responsive design
- Clean, premium UI

## 📝 AI Prompt Template

**File:** `/core/prompts/trainingLessonPrompt.ts`

Template để AI tự động tạo nội dung bài học:
- Topic-based generation
- Level-based content (beginner/intermediate/advanced)
- Structured JSON output
- Key points, common mistakes, tips

**Usage (Phase 15B):**
```typescript
import { trainingLessonPrompt } from "@/core/prompts/trainingLessonPrompt";

const prompt = trainingLessonPrompt({
  topic: "Uốn nóng - Kỹ thuật cơ bản",
  module: "Technical Skills",
  level: "beginner",
  focus: "Safety và step-by-step"
});
```

## 🔧 Files Structure

```
prisma/
└── schema.prisma           # TrainingModule, TrainingLesson models

app/
├── api/
│   └── training/
│       ├── module/
│       │   └── add/
│       │       └── route.ts    # Add module API
│       ├── lesson/
│       │   └── add/
│       │       └── route.ts    # Add lesson API
│       └── curriculum/
│           └── route.ts        # Get curriculum API
└── (dashboard)/
    └── training/
        └── curriculum/
            └── page.tsx        # Curriculum UI

core/
└── prompts/
    └── trainingLessonPrompt.ts # AI lesson generator prompt
```

## ✅ Phase 15A Checklist

- ✅ Prisma models (TrainingModule, TrainingLesson)
- ✅ API: Add module
- ✅ API: Add lesson
- ✅ API: Get curriculum
- ✅ UI: Curriculum display page
- ✅ AI prompt template (foundation for 15B)
- ✅ Documentation

## 🎯 Next Steps (Phase 15B)

- AI Lesson Generator: Tự động tạo nội dung bài học từ topic
- Integration với OpenAI
- Auto-save lessons to database
- Enhanced lesson content structure

## 🎉 Kết quả

Sau Phase 15A, salon đã có:
- ✅ Khung chương trình đào tạo stylist chuẩn Hàn – quốc tế
- ✅ Database models để lưu curriculum
- ✅ API để quản lý module và lesson
- ✅ UI để xem curriculum
- ✅ Nền tảng để AI tự sinh bài học ở Phase 15B

**Stylist Academy của Chí Tâm Hair Salon đã hình thành!**

