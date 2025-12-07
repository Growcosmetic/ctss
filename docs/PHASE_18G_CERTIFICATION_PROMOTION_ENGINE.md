# Phase 18G - Certification & Promotion Engine

Hệ thống tự động cấp chứng chỉ và thăng cấp cho nhân sự salon.

## 🎯 Mục tiêu

Tạo hệ thống:
- Tự động cấp chứng chỉ Level 1 → Level 4
- Tự động xét thăng cấp
- Điều kiện rõ ràng, minh bạch
- AI đánh giá và đưa feedback
- Lưu chứng chỉ trong hồ sơ

## 📋 Certification Levels

### Stylist
- Level 1: Assistant
- Level 2: Junior Stylist
- Level 3: Senior Stylist
- Level 4: Master Stylist

### Receptionist
- Level 1: Receptionist Trainee
- Level 2: Receptionist
- Level 3: Senior Receptionist
- Level 4: Front Desk Leader

### Assistant (Pha Chế)
- Level 1: Prep Staff
- Level 2: Mixing Technician
- Level 3: Senior Mixer
- Level 4: Pha Chế Leader

### CSKH Online
- Level 1: Trainee
- Level 2: CSKH
- Level 3: Senior CSKH
- Level 4: CSKH Leader

## 📋 Promotion Criteria

### Điều kiện chung (mọi bộ phận):
- Hoàn thành module đào tạo: ≥ 80%
- Điểm roleplay trung bình: ≥ 75
- Không kỹ năng nào dưới: 12/20
- Ít nhất 3 roleplay đạt: ≥ 80
- Không vi phạm SOP trong 30 ngày

### Điều kiện riêng theo level:
- **Level 2**: Module bắt buộc (tùy vai trò)
- **Level 3**: Roleplay bắt buộc (khách khó tính, sợ hư tóc, etc.)
- **Level 4**: Technical score ≥ 18/20, không lỗi trong 60 ngày

## 🗂️ Files Structure

```
core/
├── certification/
│   └── promotionCriteria.ts    # Promotion criteria rules
└── prompts/
    └── certificationPrompt.ts  # AI certificate generator

app/
├── api/
│   └── training/
│       └── certification/
│           ├── check-promotion/
│           │   └── route.ts   # Check eligibility
│           ├── promote/
│           │   └── route.ts   # Promote staff
│           └── list/
│               └── route.ts   # List certifications
└── (dashboard)/
    └── training/
        └── certification/
            └── page.tsx        # Certification dashboard
```

## 🚀 API Endpoints

### GET /api/training/certification/check-promotion

Check promotion eligibility.

**Query Params:**
- `staffId`: Required

**Response:**
```json
{
  "success": true,
  "eligible": true/false,
  "criteria": {...},
  "status": {
    "moduleCompletionRate": {...},
    "averageRoleplayScore": {...},
    "minRoleplayCount": {...},
    "minSkillScore": {...},
    "specificModules": [...],
    "specificRoleplays": [...]
  }
}
```

### POST /api/training/certification/promote

Promote staff to next level.

**Request:**
```json
{
  "staffId": "user_id",
  "autoPromote": true
}
```

**Response:**
```json
{
  "success": true,
  "certification": {...},
  "newLevel": 2,
  "levelName": "Junior Stylist",
  "message": "..."
}
```

### GET /api/training/certification/list

List certifications.

**Query Params:**
- `staffId`: Filter by staff
- `role`: Filter by role

## 🎨 UI Features

### Certification Dashboard
- Current level display
- Next level requirements
- Eligibility status
- Requirements checklist (with ✅/❌)
- Specific modules/roleplays required
- Promotion button (if eligible)
- Certifications history

## ✅ Phase 18G Checklist

- ✅ Promotion Criteria Rules
- ✅ AI Certificate Generator Prompt
- ✅ API Check Promotion Eligibility
- ✅ API Promote Staff
- ✅ API List Certifications
- ✅ UI Certification Dashboard
- ✅ Requirements Status Display
- ✅ Auto-promotion logic
- ✅ Integration with User model

## 🎉 Kết quả

Sau Phase 18G, salon đã có:
- ✅ Hệ thống chứng chỉ tự động
- ✅ Promotion criteria rõ ràng
- ✅ AI certificate generation
- ✅ Auto-promotion checking
- ✅ Certification dashboard
- ✅ Requirements tracking
- ✅ Certification history

**Phase 18 - AI Training System HOÀN THÀNH 100%!**

Salon Chí Tâm chính thức trở thành HỌC VIỆN ĐÀO TẠO bằng AI đầu tiên tại Việt Nam.

