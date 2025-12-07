# 🔧 Fix: "permission denied for schema public"

## ❌ Lỗi

```
Error: ERROR: permission denied for schema public
```

**Nguyên nhân:** User database không có quyền truy cập schema `public`.

---

## ✅ Giải pháp

### Cách 1: Grant permissions cho user (Khuyến nghị)

#### Bước 1: Kết nối PostgreSQL với quyền superuser

```bash
# Kết nối với user postgres (hoặc user có quyền admin)
psql -U postgres -d ctss_db

# Hoặc nếu dùng user khác
psql -U your_admin_user -d ctss_db
```

#### Bước 2: Grant permissions

Trong psql, chạy các lệnh sau:

```sql
-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO your_database_user;

-- Grant create on schema
GRANT CREATE ON SCHEMA public TO your_database_user;

-- Grant all privileges on all tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_database_user;

-- Grant all privileges on all sequences
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_database_user;

-- Grant privileges on future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO your_database_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO your_database_user;

-- Thoát psql
\q
```

**Thay `your_database_user` bằng user trong DATABASE_URL của bạn.**

---

### Cách 2: Dùng `prisma db push` thay vì `migrate deploy`

Nếu bạn chưa có migrations và chỉ muốn sync schema:

```bash
# Thay vì migrate deploy
npx prisma db push

# Sau đó generate Prisma Client
npx prisma generate
```

**Lưu ý:** `db push` sẽ tạo/sửa tables trực tiếp, không tạo migration files.

---

### Cách 3: Tạo migrations mới thay vì deploy

Nếu bạn muốn tạo migrations mới:

```bash
# Tạo migration mới
npx prisma migrate dev --name init

# Hoặc nếu đã có database
npx prisma migrate dev --name fix_schema
```

---

### Cách 4: Kiểm tra và sửa DATABASE_URL

Kiểm tra file `.env`:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/ctss_db?schema=public"
```

**Đảm bảo:**
- `USERNAME` có quyền truy cập database
- `PASSWORD` đúng
- Database `ctss_db` đã được tạo

---

## 🔍 Debug

### Kiểm tra user hiện tại:

```bash
# Kết nối database
psql -U postgres -d ctss_db

# Xem user hiện tại
SELECT current_user;

# Xem permissions
\dn+ public

# Xem tables
\dt
```

### Kiểm tra DATABASE_URL:

```bash
# Xem DATABASE_URL từ .env
cat .env | grep DATABASE_URL
```

---

## 🚀 Quick Fix (Nếu không cần migrations)

Nếu bạn chỉ muốn sync schema mà không cần migrations:

```bash
# 1. Push schema trực tiếp
npx prisma db push

# 2. Generate Prisma Client
npx prisma generate

# 3. Test
npx prisma studio
```

---

## ⚠️ Lưu ý

1. **Production:** Nên dùng migrations thay vì `db push`
2. **Development:** Có thể dùng `db push` để nhanh hơn
3. **Permissions:** Đảm bảo user có đủ quyền trước khi chạy migrations

---

*Last updated: 2024*

