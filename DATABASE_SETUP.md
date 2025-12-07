# Database Setup Guide

## Bước 1: Kiểm tra PostgreSQL

Đảm bảo PostgreSQL đang chạy:

```bash
# macOS (Homebrew)
brew services list | grep postgresql

# Nếu chưa chạy, khởi động:
brew services start postgresql@14
# hoặc
brew services start postgresql
```

## Bước 2: Tạo Database

Tạo database `ctss`:

```bash
# Option 1: Sử dụng psql
psql postgres
# Trong psql:
CREATE DATABASE ctss;
\q

# Option 2: Tạo trực tiếp
createdb ctss
```

## Bước 3: Cập nhật .env

Cập nhật file `.env` với thông tin database của bạn:

```env
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL="postgresql://postgres:password@localhost:5432/ctss?schema=public"

# Hoặc nếu dùng user hiện tại (không có password):
DATABASE_URL="postgresql://$(whoami)@localhost:5432/ctss?schema=public"
```

**Lưu ý:** Thay `postgres` và `password` bằng thông tin đăng nhập PostgreSQL của bạn.

## Bước 4: Chạy Migration

Sau khi cấu hình xong, chạy:

```bash
# Tạo migration
npx prisma migrate dev --name init

# Hoặc push schema trực tiếp (không tạo migration files)
npx prisma db push
```

## Bước 5: Generate Prisma Client

```bash
npx prisma generate
```

## Troubleshooting

### Lỗi: "User was denied access"
- Kiểm tra username và password trong DATABASE_URL
- Đảm bảo user có quyền tạo database

### Lỗi: "Database does not exist"
- Tạo database trước: `createdb ctss`
- Hoặc sử dụng database khác đã tồn tại

### Lỗi: "Connection refused"
- Kiểm tra PostgreSQL có đang chạy: `brew services list`
- Khởi động PostgreSQL: `brew services start postgresql`

### Kiểm tra kết nối

```bash
# Test connection
psql -d ctss -c "SELECT version();"
```

## Sử dụng Prisma Studio

Sau khi setup xong, bạn có thể xem database bằng Prisma Studio:

```bash
npx prisma studio
```

Mở browser tại: http://localhost:5555

