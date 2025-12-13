# Hướng dẫn khắc phục lỗi P3014 - Shadow Database

## 🔴 Vấn đề
Prisma Migrate không thể tạo shadow database do thiếu quyền CREATEDB.

## ✅ Giải pháp (chọn 1 trong các cách sau)

### Option 1: Dùng `prisma db push` (Khuyến nghị cho Development)

**Ưu điểm:** Nhanh, không cần shadow database, tự động sync schema với database.

```bash
# Push schema trực tiếp vào database (không cần migration)
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Chạy seed
npx prisma db seed
```

**Lưu ý:** `db push` không tạo migration files, chỉ sync schema. Phù hợp cho development.

---

### Option 2: Cấu hình Shadow Database URL

Thêm `shadowDatabaseUrl` vào `prisma/schema.prisma`:

```prisma
datasource db {
  provider          = "postgresql"
  url               = env("DATABASE_URL")
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL") // Thêm dòng này
}
```

Thêm vào `.env`:
```env
DATABASE_URL="postgresql://ctssuser:Ctss%402025@localhost:5432/ctss"
SHADOW_DATABASE_URL="postgresql://ctssuser:Ctss%402025@localhost:5432/ctss_shadow"
```

Tạo shadow database:
```sql
CREATE DATABASE ctss_shadow;
```

Sau đó chạy migration:
```bash
npx prisma migrate dev --name add_salon_multi_tenant
```

---

### Option 3: Tạo Migration SQL thủ công

**Bước 1:** Tạo migration folder và file SQL:

```bash
mkdir -p prisma/migrations/$(date +%Y%m%d%H%M%S)_add_salon_multi_tenant
```

**Bước 2:** Tạo file SQL trong folder đó:

```sql
-- CreateTable
CREATE TABLE IF NOT EXISTS "Salon" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Salon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Salon_slug_key" ON "Salon"("slug");
CREATE INDEX IF NOT EXISTS "Salon_slug_idx" ON "Salon"("slug");
CREATE INDEX IF NOT EXISTS "Salon_status_idx" ON "Salon"("status");

-- Add salonId columns (nếu chưa có)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='User' AND column_name='salonId') THEN
        ALTER TABLE "User" ADD COLUMN "salonId" TEXT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Customer' AND column_name='salonId') THEN
        ALTER TABLE "Customer" ADD COLUMN "salonId" TEXT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Booking' AND column_name='salonId') THEN
        ALTER TABLE "Booking" ADD COLUMN "salonId" TEXT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Service' AND column_name='salonId') THEN
        ALTER TABLE "Service" ADD COLUMN "salonId" TEXT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Product' AND column_name='salonId') THEN
        ALTER TABLE "Product" ADD COLUMN "salonId" TEXT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Invoice' AND column_name='salonId') THEN
        ALTER TABLE "Invoice" ADD COLUMN "salonId" TEXT;
    END IF;
END $$;

-- Tạo salon mặc định
INSERT INTO "Salon" (id, name, slug, status, "createdAt", "updatedAt")
VALUES ('clxxx-default-salon', 'Chí Tâm Hair Salon', 'chi-tam', 'ACTIVE', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Update existing records với salonId mặc định
UPDATE "User" SET "salonId" = 'clxxx-default-salon' WHERE "salonId" IS NULL;
UPDATE "Customer" SET "salonId" = 'clxxx-default-salon' WHERE "salonId" IS NULL;
UPDATE "Booking" SET "salonId" = 'clxxx-default-salon' WHERE "salonId" IS NULL;
UPDATE "Service" SET "salonId" = 'clxxx-default-salon' WHERE "salonId" IS NULL;
UPDATE "Product" SET "salonId" = 'clxxx-default-salon' WHERE "salonId" IS NULL;
UPDATE "Invoice" SET "salonId" = 'clxxx-default-salon' WHERE "salonId" IS NULL;

-- Add foreign keys
ALTER TABLE "User" ADD CONSTRAINT "User_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Service" ADD CONSTRAINT "Service_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Product" ADD CONSTRAINT "Product_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add indexes
CREATE INDEX IF NOT EXISTS "User_salonId_idx" ON "User"("salonId");
CREATE INDEX IF NOT EXISTS "Customer_salonId_idx" ON "Customer"("salonId");
CREATE INDEX IF NOT EXISTS "Booking_salonId_idx" ON "Booking"("salonId");
CREATE INDEX IF NOT EXISTS "Service_salonId_idx" ON "Service"("salonId");
CREATE INDEX IF NOT EXISTS "Product_salonId_idx" ON "Product"("salonId");
CREATE INDEX IF NOT EXISTS "Invoice_salonId_idx" ON "Invoice"("salonId");

-- Make salonId NOT NULL (sau khi đã update tất cả records)
ALTER TABLE "User" ALTER COLUMN "salonId" SET NOT NULL;
ALTER TABLE "Customer" ALTER COLUMN "salonId" SET NOT NULL;
ALTER TABLE "Booking" ALTER COLUMN "salonId" SET NOT NULL;
ALTER TABLE "Service" ALTER COLUMN "salonId" SET NOT NULL;
ALTER TABLE "Product" ALTER COLUMN "salonId" SET NOT NULL;
ALTER TABLE "Invoice" ALTER COLUMN "salonId" SET NOT NULL;
```

**Bước 3:** Chạy SQL:
```bash
psql "postgresql://ctssuser:Ctss%402025@localhost:5432/ctss" -f prisma/migrations/.../migration.sql
```

**Bước 4:** Mark migration là applied:
```bash
npx prisma migrate resolve --applied add_salon_multi_tenant
```

---

### Option 4: Kiểm tra lại quyền CREATEDB

```sql
-- Kiểm tra quyền hiện tại
SELECT rolname, rolcreatedb FROM pg_roles WHERE rolname = 'ctssuser';

-- Cấp quyền CREATEDB (nếu chưa có)
ALTER ROLE ctssuser CREATEDB;

-- Hoặc cấp quyền superuser (chỉ cho development)
ALTER ROLE ctssuser SUPERUSER;
```

Sau đó thử lại:
```bash
npx prisma migrate dev --name add_salon_multi_tenant
```

---

## 🎯 Khuyến nghị

**Cho Development:** Dùng **Option 1** (`prisma db push`) - nhanh và đơn giản nhất.

**Cho Production:** Dùng **Option 2** hoặc **Option 3** để có migration files đầy đủ.

---

## ✅ Sau khi migration thành công

1. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```

2. Chạy seed:
   ```bash
   npx prisma db seed
   ```

3. Verify:
   ```bash
   npx prisma studio
   # Kiểm tra table Salon và các records có salonId
   ```

