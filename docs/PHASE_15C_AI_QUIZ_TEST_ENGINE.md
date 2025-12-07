# Phase 15C - AI Quiz & Test Engine

Hệ thống thi - kiểm tra - chấm điểm stylist tự động bằng AI.

## 🎯 Mục tiêu

Tự động tạo và chấm điểm quiz cho stylist:
- Generate quiz questions from lesson content
- Auto-grading
- Detailed explanations
- Progress tracking
- Foundation for Certification (Phase 15F)

## 📋 Tính năng

1. **AI Quiz Generation**:
   - Generate questions from lesson content
   - Configurable question count (default: 5)
   - Configurable difficulty (easy/medium/hard)
   - Multiple choice (4 options)
   - One correct answer per question
   - Detailed explanations

2. **Auto-Grading**:
   - Instant scoring
   - Percentage calculation
   - Pass/fail determination (≥70% pass)
   - Detailed results per question

3. **Result Storage**:
   - Save quiz results to database
   - Track user performance
   - Link to lesson and module

## 🗂️ Database Schema

```prisma
model TrainingQuiz {
  id        String   @id @default(cuid())
  lessonId  String   @unique
  questions Json     // Array of question objects
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  lesson    TrainingLesson @relation(...)
  results   TrainingQuizResult[]
}

model TrainingQuizResult {
  id        String   @id @default(cuid())
  userId    String
  quizId    String
  score     Int
  total     Int
  answers   Json     // Array of answer indices
  createdAt DateTime @default(now())

  quiz      TrainingQuiz @relation(...)
  user      User @relation(...)
}
```

## 🚀 API Endpoints

### 1. Generate Quiz

```
POST /api/training/quiz/generate
{
  "lessonId": "...",
  "questionCount": 5,        // Optional: default 5
  "difficulty": "medium"     // Optional: easy | medium | hard
}
```

**Response:**
```json
{
  "success": true,
  "quiz": {
    "id": "...",
    "lessonId": "...",
    "questions": [
      {
        "question": "...",
        "options": ["A", "B", "C", "D"],
        "correctIndex": 1,
        "explanation": "..."
      }
    ],
    "lesson": {...}
  },
  "message": "Quiz generated successfully"
}
```

### 2. Get Quiz

```
GET /api/training/quiz/get?id=...
// or
GET /api/training/quiz/get?lessonId=...
```

### 3. Submit Quiz

```
POST /api/training/quiz/submit
{
  "quizId": "...",
  "answers": [0, 1, 2, 0],  // Array of answer indices
  "userId": "..."
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "id": "...",
    "score": 4,
    "total": 5,
    "percentage": 80,
    "passed": true
  },
  "details": [
    {
      "questionIndex": 0,
      "question": "...",
      "userAnswer": 0,
      "correctAnswer": 0,
      "isCorrect": true,
      "explanation": "..."
    }
  ],
  "questions": [...]
}
```

## 🎨 UI Pages

### Quiz Taking Interface

**Path:** `/training/quiz/[id]`

**Features:**
- Display quiz questions
- Radio button selection
- Progress indicator
- Submit button
- Results display with explanations
- Pass/fail indication
- Retry option

**Workflow:**
1. Load quiz by ID
2. Display questions
3. User selects answers
4. Submit quiz
5. Auto-grade
6. Display results with explanations
7. Option to retry

## 📝 Question Format

```json
{
  "question": "Độ ẩm lý tưởng trước khi lên thuốc uốn nóng là?",
  "options": [
    "10–15%",
    "25–35%",
    "50–60%",
    "0%"
  ],
  "correctIndex": 1,
  "explanation": "Độ ẩm 25–35% giúp thuốc thấm đều mà không làm phá vỡ liên kết quá mức. Độ ẩm quá thấp (10–15%) khiến thuốc không thấm, độ ẩm quá cao (50–60%) gây tổn thương tóc."
}
```

## 🔧 Technical Details

### AI Model
- Model: `gpt-4o-mini`
- Max tokens: 2000
- Temperature: 0.7
- Response format: JSON object

### Grading Logic
- Pass threshold: 70%
- Score calculation: (correct answers / total questions) * 100
- Detailed feedback per question

### Error Handling
- JSON parsing fallback
- Question validation
- Answer validation
- Graceful error messages

## ✅ Phase 15C Checklist

- ✅ Prisma models (TrainingQuiz, TrainingQuizResult)
- ✅ Quiz generator prompt
- ✅ API: Generate quiz
- ✅ API: Get quiz
- ✅ API: Submit & auto-grade
- ✅ UI: Quiz taking interface
- ✅ UI: Results & explanations
- ✅ Error handling
- ✅ Documentation

## 🎯 Next Steps (Phase 15D)

- Simulation Engine
- Role-play scenarios
- Customer interaction simulation
- Real-time feedback

## 🎉 Kết quả

Sau Phase 15C, salon đã có:
- ✅ Hệ thống tạo quiz tự động
- ✅ Câu hỏi chuẩn theo từng bài học
- ✅ Chấm điểm tự động
- ✅ Giải thích đáp án chi tiết
- ✅ Lưu kết quả stylist
- ✅ UI làm bài & xem kết quả
- ✅ Nền tảng cho Certification System (Phase 15F)

**Salon anh giờ có AI EXAM ENGINE, đào tạo stylist bài bản!**

