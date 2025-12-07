# Phase 18 - AI Training System (ATS)

Hệ thống đào tạo nội bộ bằng AI - Chí Tâm Hair Salon.

## 🎯 Mục tiêu

Tạo hệ thống đào tạo AI để:
- Đào tạo Stylist, Lễ tân, Pha chế, CSKH Online
- Kiểm tra, chấm điểm, cấp chứng chỉ nội bộ
- Tạo kịch bản thực hành
- Phân tích phản hồi
- Xây lộ trình thăng hạng

## 📋 Module Structure

### 18A - Training Roles & Levels
- 4 Roles: RECEPTIONIST, STYLIST, ASSISTANT, CSKH_ONLINE
- 4 Levels: Beginner (1), Semi-Pro (2), Pro (3), Expert (4)

### 18B - Training Modules Library
- Kiến thức sản phẩm
- Kỹ thuật thực hành
- Kỹ năng giao tiếp
- SOP từng bộ phận
- Mindset & Văn hoá salon

### 18C - Training Exercises
- Multiple-choice quiz
- Case study
- Practical task
- Video/voice practice

### 18D - AI Roleplay Simulator
- AI đóng vai khách hàng (khó tính, kỹ, muốn rẻ, etc.)
- AI chấm điểm: Communication, Technical, Problem Solving, Upsale, Customer Experience

### 18E - Skill Assessment System
- 5 tiêu chí: Communication, Technical Understanding, Problem Solving, Upsale, Customer Experience
- AI scoring và feedback

### 18F - Progress Tracking Dashboard
- Module completion
- Progress percentage
- Average score
- Certificate level
- Skills map
- Promotion path

### 18G - Certification & Promotion Engine
- Auto issue certificates
- Promotion suggestions
- Next module recommendations
- Manager notifications

## 🗂️ Files Structure

```
prisma/
└── schema.prisma              # Updated - TrainingRole, TrainingLevel, TrainingProgress, TrainingExercise, ExerciseSubmission, RoleplaySession, Certification

app/
├── api/
│   └── training/
│       ├── roles/
│       │   └── init/
│       │       └── route.ts   # Initialize roles & levels
│       └── progress/
│           ├── get/
│           │   └── route.ts   # Get user progress
│           └── update/
│               └── route.ts   # Update progress
```

## 📊 Prisma Models

### TrainingRole
```prisma
model TrainingRole {
  id          String   @id @default(cuid())
  name        String   // RECEPTIONIST | STYLIST | ASSISTANT | CSKH_ONLINE
  description String?
  levels      TrainingLevel[]
}
```

### TrainingLevel
```prisma
model TrainingLevel {
  id          String   @id @default(cuid())
  roleId      String
  level       Int      // 1-4
  name        String
  description String?
  requirements Json?
  modules     String[]
  progress    TrainingProgress[]
  certifications Certification[]
}
```

### TrainingProgress
```prisma
model TrainingProgress {
  id          String   @id @default(cuid())
  userId      String
  levelId     String
  moduleId    String?
  lessonId    String?
  status      String   // not_started | in_progress | completed
  score       Int?
  completedAt DateTime?
}
```

### TrainingExercise
```prisma
model TrainingExercise {
  id          String   @id @default(cuid())
  lessonId    String
  type        String   // quiz | case_study | practical | video_voice
  title       String
  content     Json
  answer      Json?
  points      Int
  submissions ExerciseSubmission[]
}
```

### RoleplaySession
```prisma
model RoleplaySession {
  id          String   @id @default(cuid())
  userId      String
  role        String
  scenario    String
  persona     String
  messages    Json
  score       Int?
  assessment  Json?
  feedback    Json?
  status      String   // active | completed
}
```

### Certification
```prisma
model Certification {
  id          String   @id @default(cuid())
  userId      String
  levelId     String
  role        String
  level       Int
  issuedAt    DateTime
  expiresAt   DateTime?
}
```

## ✅ Phase 18 Checklist

- ✅ Prisma Models (7 models)
- ✅ Training Roles & Levels Structure
- ✅ API Initialize Roles
- ✅ API Progress Tracking
- ✅ Integration with Phase 15 (Training Module, Quiz, Simulation)
- ⏳ API Exercise Management (18C)
- ⏳ AI Roleplay Simulator (18D)
- ⏳ Skill Assessment System (18E)
- ⏳ Progress Dashboard UI (18F)
- ⏳ Certification Engine (18G)

## 🎉 Kết quả

Phase 18 đang được triển khai. Hệ thống sẽ bao gồm:
- ✅ Training Roles & Levels (4 roles, 4 levels)
- ✅ Progress Tracking
- ⏳ Exercises System
- ⏳ AI Roleplay
- ⏳ Certification Engine

**Chí Tâm Hair Salon sẽ có hệ thống đào tạo chuyên nghiệp nhất Việt Nam!**

