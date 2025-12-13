# Prisma Seed Guide - CTSS

## ✅ Đã hoàn thành

### 1. Tạo file `prisma/seed.js` (CommonJS)
- ✅ Dùng PrismaClient để seed
- ✅ Tạo salon mặc định + salon test (nếu chưa có)
- ✅ Tạo users test 2 salon (nếu chưa có)
- ✅ Không tạo trùng (check tồn tại trước khi tạo)
- ✅ Migrate existing records không có salonId vào salon mặc định

### 2. Update `package.json`
- ✅ Thêm prisma seed config:
  ```json
  "prisma": {
    "seed": "node prisma/seed.js"
  }
  ```

## 🚀 Hướng dẫn chạy

### Bước 1: Chạy migration (bắt buộc)
```bash
# Nếu chưa có migration
npx prisma migrate dev --name add_salon_multi_tenant

# Hoặc nếu đã có migration nhưng chưa apply
npx prisma migrate deploy
```

### Bước 2: Generate Prisma Client
```bash
npx prisma generate
```

### Bước 3: Chạy seed
```bash
npx prisma db seed
```

Hoặc dùng script trong package.json:
```bash
npm run db:seed
```

## 📋 Seed Script Logic

### 1. Tạo Salons
- **Default Salon**: "Chí Tâm Hair Salon" (slug: `chi-tam`)
- **Test Salon**: "Test Salon 2" (slug: `salon-test-2`)
- Chỉ tạo nếu chưa tồn tại (check bằng slug)

### 2. Migrate Existing Data
- Users không có `salonId` → gán vào salon mặc định
- Customers không có `salonId` → gán vào salon mặc định
- Bookings không có `salonId` → gán vào salon mặc định
- Services không có `salonId` → gán vào salon mặc định
- Products không có `salonId` → gán vào salon mặc định
- Invoices không có `salonId` → gán vào salon mặc định

### 3. Tạo Users Test

**Salon 1 (Default):**
- Admin User (0900000001)
- Manager User (0900000002)
- Reception User (0900000003)
- Stylist User (0900000004)
- Assistant User (0900000005)

**Salon 2 (Test):**
- Admin Salon 2 (0900000011)
- Manager Salon 2 (0900000012)

**Logic:**
- Check tồn tại bằng phone
- Nếu tồn tại: update role và salonId nếu khác
- Nếu chưa tồn tại: tạo mới

## 🔧 Troubleshooting

### Lỗi: "Table 'Salon' does not exist"
**Giải pháp:** Chạy migration trước:
```bash
npx prisma migrate dev --name add_salon_multi_tenant
npx prisma generate
npx prisma db seed
```

### Lỗi: "PrismaClient is not generated"
**Giải pháp:** Generate Prisma Client:
```bash
npx prisma generate
```

### Lỗi: "Database connection failed"
**Giải pháp:** Kiểm tra `.env` file có `DATABASE_URL` đúng không:
```bash
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/ctss"
```

## 📝 Output mẫu

Khi chạy thành công:
```
🌱 Seeding salons and users...
✅ Created default salon: Chí Tâm Hair Salon
✅ Created second salon: Test Salon 2
✅ Migrated 5 users to default salon
✅ Migrated 10 customers to default salon
✅ Migrated 3 bookings to default salon
✅ Migrated 2 services to default salon
✅ Migrated 5 products to default salon
✅ Migrated 1 invoices to default salon
✅ Created user: 0900000001 (ADMIN, salon: clxxx...)
✅ Created user: 0900000002 (MANAGER, salon: clxxx...)
...
✨ Seeding completed!
```

## ✅ Checklist

- [x] File `prisma/seed.js` đã được tạo (CommonJS)
- [x] `package.json` đã có prisma seed config
- [x] Seed script check tồn tại trước khi tạo (không trùng)
- [x] Seed script migrate existing data vào salon mặc định
- [ ] Migration đã được chạy
- [ ] Seed đã được test thành công

