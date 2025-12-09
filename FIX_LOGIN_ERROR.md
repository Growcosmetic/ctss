# 🔧 Fix: Lỗi Login - 401/500 Errors

## Vấn đề:
- App đã chạy và hiển thị trang login ✅
- Nhưng khi đăng nhập báo lỗi:
  - 401 Unauthorized cho `/api/auth/me`
  - 500 Internal Server Error cho `/api/auth/login`
  - "Login failed" message

## Nguyên nhân có thể:
1. Database chưa được setup
2. User chưa được seed vào database
3. API authentication có lỗi

## Giải pháp:

### BƯỚC 1: Kiểm tra logs PM2

```bash
pm2 logs ctss --lines 50
```

Xem có lỗi gì liên quan đến database không.

### BƯỚC 2: Kiểm tra database connection

```bash
cd ~/ctss
npx prisma db push --skip-generate
```

Nếu có lỗi, gửi lỗi cho tôi.

### BƯỚC 3: Seed user vào database

```bash
cd ~/ctss
npx prisma db seed
```

Hoặc nếu không có seed script, tạo user thủ công:

```bash
cd ~/ctss
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  try {
    const user = await prisma.user.create({
      data: {
        name: 'Admin User',
        phone: '0901234567',
        password: '123456',
        role: 'ADMIN',
      },
    });
    console.log('User created:', user);
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.\$disconnect();
  }
})();
"
```

### BƯỚC 4: Kiểm tra lại

Sau khi seed user, thử đăng nhập lại với:
- Email/Phone: `0901234567`
- Password: `123456`

---

## Nếu vẫn không được:

### Kiểm tra API trực tiếp:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"0901234567","password":"123456"}'
```

Gửi kết quả cho tôi.

---

## Lưu ý:

- App đã deploy thành công ✅
- Chỉ cần fix authentication là xong
- Có thể dùng mock login API nếu database chưa setup

