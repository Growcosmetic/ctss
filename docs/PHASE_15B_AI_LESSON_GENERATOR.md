# Phase 15B - AI Lesson Generator

Hệ thống tự động tạo bài học kỹ thuật cho stylist bằng AI.

## 🎯 Mục tiêu

Tự động tạo bài học kỹ thuật chất lượng cao:
- Topic-based generation
- Level-based content (beginner/intermediate/advanced)
- Auto-save to curriculum
- Structured JSON output
- Ready for Quiz & Simulation (Phase 15C-15D)

## 📋 Tính năng

1. **AI Lesson Generation**:
   - Input: Topic, Module, Level, Focus
   - Output: Complete lesson with title, text, key points, mistakes, fixes, tips
   - Auto-save to database

2. **Content Structure**:
   - Title: Short, clear, reflects topic
   - Text: Detailed content (500-1000 words)
   - Key Points: 3-7 important takeaways
   - Mistakes: Common errors
   - Fixes: Solutions for mistakes
   - Tips: Master stylist tips
   - Duration: Estimated time

3. **Integration**:
   - Automatically saves to selected module
   - Auto-assigns order if not provided
   - Displays in Curriculum UI
   - Ready for Quiz generation (Phase 15C)

## 🗂️ Files Structure

```
core/
└── prompts/
    └── trainingLessonPrompt.ts    # Updated with full prompt

app/
├── api/
│   └── training/
│       └── lesson/
│           └── generate/
│               └── route.ts       # AI lesson generation API
└── (dashboard)/
    └── training/
        └── generator/
            └── page.tsx           # Lesson generator UI
```

## 🚀 API Endpoint

### Generate Lesson

```
POST /api/training/lesson/generate
{
  "moduleId": "...",
  "topic": "Uốn nóng - Kiểm soát độ ẩm tóc (Hydration Control)",
  "order": 1,              // Optional - auto-assigned if not provided
  "level": "beginner",     // Optional: beginner | intermediate | advanced
  "focus": "Safety và step-by-step"  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "lesson": {
    "id": "...",
    "moduleId": "...",
    "title": "Kiểm soát độ ẩm khi uốn nóng",
    "content": {
      "title": "...",
      "text": "...",
      "keyPoints": [...],
      "mistakes": [...],
      "fixes": [...],
      "tips": [...],
      "duration": "20m"
    },
    "order": 1,
    "module": {
      "id": "...",
      "title": "Technical Skills",
      "order": 3
    }
  },
  "message": "Lesson generated and saved successfully"
}
```

## 🎨 UI Page

**Path:** `/training/generator`

**Features:**
- Module selection dropdown
- Topic input
- Optional: Order, Level, Focus
- Generate button
- Display generated lesson
- Link to Curriculum

**Workflow:**
1. Select module
2. Enter topic
3. (Optional) Set order, level, focus
4. Click "Tạo bài học"
5. AI generates lesson
6. Lesson auto-saved to module
7. Display result with full content

## 📝 Example Output

**Input:**
```
Topic: "Uốn nóng - Kiểm soát độ ẩm tóc (Hydration Control)"
Module: Technical Skills
Level: Intermediate
```

**AI Output:**
```json
{
  "title": "Kiểm soát độ ẩm khi uốn nóng",
  "text": "Độ ẩm quyết định 70% độ an toàn của tóc khi uốn nóng. Khi tóc quá ướt, thuốc uốn sẽ không thấm đều. Khi tóc quá khô, liên kết disulfide dễ bị đứt gãy...",
  "keyPoints": [
    "Test độ ẩm trước khi lên thuốc",
    "Phân vùng tóc để làm khô đều",
    "Không sấy quá khô – gây đứt liên kết",
    "Độ ẩm lý tưởng: 25–35%"
  ],
  "mistakes": [
    "Lên thuốc khi tóc còn quá ướt",
    "Sấy quá khô khiến thuốc không thấm",
    "Không kiểm tra độ mềm trước khi cuốn"
  ],
  "fixes": [
    "Điều chỉnh lại độ ẩm bằng mist",
    "Dùng khăn giấy kiểm soát nước",
    "Test elasticity liên tục"
  ],
  "tips": [
    "Luôn test độ ẩm ở nhiều điểm trên đầu",
    "Giữ độ ẩm đều giữa các lớp tóc",
    "Sử dụng heat protectant để giảm tổn thương"
  ],
  "duration": "20m"
}
```

## 🔧 Technical Details

### AI Model
- Model: `gpt-4o-mini`
- Max tokens: 1500
- Temperature: 0.7 (balanced creativity)
- Response format: JSON object

### Error Handling
- JSON parsing fallback
- Module validation
- Auto-order assignment
- Graceful error messages

### Auto-Save
- Saves immediately after generation
- Includes module relationship
- Auto-assigns order if not provided
- Updates curriculum instantly

## ✅ Phase 15B Checklist

- ✅ Enhanced prompt template
- ✅ AI lesson generation API
- ✅ Auto-save to database
- ✅ Lesson generator UI
- ✅ Error handling
- ✅ Integration with Curriculum
- ✅ Documentation

## 🎯 Next Steps (Phase 15C)

- AI Quiz & Test Engine
- Generate questions from lessons
- Auto-grading
- Progress tracking

## 🎉 Kết quả

Sau Phase 15B, salon đã có:
- ✅ AI tự tạo bài học chất lượng cao
- ✅ Nội dung chuẩn quốc tế – đào tạo thật
- ✅ Cá nhân hoá theo salon Chí Tâm
- ✅ Lưu trực tiếp vào hệ thống Training Modules
- ✅ UI để sinh bài học tức thì
- ✅ Nền móng cho Quiz Engine & Simulation

**Salon anh giờ có AI Hair Academy đúng nghĩa!**

