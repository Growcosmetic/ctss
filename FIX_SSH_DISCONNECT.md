# 🔧 Fix: SSH Disconnect - Kiểm tra lại sau khi kết nối lại

## Vấn đề:
SSH bị disconnect trong khi đang setup database.

## Giải pháp:

### BƯỚC 1: Kết nối lại SSH

```bash
ssh root@72.61.119.247
```

### BƯỚC 2: Chạy script kiểm tra

```bash
cd ~/ctss
git pull origin main
chmod +x check-database.sh
./check-database.sh
```

Script sẽ kiểm tra:
- DATABASE_URL có trong .env không
- Prisma Client đã được generate chưa
- Database connection có hoạt động không
- User đã được tạo chưa
- PM2 có đang chạy không
- Login API có hoạt động không

### BƯỚC 3: Nếu database chưa được setup

Chạy lại các lệnh:

```bash
cd ~/ctss

# 1. Generate Prisma Client
npx prisma generate

# 2. Push schema vào database
npx prisma db push

# 3. Tạo admin user
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  try {
    const admin = await prisma.user.create({
      data: {
        name: 'Admin User',
        phone: '0901234567',
        password: '123456',
        role: 'ADMIN',
      },
    });
    console.log('✅ Admin user created:', admin.id);
  } catch (e) {
    console.error('❌ Error:', e.message);
  } finally {
    await prisma.\$disconnect();
  }
})();
"

# 4. Restart PM2
pm2 restart ctss
pm2 logs ctss --lines 20
```

### BƯỚC 4: Test login

Truy cập: `http://72.61.119.247/login`

Đăng nhập với:
- Phone: `0901234567`
- Password: `123456`

---

## Nếu vẫn không được:

### Kiểm tra logs PM2:

```bash
pm2 logs ctss --lines 50
```

### Kiểm tra database connection:

```bash
cd ~/ctss
npx prisma db push --skip-generate
```

Gửi lỗi cho tôi nếu có.

---

## Lưu ý:

- SSH có thể bị disconnect nếu mất kết nối mạng
- Các lệnh đã chạy có thể đã hoàn thành hoặc đang chạy
- Chạy script kiểm tra để xem trạng thái hiện tại

