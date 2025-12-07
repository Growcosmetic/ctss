# Phase 15E - Skill Tracking Dashboard

Hệ thống theo dõi toàn bộ tiến độ, điểm số, kỹ năng, lịch sử mô phỏng, và bài học đã học của từng stylist.

## 🎯 Mục tiêu

Tạo AI Learning Dashboard để:
- Theo dõi trình độ từng stylist theo thời gian
- Biểu đồ kỹ năng (5 dimensions)
- Tổng điểm bài test (Phase 15C)
- Lịch sử mô phỏng (Phase 15D)
- Bài học đã hoàn thành
- AI gợi ý "Next Skill to Improve"
- Đánh giá năng lực cho Certification (Phase 15F)

## 📋 Tính năng

1. **Skill Progress Tracking**:
   - Auto-save từ quiz results
   - Auto-save từ simulation evaluations
   - Track 5 skill dimensions
   - Historical data

2. **Skill Aggregation**:
   - Calculate averages per skill
   - Trend analysis (up/down/stable)
   - Overall progress score

3. **AI Skill Insights**:
   - Identify weakest skill
   - Recommend improvements
   - Suggest lessons to review
   - Suggest simulation scenarios

4. **Dashboard Visualization**:
   - Skill averages with progress bars
   - Trend indicators
   - History timeline
   - Quiz results summary
   - Simulation sessions summary

## 🗂️ Database Schema

```prisma
model SkillProgress {
  id        String   @id @default(cuid())
  userId    String
  skill     String   // questioning | analysis | suggestion | emotion | closing
  score     Int      // 0-10
  source    String   // quiz | simulation
  refId     String?  // quizId hoặc simulationId (optional reference)
  createdAt DateTime @default(now())

  user      User @relation(...)
}
```

## 🚀 API Endpoints

### 1. Skill Overview

```
POST /api/training/skill/overview
{
  "userId": "..."
}
```

**Response:**
```json
{
  "success": true,
  "overview": {
    "overallAverage": 7,
    "skillAverages": {
      "questioning": 8,
      "analysis": 7,
      "suggestion": 6,
      "emotion": 8,
      "closing": 5
    },
    "trends": {
      "questioning": "up",
      "analysis": "stable",
      "suggestion": "down",
      "emotion": "up",
      "closing": "stable"
    },
    "completedQuizzes": 10,
    "completedSimulations": 5,
    "totalSkillsTracked": 50
  },
  "quizResults": [...],
  "simulations": [...],
  "skillHistory": [...]
}
```

### 2. AI Skill Insight

```
POST /api/training/skill/insight
{
  "userId": "..."
}
```

**Response:**
```json
{
  "success": true,
  "insight": {
    "weakSkill": "closing",
    "reason": "...",
    "practice": "...",
    "recommendedLessons": ["...", "..."],
    "suggestedSimulations": [
      {
        "scenario": "...",
        "persona": "...",
        "focus": "..."
      }
    ],
    "improvementPlan": "...",
    "expectedOutcome": "..."
  },
  "skillAverages": {...}
}
```

## 🔧 Skill Aggregation

### Auto-save from Quiz

When quiz is submitted:
- Calculate skill scores from overall performance
- Distribute score across all 5 skills
- Save to `SkillProgress` table

### Auto-save from Simulation

When simulation is evaluated:
- Extract skill scores from evaluation
- Save individual scores for each skill
- Track improvement over time

## 🎨 UI Dashboard

**Path:** `/training/skills`

**Features:**
- Overview stats (overall average, quizzes, simulations, tracked)
- Skill averages with progress bars
- Trend indicators (📈 📉 ➡️)
- AI Skill Insights section
- Skill history timeline
- Quiz results summary
- Simulation sessions summary

**Components:**
1. Stats Cards: 4 overview metrics
2. Skill Grid: 5 skills with averages and trends
3. AI Insight: Weak skill analysis and recommendations
4. History: Recent skill progress entries
5. Results: Quiz and simulation summaries

## 📊 Skill Dimensions

1. **questioning** (Đặt câu hỏi): 0-10
2. **analysis** (Phân tích): 0-10
3. **suggestion** (Gợi ý): 0-10
4. **emotion** (Xử lý cảm xúc): 0-10
5. **closing** (Chốt dịch vụ): 0-10

## ✅ Phase 15E Checklist

- ✅ Prisma model (SkillProgress)
- ✅ Skill aggregator (addSkillProgress)
- ✅ Auto-save from quiz submit
- ✅ Auto-save from simulation evaluation
- ✅ API: Skill overview
- ✅ API: AI skill insight
- ✅ UI: Skill dashboard
- ✅ Trend analysis
- ✅ Documentation

## 🎯 Next Steps (Phase 15F)

- Certification Flow
- Automatic certification based on skill thresholds
- Certificate generation
- Certification tracking

## 🎉 Kết quả

Sau Phase 15E, salon đã có:
- ✅ Theo dõi tiến độ stylist theo ngày
- ✅ Biểu đồ điểm từng kỹ năng
- ✅ Lưu lịch sử quiz & mô phỏng
- ✅ Engine tính điểm tự động
- ✅ AI gợi ý kỹ năng cần cải thiện
- ✅ Chuẩn bị 100% cho cấp chứng chỉ (Phase 15F)

**Đây là "AI Training Dashboard" mà các học viện tóc quốc tế đang dùng!**

