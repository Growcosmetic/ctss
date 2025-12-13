# Migration Guide - Add Salon Multi-Tenant

## ✅ Schema đã được sửa

### Thay đổi trong `prisma/schema.prisma`:

1. **Product model** - Đã thêm:
   ```prisma
   salon Salon @relation(fields: [salonId], references: [id], onDelete: Cascade)
   @@index([salonId])
   ```

2. **Tất cả các model khác đã có đầy đủ relation**:
   - ✅ User: có `salonId` và `salon Salon @relation(...)`
   - ✅ Customer: có `salonId` và `salon Salon @relation(...)`
   - ✅ Booking: có `salonId` và `salon Salon @relation(...)`
   - ✅ Service: có `salonId` và `salon Salon @relation(...)`
   - ✅ Invoice: có `salonId` và `salon Salon @relation(...)`
   - ✅ Product: có `salonId` và `salon Salon @relation(...)` (vừa thêm)

## 🚀 Các lệnh cần chạy

### 1. Format schema (đã chạy)
```bash
npx prisma format
```

### 2. Validate schema (đã chạy - ✅ valid)
```bash
npx prisma validate
```

### 3. Tạo migration

**Nếu database có quyền tạo shadow database:**
```bash
npx prisma migrate dev --name add_salon_multi_tenant
```

**Nếu không có quyền tạo shadow database (lỗi P3014):**

**Option A: Dùng `--skip-seed` và tạo migration SQL thủ công:**
```bash
# Tạo migration SQL file
npx prisma migrate dev --name add_salon_multi_tenant --create-only

# Sau đó chỉnh sửa migration SQL file trong prisma/migrations/.../migration.sql
# Và chạy:
npx prisma migrate dev
```

**Option B: Reset migration (nếu đang development và có thể mất data):**
```bash
# Backup database trước!
npx prisma migrate reset
npx prisma migrate dev --name add_salon_multi_tenant
```

**Option C: Tạo migration SQL thủ công:**

Tạo file `prisma/migrations/YYYYMMDDHHMMSS_add_salon_multi_tenant/migration.sql`:

```sql
-- CreateTable
CREATE TABLE "Salon" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Salon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Salon_slug_key" ON "Salon"("slug");

-- CreateIndex
CREATE INDEX "Salon_slug_idx" ON "Salon"("slug");

-- CreateIndex
CREATE INDEX "Salon_status_idx" ON "Salon"("status");

-- AlterTable: Add salonId to User
ALTER TABLE "User" ADD COLUMN "salonId" TEXT NOT NULL DEFAULT 'temp';
ALTER TABLE "User" ADD CONSTRAINT "User_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "User_salonId_idx" ON "User"("salonId");

-- AlterTable: Add salonId to Customer
ALTER TABLE "Customer" ADD COLUMN "salonId" TEXT NOT NULL DEFAULT 'temp';
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "Customer_salonId_idx" ON "Customer"("salonId");

-- AlterTable: Add salonId to Booking
ALTER TABLE "Booking" ADD COLUMN "salonId" TEXT NOT NULL DEFAULT 'temp';
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "Booking_salonId_idx" ON "Booking"("salonId");

-- AlterTable: Add salonId to Service
ALTER TABLE "Service" ADD COLUMN "salonId" TEXT NOT NULL DEFAULT 'temp';
ALTER TABLE "Service" ADD CONSTRAINT "Service_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "Service_salonId_idx" ON "Service"("salonId");

-- AlterTable: Add salonId to Product
ALTER TABLE "Product" ADD COLUMN "salonId" TEXT NOT NULL DEFAULT 'temp';
ALTER TABLE "Product" ADD CONSTRAINT "Product_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "Product_salonId_idx" ON "Product"("salonId");

-- AlterTable: Add salonId to Invoice
ALTER TABLE "Invoice" ADD COLUMN "salonId" TEXT NOT NULL DEFAULT 'temp';
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "Invoice_salonId_idx" ON "Invoice"("salonId");

-- Tạo salon mặc định và update tất cả records
INSERT INTO "Salon" (id, name, slug, status, "createdAt", "updatedAt")
VALUES ('default-salon-id', 'Chí Tâm Hair Salon', 'chi-tam', 'ACTIVE', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Update tất cả records với salonId mặc định
UPDATE "User" SET "salonId" = 'default-salon-id' WHERE "salonId" = 'temp';
UPDATE "Customer" SET "salonId" = 'default-salon-id' WHERE "salonId" = 'temp';
UPDATE "Booking" SET "salonId" = 'default-salon-id' WHERE "salonId" = 'temp';
UPDATE "Service" SET "salonId" = 'default-salon-id' WHERE "salonId" = 'temp';
UPDATE "Product" SET "salonId" = 'default-salon-id' WHERE "salonId" = 'temp';
UPDATE "Invoice" SET "salonId" = 'default-salon-id' WHERE "salonId" = 'temp';

-- Remove default value và make NOT NULL
ALTER TABLE "User" ALTER COLUMN "salonId" DROP DEFAULT;
ALTER TABLE "Customer" ALTER COLUMN "salonId" DROP DEFAULT;
ALTER TABLE "Booking" ALTER COLUMN "salonId" DROP DEFAULT;
ALTER TABLE "Service" ALTER COLUMN "salonId" DROP DEFAULT;
ALTER TABLE "Product" ALTER COLUMN "salonId" DROP DEFAULT;
ALTER TABLE "Invoice" ALTER COLUMN "salonId" DROP DEFAULT;
```

Sau đó chạy:
```bash
npx prisma migrate resolve --applied add_salon_multi_tenant
npx prisma migrate deploy
```

### 4. Chạy seed
```bash
npx prisma db seed
```

### 5. Generate Prisma Client
```bash
npx prisma generate
```

## 🔧 Nếu migration đang dở dang

### Reset migration development (chỉ khi development, sẽ mất data):
```bash
# Backup database trước!
npx prisma migrate reset
```

### Hoặc mark migration là applied (nếu đã chạy SQL thủ công):
```bash
npx prisma migrate resolve --applied <migration_name>
```

### Hoặc rollback migration:
```bash
# Xem migration history
npx prisma migrate status

# Rollback về migration trước đó
npx prisma migrate resolve --rolled-back <migration_name>
```

## ✅ Checklist

- [x] Schema đã được format và validate
- [x] Product model đã có relation đầy đủ
- [ ] Migration đã được tạo và chạy
- [ ] Seed đã được chạy
- [ ] Prisma Client đã được generate

## 📝 Notes

1. **Shadow Database**: Nếu gặp lỗi P3014, có thể:
   - Cấp quyền CREATE DATABASE cho user PostgreSQL
   - Hoặc dùng migration SQL thủ công như trên
   - Hoặc set `shadowDatabaseUrl` trong `schema.prisma`

2. **Default Salon**: Migration sẽ tạo salon mặc định và gán tất cả existing records vào salon đó.

3. **Backward Compatible**: Existing data sẽ được migrate tự động vào salon mặc định.

