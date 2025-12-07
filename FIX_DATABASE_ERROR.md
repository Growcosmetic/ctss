# 🔧 Fix Database Error: "User was denied access"

## ❌ Lỗi hiện tại

```
User `user` was denied access on the database `ctss.public`
```

**Nguyên nhân:** Database chưa được setup hoặc DATABASE_URL sai.

---

## ✅ Giải pháp

### Cách 1: Sử dụng Mock Data (Nhanh nhất - Không cần database)

Hệ thống đã có fallback mock data. API sẽ hoạt động ngay mà không cần database.

**Test lại:**
```bash
curl http://localhost:3000/api/customers
```

Nếu vẫn lỗi, có thể cần thêm try-catch với fallback trong code.

---

### Cách 2: Setup PostgreSQL Database (Đầy đủ)

#### Bước 1: Cài PostgreSQL

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Hoặc dùng Docker:**
```bash
docker run --name ctss-db \
  -e POSTGRES_USER=ctss_user \
  -e POSTGRES_PASSWORD=ctss_password \
  -e POSTGRES_DB=ctss \
  -p 5432:5432 \
  -d postgres:14
```

#### Bước 2: Tạo Database

```bash
# Kết nối PostgreSQL
psql -U postgres

# Tạo database và user
CREATE DATABASE ctss;
CREATE USER ctss_user WITH PASSWORD 'ctss_password';
GRANT ALL PRIVILEGES ON DATABASE ctss TO ctss_user;
\q
```

#### Bước 3: Cập nhật .env

Mở file `.env` và sửa `DATABASE_URL`:

```env
DATABASE_URL="postgresql://ctss_user:ctss_password@localhost:5432/ctss?schema=public"
```

#### Bước 4: Chạy Prisma Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Chạy migrations
npx prisma migrate dev

# Hoặc push schema (nếu chưa có migrations)
npx prisma db push
```

#### Bước 5: Seed data (optional)

```bash
npx prisma db seed
```

---

### Cách 3: Dùng Database Cloud (Supabase/Neon/Railway)

#### Option A: Supabase (Free tier)

1. Tạo tài khoản: https://supabase.com
2. Tạo project mới
3. Copy connection string
4. Thêm vào `.env`:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

#### Option B: Neon (Free tier)

1. Tạo tài khoản: https://neon.tech
2. Tạo database
3. Copy connection string
4. Thêm vào `.env`

#### Option C: Railway

1. Tạo tài khoản: https://railway.app
2. Tạo PostgreSQL service
3. Copy connection string
4. Thêm vào `.env`

---

## 🧪 Test API sau khi fix

```bash
# Test GET customers
curl http://localhost:3000/api/customers

# Test với query params
curl "http://localhost:3000/api/customers?page=1&limit=10&search=john"

# Test POST (tạo customer mới)
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "phone": "0901234567",
    "email": "john@example.com"
  }'
```

---

## 🔍 Debug Database Connection

### Kiểm tra kết nối:

```bash
# Test connection với psql
psql "postgresql://ctss_user:ctss_password@localhost:5432/ctss"

# Hoặc test với Prisma
npx prisma db pull
```

### Kiểm tra Prisma:

```bash
# Xem schema
cat prisma/schema.prisma

# Validate schema
npx prisma validate

# Format schema
npx prisma format
```

---

## ⚠️ Lưu ý

1. **Development**: Có thể dùng mock data để test nhanh
2. **Production**: Bắt buộc phải có database thật
3. **Security**: Không commit DATABASE_URL lên GitHub
4. **Backup**: Backup database định kỳ

---

## 🎯 Quick Fix (Tạm thời)

Nếu chỉ muốn test API mà không setup database:

1. Sửa file `app/api/customers/route.ts`
2. Thêm try-catch với fallback mock data
3. Hoặc comment out Prisma queries và return mock data

**Ví dụ:**
```typescript
export async function GET(request: NextRequest) {
  try {
    // ... Prisma code ...
  } catch (error: any) {
    // Fallback to mock data
    return successResponse({
      customers: [], // Mock data
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
    });
  }
}
```

---

*Last updated: 2024*

