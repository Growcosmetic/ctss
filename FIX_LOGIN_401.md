# 🔧 Fix: 401 Unauthorized Login Error

## Vấn đề:
- Lỗi `401 Unauthorized` từ `/api/auth/me`
- Không thể login với phone `0900000001`

## Nguyên nhân:
1. **Chưa có users trong database** (0 users)
2. **Cookie không được set** do `secure: true` trên HTTP (không phải HTTPS)

## Giải pháp:

### BƯỚC 1: Pull code mới và rebuild

```bash
cd ~/ctss
git pull origin main
chmod +x debug-login.sh
./debug-login.sh
```

Script này sẽ:
- ✅ Kiểm tra users trong database
- ✅ Seed users nếu chưa có
- ✅ Restart PM2
- ✅ Hiển thị status

### BƯỚC 2: Hoặc làm thủ công

```bash
cd ~/ctss
git pull origin main

# Seed users
node seed-users-manual.js

# Kiểm tra users
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

# Rebuild và restart
npm run build
pm2 restart ctss
pm2 logs ctss --lines 20
```

### BƯỚC 3: Test login

1. **Clear browser cache**:
   - Mac: `Cmd + Shift + R`
   - Windows: `Ctrl + Shift + R`
   - Hoặc dùng Incognito window

2. **Truy cập**: `http://72.61.119.247/login`

3. **Đăng nhập**:
   - Phone: `0900000001`
   - Password: `123456`

---

## Đã fix:

✅ **Cookie secure flag**: Đổi từ `secure: process.env.NODE_ENV === "production"` thành `secure: false` để cookie hoạt động trên HTTP

✅ **Script debug**: Tạo `debug-login.sh` để tự động seed users và restart

---

## Nếu vẫn không được:

### Kiểm tra PM2 logs:

```bash
pm2 logs ctss --lines 50
```

### Kiểm tra database connection:

```bash
cd ~/ctss
npx prisma db push
```

Nếu có lỗi `permission denied`, sửa `.env`:

```bash
nano .env
```

Đổi `DATABASE_URL` thành:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ctss"
```

(Thay `postgres` bằng password của postgres user)

---

## Tài khoản demo:

- Admin: `0900000001` / `123456`
- Manager: `0900000002` / `123456`
- Reception: `0900000003` / `123456`
- Stylist: `0900000004` / `123456`
- Assistant: `0900000005` / `123456`

---

## Debug checklist:

- [ ] Users đã được seed (5 users)
- [ ] PM2 đang chạy (`pm2 status`)
- [ ] Cookie được set (check trong DevTools → Application → Cookies)
- [ ] Browser cache đã clear
- [ ] Database connection OK (`npx prisma db push`)

