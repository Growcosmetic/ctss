# 🔧 Fix: Không có users trong database

## Vấn đề:
- `✅ Số lượng users: 0` → Chưa có user nào trong database
- `tsx: not found` → Không thể chạy seed script

## Giải pháp:

### BƯỚC 1: Pull code mới và tạo user thủ công

```bash
cd ~/ctss
git pull origin main
```

### BƯỚC 2: Tạo users bằng script Node.js (không cần tsx)

```bash
cd ~/ctss
node seed-users-manual.js
```

Nếu có lỗi database, thử dùng postgres user:

```bash
# Sửa .env tạm thời
nano .env
```

Thay đổi `DATABASE_URL` thành:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ctss"
```

(Lưu ý: Thay `postgres` bằng password của postgres user)

Sau đó:

```bash
# Push schema
npx prisma db push

# Seed users
node seed-users-manual.js

# Kiểm tra
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

### BƯỚC 3: Restart PM2

```bash
pm2 restart ctss
pm2 logs ctss --lines 20
```

### BƯỚC 4: Test login

Truy cập: `http://72.61.119.247/login`

Đăng nhập với:
- Phone: `0900000001`
- Password: `123456`

---

## Nếu vẫn không được:

### Kiểm tra database connection:

```bash
cd ~/ctss
npx prisma db push
```

Nếu có lỗi `permission denied`, dùng postgres user như hướng dẫn trên.

---

## Tài khoản demo (sau khi seed):

- Admin: `0900000001` / `123456`
- Manager: `0900000002` / `123456`
- Reception: `0900000003` / `123456`
- Stylist: `0900000004` / `123456`
- Assistant: `0900000005` / `123456`

