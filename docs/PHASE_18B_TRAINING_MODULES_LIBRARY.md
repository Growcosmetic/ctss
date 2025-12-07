# Phase 18B - Training Modules Library

Thư viện bài học nội bộ - Chí Tâm Hair Salon.

## 🎯 Mục tiêu

Xây dựng thư viện 52 modules đào tạo nội bộ cho 4 bộ phận:
- Lễ tân (Receptionist)
- Stylist
- Pha chế (Assistant)
- CSKH Online

## 📋 Cấu trúc 5 Nhóm Module

### 1. Kiến thức sản phẩm (12 modules)
- Tổng quan về tóc & hóa chất
- Plexis Hot Perm S1/S2
- Plexis Acid Aqua Gloss Curl
- Plexis Neutralizer
- Plexis Cold Perm H/N/S/SS
- Plexis Aqua Down Fit (Soft Straight)
- Plexis Treatment
- Joico KPAK
- Joico Moisture Recovery
- Phác đồ phục hồi Level 1, 2, 3

### 2. Kỹ thuật chuyên môn (16 modules)
- Uốn lạnh cơ bản & nâng cao
- Uốn nóng (Hot Perm) - Cơ bản & Sửa lỗi
- Nhuộm - Phối màu, Base 3, Màu Hàn, Màu hot trend
- Duỗi - Soft Straight
- Phục hồi - Xác định, Phác đồ, Trước/sau kỹ thuật
- Korean Styling
- Layer + Texture
- Sấy tạo form
- Kỹ thuật nâng cao tổng hợp

### 3. Giao tiếp & Tư vấn (10 modules)
- SOP 7 bước giao tiếp Chí Tâm
- Nghệ thuật tư vấn đúng nhu cầu
- Upsale tinh tế
- Xử lý rủi ro & phàn nàn
- Giao tiếp lễ tân (Đón khách, Báo stylist)
- Giao tiếp CSKH Online (SOP 8 bước, Chốt khách, Follow-up)
- Tư vấn nâng cao - Stylist

### 4. SOP từng bộ phận (8 modules)
- SOP Lễ tân - Đón khách & Checkout
- SOP Stylist - Tư vấn 5 bước, Matrix kỹ thuật
- SOP Pha chế - Chuẩn bị thuốc, Báo cáo hao hụt
- SOP CSKH Online - Xử lý inbox, Follow-up & KPI

### 5. Văn hóa - Tư duy - WOW (6 modules)
- Văn hóa Chí Tâm - Tinh thần phục vụ
- Văn hóa Chí Tâm - Tôn trọng & Kỷ luật
- Tư duy nghề tóc - Nghệ thuật & Dịch vụ
- Tư duy nghề tóc - Long-term & Bảo vệ tóc
- Phong cách giao tiếp thương hiệu - Mina
- Xây dựng trải nghiệm khách hàng

## 🗂️ Files Structure

```
prisma/
└── schema.prisma              # Updated TrainingModule (added category, role)

app/
├── api/
│   └── training/
│       ├── module/
│       │   └── create/
│       │       └── route.ts  # Create module
│       ├── lesson/
│       │   └── create/
│       │       └── route.ts  # Create lesson
│       └── library/
│           ├── init/
│           │   └── route.ts  # Initialize 52 modules
│           └── list/
│               └── route.ts  # List modules (with filters)
└── (dashboard)/
    └── training/
        └── library/
            └── page.tsx      # Library UI
```

## 📊 Prisma Schema Updates

### TrainingModule
```prisma
model TrainingModule {
  id          String   @id @default(cuid())
  title       String
  desc        String?
  order       Int
  category    String?  // product | technical | communication | sop | culture
  role        String?  // RECEPTIONIST | STYLIST | ASSISTANT | CSKH_ONLINE | ALL
  lessons     TrainingLesson[]
  
  @@index([category])
  @@index([role])
}
```

### TrainingLesson
```prisma
model TrainingLesson {
  id          String   @id @default(cuid())
  moduleId    String
  title       String
  content     Json?
  order       Int
  role        String?
  level       Int?     // 1-4
  exercises   TrainingExercise[]
  
  @@index([role])
  @@index([level])
}
```

## 🚀 API Endpoints

### POST /api/training/library/init

Initialize full training library (52 modules).

**Response:**
```json
{
  "success": true,
  "created": 52,
  "modules": 52,
  "message": "Initialized 52 training modules across 5 categories"
}
```

### GET /api/training/library/list

List all modules with filters.

**Query Params:**
- `category`: product | technical | communication | sop | culture
- `role`: RECEPTIONIST | STYLIST | ASSISTANT | CSKH_ONLINE
- `level`: 1-4

**Response:**
```json
{
  "success": true,
  "modules": [...],
  "grouped": {
    "product": [...],
    "technical": [...],
    ...
  },
  "total": 52
}
```

### POST /api/training/module/create

Create new module.

### POST /api/training/lesson/create

Create new lesson.

## 🎨 UI Features

### Training Library Page
- View all 52 modules grouped by category
- Filter by category (5 categories)
- Filter by role (4 roles)
- Stats per category
- Module cards with lessons count
- Link to module detail

## ✅ Phase 18B Checklist

- ✅ Prisma Schema updated (category, role)
- ✅ API Initialize Library (52 modules)
- ✅ API List Library (with filters)
- ✅ API Create Module/Lesson
- ✅ UI Library Page
- ✅ Module structure complete

## 🎉 Kết quả

Sau Phase 18B, salon đã có:
- ✅ 52 training modules đầy đủ
- ✅ 5 nhóm categories
- ✅ 4 roles support
- ✅ Library management UI
- ✅ Module/Lesson creation APIs

**Thư viện đào tạo nội bộ hoàn chỉnh - đủ để chạy một trường đào tạo salon thực thụ!**

