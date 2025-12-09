# 🔧 Fix: Database Permission Denied

## Vấn đề:
```
Error: ERROR: permission denied for schema public
```

## Nguyên nhân:
User `ctssuser` không có quyền tạo bảng trong schema `public`.

## Giải pháp:

### BƯỚC 1: Grant quyền cho user

```bash
sudo -u postgres psql << EOF
-- Grant schema usage
GRANT USAGE ON SCHEMA public TO ctssuser;

-- Grant create privileges
GRANT CREATE ON SCHEMA public TO ctssuser;

-- Grant all privileges on database
GRANT ALL PRIVILEGES ON DATABASE ctss TO ctssuser;

-- Grant all privileges on all tables (for future tables)
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ctssuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ctssuser;

\q
EOF
```

### BƯỚC 2: Push schema lại

```bash
cd ~/ctss
npx prisma db push
```

### BƯỚC 3: Seed users

```bash
cd ~/ctss
npm run db:seed
```

Hoặc:

```bash
npx tsx prisma/seed.ts
```

### BƯỚC 4: Kiểm tra users đã được tạo

```bash
cd ~/ctss
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  try {
    const users = await prisma.user.findMany();
    console.log('✅ Số lượng users:', users.length);
    users.forEach(u => {
      console.log('  -', u.name, '(' + u.phone + ')', '-', u.role);
    });
  } catch (e) {
    console.error('❌ Error:', e.message);
  } finally {
    await prisma.\$disconnect();
  }
})();
"
```

### BƯỚC 5: Restart PM2

```bash
pm2 restart ctss
```

### BƯỚC 6: Test login

Truy cập: `http://72.61.119.247/login`

Đăng nhập với:
- **Phone**: `0900000001` (hoặc bất kỳ số nào từ seed)
- **Password**: `123456`

---

## Lưu ý:

- Seed data đã được fix để dùng `phone` thay vì `email`
- Login form có thể dùng phone hoặc email (email sẽ được convert thành phone)
- Tất cả users seed có password: `123456`
