# Phase 18F - Progress Tracking Dashboard

Hệ thống theo dõi tiến độ học tập, năng lực và sự phát triển của toàn bộ nhân sự salon.

## 🎯 Mục tiêu

Tạo dashboard tổng quan để:
- Theo dõi tiến độ học tập từng nhân viên
- Hiển thị KPIs chính (completion rate, skill scores, etc.)
- Phát hiện điểm yếu và cảnh báo
- Gợi ý lộ trình học tập cá nhân hóa
- Theo dõi level & certification progress

## 📋 Dashboard Features

### 1. KPI Cards
- **Completion Rate**: % module đã hoàn thành
- **Average Skill Score**: Điểm trung bình 5 kỹ năng
- **Roleplay Count**: Số buổi roleplay đã làm
- **Improvement Rate**: % tăng điểm so với lần trước
- **Current Level**: Level hiện tại (1-4)

### 2. Level Progress Indicator
- Tiến độ lên level tiếp theo
- Số module đã hoàn thành / tổng số
- Progress bar với %

### 3. Skill Radar Chart
- Biểu đồ radar 5 kỹ năng
- Communication, Technical, Problem Solving, Customer Experience, Upsale
- Visualize điểm mạnh/yếu

### 4. Weakness Alerts
- Tự động phát hiện kỹ năng yếu (< 14/20)
- Cảnh báo với màu đỏ
- Gợi ý module cần học

### 5. Progress Timeline
- Timeline 30 ngày gần nhất
- Hiển thị module completed & roleplay sessions
- Với điểm số

### 6. Next Steps Recommendations (AI)
- AI đề xuất lộ trình tiếp theo
- Ưu tiên theo điểm yếu
- Timeline & target score

### 7. Certifications
- Danh sách chứng chỉ đã đạt
- Level & role
- Ngày cấp

## 🗂️ Files Structure

```
app/
├── api/
│   └── training/
│       └── dashboard/
│           ├── route.ts              # Dashboard data aggregation
│           ├── staff-summary/
│           │   └── route.ts         # Staff KPI & summary
│           └── recommendations/
│               └── route.ts         # AI recommendations
└── (dashboard)/
    └── training/
        └── dashboard/
            └── page.tsx             # Dashboard UI

core/
└── prompts/
    └── dashboardRecommendationPrompt.ts  # AI recommendation prompt
```

## 🚀 API Endpoints

### GET /api/training/dashboard

Get aggregated dashboard data.

**Query Params:**
- `staffId`: Filter by staff (optional)
- `branchId`: Filter by branch (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "staff": [...],
    "assessments": [...],
    "progress": [...],
    "roleplays": [...],
    "certifications": [...],
    "modules": [...]
  }
}
```

### GET /api/training/dashboard/staff-summary

Get staff summary with KPIs.

**Query Params:**
- `staffId`: Required

**Response:**
```json
{
  "success": true,
  "summary": {
    "staff": {...},
    "kpis": {
      "completionRate": 75,
      "averageSkillScore": 82,
      "roleplayCount": 12,
      "roleplayAverage": 85,
      "improvementRate": 5
    },
    "skillAverages": {...},
    "weakSkills": [...],
    "levelProgress": {...},
    "timeline": [...],
    "certifications": [...]
  }
}
```

### GET /api/training/dashboard/recommendations

Get AI-powered recommendations.

**Query Params:**
- `staffId`: Required

**Response:**
```json
{
  "success": true,
  "recommendations": {
    "nextSteps": [...],
    "focusArea": "...",
    "timeline": "...",
    "targetScore": "..."
  }
}
```

## 🎨 UI Components

### Dashboard Page
- KPI cards grid (5 cards)
- Level progress bar
- Skill radar chart (Recharts)
- Weakness alerts section
- Recommendations cards
- Progress timeline
- Certifications grid

## ✅ Phase 18F Checklist

- ✅ API Dashboard Data Aggregation
- ✅ API Staff Summary (KPIs)
- ✅ API Recommendations (AI)
- ✅ Dashboard UI Page
- ✅ KPI Cards
- ✅ Level Progress Indicator
- ✅ Skill Radar Chart
- ✅ Weakness Alerts
- ✅ Progress Timeline
- ✅ Recommendations Display
- ✅ Certifications Display

## 🎉 Kết quả

Sau Phase 18F, salon đã có:
- ✅ Dashboard tổng quan đào tạo
- ✅ KPI tracking tự động
- ✅ Skill visualization (Radar chart)
- ✅ Weakness detection & alerts
- ✅ AI-powered recommendations
- ✅ Progress timeline
- ✅ Level & certification tracking
- ✅ Personalized learning paths

**Salon Chí Tâm = Học viện đào tạo nội bộ chuyên nghiệp!**

