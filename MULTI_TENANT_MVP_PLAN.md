# Multi-Tenant MVP Implementation Plan - Phase 7A

## 📋 Plan (Kế hoạch thực thi)

### 1. Prisma Schema Updates
- Thêm model `Salon` với các trường: id, name, slug, status, createdAt, updatedAt
- Thêm `salonId` + relation vào các bảng cốt lõi:
  - User
  - Customer
  - Booking
  - Invoice (Order)
  - Service
  - Product (InventoryItem)
- Thêm indexes cho `salonId`
- Default: Tạo salon mặc định "Chí Tâm Hair Salon"

### 2. Migration & Seed
- Tạo migration Prisma
- Update seed script:
  - Tạo salon mặc định (slug: `chi-tam`)
  - Gán tất cả record cũ vào salon mặc định
  - Tạo 2 users test thuộc 2 salon khác nhau

### 3. Auth & Session Updates
- Đảm bảo session/JWT chứa `salonId`
- Tạo helper `getCurrentUser()` (nếu chưa có)
- Tạo helper `requireSalonId()` trả về salonId, nếu thiếu -> 401/403

### 4. API Guard Updates
Cập nhật các routes để filter theo salonId:
- `app/api/customers/route.ts`
- `app/api/bookings/route.ts`
- `app/api/customer/create-booking/route.ts`
- `app/api/bookings/check-conflict/route.ts`
- POS routes (nếu có)

### 5. Helper Functions
- `lib/api-helpers.ts` - requireSalonId(), getCurrentSalonId()
- `lib/auth-helpers.ts` - getCurrentUser() với salonId

---

## 📁 Files Changed

### Database
1. `prisma/schema.prisma` - Thêm Salon model và salonId fields
2. `prisma/migrations/` - Migration files
3. `prisma/seed.ts` - Seed salon và users

### Backend Helpers
1. `lib/api-helpers.ts` - requireSalonId(), getCurrentSalonId()
2. `lib/auth-helpers.ts` - getCurrentUser() với salonId

### API Routes
1. `app/api/customers/route.ts`
2. `app/api/bookings/route.ts`
3. `app/api/customer/create-booking/route.ts`
4. `app/api/bookings/check-conflict/route.ts`
5. POS routes (nếu có)

---

## ✅ Manual Test Checklist

1. [ ] Seed tạo 2 salon, 2 users khác salon
2. [ ] Login salon A -> không thấy customer/booking của salon B
3. [ ] Tạo booking/customer salon A -> salon B không thấy
4. [ ] Booking conflict check chỉ trong salon hiện tại
5. [ ] POS order chỉ trong salon hiện tại
6. [ ] Direct URL gọi API với id salon khác -> 403

