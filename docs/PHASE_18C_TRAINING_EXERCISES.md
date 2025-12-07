# Phase 18C - Training Exercises

Hệ thống bài tập, bài kiểm tra, thực hành - Chí Tâm Hair Salon.

## 🎯 Mục tiêu

Tạo hệ thống bài tập đầy đủ cho mỗi module:
- Quiz (Multiple choice)
- Case Study (Tình huống)
- Practical Task (Bài thực hành)
- Roleplay Practice (AI đóng vai khách)

## 📋 Exercise Types

### 1. Quiz - Multiple Choice
- Kiểm tra nhanh kiến thức
- Auto-grade (tự động chấm)
- Hỗ trợ multiple choice questions

### 2. Case Study - Tình huống
- Tình huống thực tế cho Stylist/Lễ tân/CSKH
- AI chấm điểm theo 5 tiêu chí
- Feedback chi tiết

### 3. Practical Task - Bài thực hành
- Bài tập thực hành cho Stylist & Pha chế
- Có thể submit ảnh/ghi chú
- AI hoặc giảng viên chấm điểm

### 4. Roleplay Practice - AI đóng vai khách
- AI đóng vai khách hàng (khó tính, kỹ, muốn rẻ, etc.)
- AI chấm điểm theo 5 tiêu chí
- Hỗ trợ real-time conversation

### 5. Video/Voice Practice
- Bài tập video/voice
- Record và submit

## 🗂️ Files Structure

```
prisma/
└── schema.prisma              # TrainingExercise, ExerciseSubmission models

core/
└── prompts/
    └── exerciseGradingPrompt.ts  # AI grading prompt

app/
├── api/
│   └── training/
│       └── exercise/
│           ├── create/
│           │   └── route.ts   # Create exercise
│           ├── list/
│           │   └── route.ts   # List exercises
│           ├── submit/
│           │   └── route.ts   # Submit exercise (AI grading)
│           ├── submissions/
│           │   └── route.ts   # Get submissions
│           └── init-examples/
│               └── route.ts   # Initialize example exercises
└── (dashboard)/
    └── training/
        └── exercise/
            └── [id]/
                └── page.tsx   # Exercise detail & submit page
```

## 📊 Prisma Models

### TrainingExercise
```prisma
model TrainingExercise {
  id          String   @id @default(cuid())
  lessonId    String
  type        String   // quiz | case_study | practical | video_voice | roleplay
  title       String
  content     Json     // Exercise content/questions
  answer      Json?    // Correct answers
  points      Int      @default(10)
  submissions ExerciseSubmission[]
}
```

### ExerciseSubmission
```prisma
model ExerciseSubmission {
  id          String   @id @default(cuid())
  exerciseId  String
  userId      String
  answer      Json
  score       Int?     // AI-graded score (0-100)
  feedback    Json?    // AI feedback
  submittedAt DateTime @default(now())
}
```

## 🚀 API Endpoints

### POST /api/training/exercise/create

Create new exercise.

**Request:**
```json
{
  "lessonId": "lesson_id",
  "type": "quiz",
  "title": "Quiz: Kiến thức cơ bản",
  "content": {...},
  "answer": [...],
  "points": 30
}
```

### GET /api/training/exercise/list

List exercises.

**Query Params:**
- `lessonId`: Filter by lesson
- `moduleId`: Filter by module
- `type`: Filter by type

### POST /api/training/exercise/submit

Submit exercise answer (auto-grade or AI-grade).

**Request:**
```json
{
  "exerciseId": "exercise_id",
  "userId": "user_id",
  "answer": {...}
}
```

**Response:**
```json
{
  "success": true,
  "submission": {...},
  "score": 85,
  "feedback": {
    "feedback": "...",
    "grading": {...},
    "strengths": [...],
    "improvements": [...]
  }
}
```

### GET /api/training/exercise/submissions

Get exercise submissions.

### POST /api/training/exercise/init-examples

Initialize example exercises.

## 🎨 UI Features

### Exercise Detail Page
- View exercise content
- Different UI for each exercise type
- Submit answer
- View results and feedback
- AI grading display

### Exercise Types UI
- **Quiz**: Radio buttons for multiple choice
- **Case Study**: Text areas for each question
- **Practical**: Text area for description/notes
- **Roleplay**: Conversation interface

## 🤖 AI Grading

### Case Study Grading
- Technical knowledge (0-20)
- Safety (0-20)
- Communication (0-20)
- Problem Solving (0-20)
- Professionalism (0-20)

### Roleplay Grading
- Communication (tone, warmth, confidence)
- Technical Understanding
- Problem Solving
- Upsale (natural, skillful, appropriate)
- Customer Experience (5-step SOP compliance)

## ✅ Phase 18C Checklist

- ✅ Prisma Models (TrainingExercise, ExerciseSubmission)
- ✅ API Create Exercise
- ✅ API List Exercises
- ✅ API Submit Exercise (with AI grading)
- ✅ API Get Submissions
- ✅ AI Grading Prompt (Case Study, Roleplay)
- ✅ UI Exercise Detail Page
- ✅ Auto-grade for Quiz
- ✅ AI-grade for Case Study, Roleplay, Practical
- ✅ Progress tracking integration

## 🎉 Kết quả

Sau Phase 18C, salon đã có:
- ✅ 4 loại bài tập (Quiz, Case Study, Practical, Roleplay)
- ✅ Auto-grade cho Quiz
- ✅ AI-grade cho Case Study & Roleplay
- ✅ Exercise management APIs
- ✅ Exercise submission UI
- ✅ AI feedback & scoring
- ✅ Progress tracking integration

**Hệ thống bài tập đào tạo hoàn chỉnh - AI chấm điểm tự động!**

