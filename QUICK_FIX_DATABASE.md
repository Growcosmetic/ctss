# ⚡ Quick Fix: Database Permission Error

## ❌ Lỗi

```
Error: ERROR: permission denied for schema public
```

---

## ✅ Giải pháp nhanh nhất

### Option 1: Dùng `prisma db push` (Khuyến nghị - Không cần migrations)

```bash
# Thay vì migrate deploy, dùng db push
npx prisma db push

# Sau đó generate Prisma Client
npx prisma generate
```

**Lưu ý:** `db push` sẽ sync schema trực tiếp, không tạo migration files.

---

### Option 2: Grant permissions cho user

#### Bước 1: Kết nối PostgreSQL

```bash
# Kết nối với user postgres (superuser)
psql -U postgres -d ctss_db

# Hoặc nếu trên server
psql -U postgres -h localhost -d ctss_db
```

#### Bước 2: Chạy SQL commands

```sql
-- Thay 'user' bằng user trong DATABASE_URL của bạn
GRANT USAGE ON SCHEMA public TO "user";
GRANT CREATE ON SCHEMA public TO "user";
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "user";
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "user";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "user";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO "user";
```

#### Bước 3: Thoát và thử lại

```sql
\q
```

Sau đó chạy lại:
```bash
npx prisma migrate deploy
```

---

### Option 3: Tạo migrations mới

Nếu bạn muốn tạo migrations:

```bash
# Tạo migration mới
npx prisma migrate dev --name init

# Hoặc
npx prisma migrate dev --name fix_schema
```

---

## 🔍 Kiểm tra DATABASE_URL

File `.env` hiện tại:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/ctss?schema=public"
```

**Vấn đề:** User `user` có thể không có quyền.

**Giải pháp:** 
1. Thay `user` bằng user có quyền (ví dụ: `postgres`)
2. Hoặc grant permissions cho user `user` như ở Option 2

---

## 🚀 Recommended: Dùng db push

Nếu bạn đang development và không cần migrations:

```bash
# 1. Push schema
npx prisma db push

# 2. Generate client
npx prisma generate

# 3. Test với Prisma Studio
npx prisma studio
```

**Ưu điểm:**
- ✅ Không cần permissions phức tạp
- ✅ Nhanh hơn
- ✅ Tự động sync schema

**Nhược điểm:**
- ❌ Không tạo migration files
- ❌ Không phù hợp cho production

---

## 📝 Trên Server (srv1136013)

Nếu bạn đang trên server và không có quyền superuser:

```bash
# Option 1: Dùng db push (nhanh nhất)
npx prisma db push

# Option 2: Liên hệ admin để grant permissions
# Hoặc dùng user postgres trong DATABASE_URL
```

---

*Last updated: 2024*

