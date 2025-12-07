# Phase 18E - Skill Assessment System

Hệ thống AI chấm điểm năng lực toàn bộ nhân sự salon - Chí Tâm Hair Salon.

## 🎯 Mục tiêu

Tạo hệ thống đánh giá kỹ năng tự động bằng AI:
- Bộ tiêu chuẩn 5 kỹ năng cốt lõi
- AI chấm điểm từng nhân viên
- Phân tích điểm yếu
- Gợi ý cải thiện cá nhân hóa
- Báo cáo tiến bộ theo thời gian

## 📋 Skill Map (5 Kỹ năng chuẩn)

### 1. Communication (Giao tiếp) - 0-20 điểm
- Tone ấm, thân thiện, tự tin
- Dùng ngôn ngữ chuẩn thương hiệu Mina
- Không cụt lũn, không lạnh nhạt

### 2. Technical Knowledge (Kiến thức kỹ thuật) - 0-20 điểm
- Trả lời đúng kỹ thuật
- Không sai chuyên môn
- Biết phân tích tóc đúng cách

### 3. Problem Solving (Xử lý rủi ro) - 0-20 điểm
- Biết trấn an khách
- Giải thích hợp lý
- Đưa giải pháp an toàn

### 4. Customer Experience (Tạo trải nghiệm) - 0-20 điểm
- Theo đúng SOP 5 bước
- Biết hỏi - lắng nghe - tóm tắt nhu cầu
- Tạo cảm giác được quan tâm

### 5. Upsale Tinh Tế (Upsale) - 0-20 điểm
- Gợi ý đúng nhu cầu
- Không ép, không gây khó chịu
- Tự nhiên, nhà nghề

**Tổng điểm: 0-100**

**Mức năng lực:**
- 90-100: Master
- 80-89: Excellent
- 70-79: Good
- 60-69: Average
- < 60: Needs Improvement

## 🗂️ Files Structure

```
prisma/
└── schema.prisma              # SkillAssessment model

core/
├── skills/
│   └── scoreCalculator.ts     # Score calculation & level
└── prompts/
    ├── skillAssessmentPrompt.ts      # AI assessment prompt
    ├── weaknessAnalysisPrompt.ts     # Weakness analysis
    └── trainingRecommendationPrompt.ts # Training recommendations

app/
├── api/
│   └── training/
│       └── skill/
│           ├── assess/
│           │   └── route.ts   # Create skill assessment
│           ├── summary/
│           │   └── route.ts   # Get skill summary
│           └── history/
│               └── route.ts   # Get assessment history
└── (dashboard)/
    └── training/
        └── skills/
            └── assessments/
                └── page.tsx   # Skill Dashboard UI
```

## 📊 Prisma Model

### SkillAssessment
```prisma
model SkillAssessment {
  id                String   @id @default(cuid())
  staffId           String
  source            String   // roleplay | quiz | case_study | simulation
  sourceId          String?
  scenarioType      String?
  
  communication     Int      // 0-20
  technical         Int      // 0-20
  problemSolving    Int      // 0-20
  customerExperience Int     // 0-20
  upsale            Int      // 0-20
  
  totalScore        Int      // 0-100
  level             String   // Master | Excellent | Good | Average | Needs Improvement
  
  strengths         Json?
  improvements      Json?
  detailedFeedback  Json?
  weaknessAnalysis  Json?
  recommendations   Json?
  
  assessedBy        String?  // AI | manual
}
```

## 🚀 API Endpoints

### POST /api/training/skill/assess

Create skill assessment (AI chấm điểm).

**Request:**
```json
{
  "staffId": "user_id",
  "source": "roleplay",
  "sourceId": "session_id",
  "scenarioType": "khach_kho_tinh",
  "conversation": [...],
  "role": "STYLIST"
}
```

**Response:**
```json
{
  "success": true,
  "assessment": {
    "id": "...",
    "totalScore": 87,
    "level": "Excellent",
    "communication": 18,
    "technical": 17,
    ...
  }
}
```

### GET /api/training/skill/summary

Get skill summary for a staff.

**Query Params:**
- `staffId`: User ID

**Response:**
```json
{
  "success": true,
  "summary": {
    "totalAssessments": 10,
    "averageScore": 82,
    "currentLevel": "Excellent",
    "skillAverages": {...},
    "trends": [...],
    "weakSkills": ["Upsale"],
    "latestAssessment": {...}
  }
}
```

### GET /api/training/skill/history

Get assessment history.

## 🎨 UI Features

### Skill Assessment Dashboard
- Overall score card
- Skill radar chart (5 skills)
- Individual skill cards with progress bars
- Trend chart (score over time)
- Weak skills highlight
- Training recommendations
- Latest assessment details
- Assessment history

## 🤖 AI Features

### Skill Assessment
- AI chấm điểm theo 5 tiêu chí
- Detailed feedback cho từng skill
- Strengths & improvements

### Weakness Analysis
- Phát hiện điểm yếu
- Phân tích nguyên nhân gốc rễ
- Common errors identification

### Training Recommendations
- Personalized learning path
- Module recommendations
- Timeline estimation

## ✅ Phase 18E Checklist

- ✅ Prisma Model (SkillAssessment)
- ✅ Skill Map (5 skills)
- ✅ Score Calculator
- ✅ AI Assessment Prompt
- ✅ Weakness Analysis Prompt
- ✅ Training Recommendation Prompt
- ✅ API Assess Skills
- ✅ API Skill Summary
- ✅ API Skill History
- ✅ UI Skill Dashboard
- ✅ Radar Chart
- ✅ Trend Chart
- ✅ Integration với Roleplay

## 🎉 Kết quả

Sau Phase 18E, salon đã có:
- ✅ Hệ thống chấm điểm kỹ năng bằng AI
- ✅ Bộ tiêu chuẩn 5 kỹ năng chuẩn quốc tế
- ✅ Phân tích điểm mạnh - yếu tự động
- ✅ Gợi ý cải thiện cá nhân hóa
- ✅ Dashboard trực quan với charts
- ✅ Trend tracking
- ✅ Integration với Roleplay & Exercises

**Đây là bộ máy đánh giá năng lực salon chuyên nghiệp nhất Việt Nam!**

