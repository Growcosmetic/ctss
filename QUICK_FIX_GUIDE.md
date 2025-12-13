# Quick Fix Guide - Migration Error P3014

## 🎯 Giải pháp nhanh nhất (Khuyến nghị)

### Bước 1: Chạy SQL migration thủ công

```bash
psql "postgresql://ctssuser:Ctss%402025@localhost:5432/ctss" -f prisma/migrations/manual_migration.sql
```

Hoặc copy-paste SQL từ file `prisma/migrations/manual_migration.sql` vào psql.

### Bước 2: Mark migration là applied (nếu muốn dùng Prisma migrate sau này)

```bash
# Tạo migration folder
mkdir -p prisma/migrations/$(date +%Y%m%d%H%M%S)_add_salon_multi_tenant

# Copy SQL vào đó
cp prisma/migrations/manual_migration.sql prisma/migrations/$(date +%Y%m%d%H%M%S)_add_salon_multi_tenant/migration.sql

# Mark as applied
npx prisma migrate resolve --applied add_salon_multi_tenant
```

### Bước 3: Generate Prisma Client

```bash
npx prisma generate
```

### Bước 4: Chạy seed

```bash
npx prisma db seed
```

---

## ✅ Verify

```bash
# Mở Prisma Studio để kiểm tra
npx prisma studio
```

Hoặc kiểm tra bằng SQL:
```sql
-- Kiểm tra salon đã được tạo
SELECT * FROM "Salon";

-- Kiểm tra users có salonId
SELECT id, name, phone, "salonId" FROM "User" LIMIT 5;

-- Kiểm tra customers có salonId
SELECT id, name, phone, "salonId" FROM "Customer" LIMIT 5;
```

---

## 🔄 Nếu vẫn gặp lỗi

### Option A: Reset database (CHỈ KHI DEVELOPMENT, SẼ MẤT DATA)

```bash
npx prisma migrate reset
npx prisma db push
npx prisma generate
npx prisma db seed
```

### Option B: Dùng `db push` với force reset

```bash
npx prisma db push --force-reset
npx prisma generate
npx prisma db seed
```

**⚠️ CẢNH BÁO:** `--force-reset` sẽ xóa TẤT CẢ dữ liệu trong database!

---

## 📝 Checklist

- [ ] Đã chạy SQL migration thủ công
- [ ] Đã generate Prisma Client
- [ ] Đã chạy seed thành công
- [ ] Đã verify data trong Prisma Studio

