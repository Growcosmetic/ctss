# 🔧 Fix: Browser Email Validation Error

## Vấn đề:
Browser vẫn hiển thị lỗi validation email khi nhập phone number, mặc dù code đã đúng.

## Nguyên nhân:
1. **Browser cache** đang giữ version cũ của JavaScript
2. **VPS chưa rebuild** Next.js app sau khi pull code mới

## Giải pháp:

### BƯỚC 1: Rebuild trên VPS

```bash
cd ~/ctss
chmod +x rebuild-vps.sh
./rebuild-vps.sh
```

Hoặc làm thủ công:

```bash
cd ~/ctss
git pull origin main
npm install
npx prisma generate
npm run build
pm2 restart ctss
pm2 logs ctss --lines 20
```

### BƯỚC 2: Clear Browser Cache

**Cách 1: Hard Refresh**
- **Mac**: `Cmd + Shift + R`
- **Windows/Linux**: `Ctrl + Shift + R`

**Cách 2: Clear Cache trong Settings**
- Safari: Safari → Preferences → Advanced → Show Develop menu → Empty Caches
- Chrome: Settings → Privacy → Clear browsing data → Cached images and files

**Cách 3: Incognito/Private Window**
- Mở cửa sổ ẩn danh và test lại

### BƯỚC 3: Test Login

Truy cập: `http://72.61.119.247/login`

Đăng nhập với:
- Phone: `0900000001`
- Password: `123456`

---

## Nếu vẫn không được:

### Kiểm tra users trong database:

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

Nếu `0 users`, chạy seed:

```bash
node seed-users-manual.js
```

---

## Debug:

### Xem PM2 logs:

```bash
pm2 logs ctss --lines 50
```

### Kiểm tra build có thành công không:

```bash
cd ~/ctss
npm run build
```

Nếu có lỗi, gửi log cho tôi.

---

## Tài khoản demo:

- Admin: `0900000001` / `123456`
- Manager: `0900000002` / `123456`
- Reception: `0900000003` / `123456`
- Stylist: `0900000004` / `123456`
- Assistant: `0900000005` / `123456`

