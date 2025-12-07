# 🚀 QUICK FIX - LOGIN ERROR

## Vấn đề hiện tại:
- Database connection error: "User `user` was denied access"
- Prisma schema có 160 validation errors

## Giải pháp nhanh:

### Option 1: Setup PostgreSQL (Khuyến nghị)

1. **Cài đặt PostgreSQL:**
```bash
# macOS
brew install postgresql
brew services start postgresql

# Hoặc dùng Docker
docker run --name ctss-postgres -e POSTGRES_PASSWORD=123456 -e POSTGRES_DB=ctss -p 5432:5432 -d postgres
```

2. **Tạo database:**
```bash
psql postgres
CREATE DATABASE ctss;
CREATE USER ctss_user WITH PASSWORD '123456';
GRANT ALL PRIVILEGES ON DATABASE ctss TO ctss_user;
\q
```

3. **Cập nhật .env:**
```env
DATABASE_URL="postgresql://ctss_user:123456@localhost:5432/ctss?schema=public"
```

4. **Setup Prisma:**
```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

### Option 2: Dùng SQLite cho Development (Đơn giản hơn)

1. **Sửa .env:**
```env
DATABASE_URL="file:./dev.db"
```

2. **Sửa prisma/schema.prisma:**
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

3. **Reset và setup:**
```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

### Option 3: Mock Login (Test tạm thời)

Tạo file `app/api/auth/login-mock/route.ts` để test UI mà không cần database.

---

## Sau khi fix, test login với:
- Email: `admin@ctss.com`
- Password: `123456`

