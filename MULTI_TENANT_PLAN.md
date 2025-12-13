# Multi-Tenant Implementation Plan - Phase 7

## 📋 Plan (Kế hoạch thực thi)

### 1. Database Schema Updates
- Thêm bảng `Salon` với các trường: id, name, slug, status, createdAt, updatedAt
- Thêm `salonId` vào các bảng chính:
  - User
  - Customer
  - Booking
  - Order (nếu có)
  - Service
  - Inventory (nếu có)
  - Membership (nếu có)
- Tạo indexes cho `salonId` trên các bảng
- Migration + seed 1 salon mặc định

### 2. Auth & Context Updates
- Thêm `salonId` vào User model
- Cập nhật auth để lưu `salonId` trong session/JWT
- Tạo helper `getCurrentSalonId()` cho API routes
- Tạo context/hook `useSalon()` cho frontend

### 3. API Guard & Filtering
- Tạo middleware `withSalonGuard` để validate salonId
- Cập nhật tất cả API routes để filter theo `salonId`
- Block truy cập chéo salon (trả 403)
- Helper function `getSalonFilter()` để tái sử dụng

### 4. UI Updates
- Hiển thị tên salon ở Topbar/Sidebar header
- (Optional) ADMIN có trang chọn salon / switch salon

### 5. Migration & Seed
- Tạo migration cho schema changes
- Seed 1 salon mặc định
- Seed 1 user admin cho salon mặc định

---

## 📁 Files Changed

### Database
1. `prisma/schema.prisma` - Thêm Salon model và salonId fields
2. `prisma/migrations/` - Migration files
3. `prisma/seed.ts` - Seed salon và user mặc định

### Backend
1. `lib/prisma.ts` - Helper functions
2. `lib/api-helpers.ts` - getCurrentSalonId, getSalonFilter
3. `middleware.ts` - Salon guard middleware
4. `app/api/**/route.ts` - Cập nhật tất cả API routes

### Frontend
1. `features/auth/hooks/useAuth.ts` - Thêm salonId
2. `features/auth/context/AuthContext.tsx` - Thêm salon context
3. `components/layout/Header.tsx` - Hiển thị salon name
4. `components/layout/Sidebar.tsx` - Hiển thị salon name

---

## 🔧 Implementation Details

### Salon Model
```prisma
model Salon {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  status    String   @default("ACTIVE") // ACTIVE, INACTIVE, SUSPENDED
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  users     User[]
  customers Customer[]
  bookings  Booking[]
  // ... other relations
}
```

### Helper Functions
```typescript
// lib/api-helpers.ts
export async function getCurrentSalonId(request: NextRequest): Promise<string | null> {
  // Get from session/JWT
}

export function getSalonFilter(salonId: string) {
  return { salonId };
}
```

---

## ✅ Manual Test Checklist

### Database
- [ ] Salon table created
- [ ] salonId added to all tables
- [ ] Indexes created
- [ ] Default salon seeded
- [ ] Default admin user seeded

### API
- [ ] All APIs filter by salonId
- [ ] Cross-salon access blocked (403)
- [ ] getCurrentSalonId works correctly

### UI
- [ ] Salon name displayed in Header
- [ ] Salon name displayed in Sidebar
- [ ] (Optional) Salon switcher works

### Data Isolation
- [ ] 2 salons data không lẫn nhau
- [ ] Users chỉ thấy data của salon mình
- [ ] Performance OK với indexes

