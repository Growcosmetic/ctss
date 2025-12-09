# 🔧 Fix: Port Conflict & Database Table Missing

## Vấn đề:
1. **Port 3000 đang bị chiếm**: `EADDRINUSE: address already in use :::3000`
2. **Database table không tồn tại**: `The table public.User does not exist`

## Giải pháp:

### BƯỚC 1: Chạy script fix tự động

```bash
cd ~/ctss
git pull origin main
chmod +x fix-pm2-port-and-db.sh
./fix-pm2-port-and-db.sh
```

Script này sẽ:
- ✅ Stop tất cả PM2 processes
- ✅ Kill process đang dùng port 3000
- ✅ Push database schema (tạo tables)
- ✅ Generate Prisma client
- ✅ Seed users
- ✅ Start PM2 lại

### BƯỚC 2: Hoặc làm thủ công

```bash
cd ~/ctss

# 1. Stop PM2
pm2 stop all
pm2 delete all

# 2. Kill process trên port 3000
lsof -ti:3000 | xargs kill -9
pkill -f "next start"
sleep 2

# 3. Push database schema
npx prisma db push --accept-data-loss

# 4. Generate Prisma client
npx prisma generate

# 5. Seed users
node seed-users-manual.js

# 6. Kiểm tra users
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

# 7. Start PM2
pm2 start ecosystem.config.js

# 8. Kiểm tra status
pm2 status
pm2 logs ctss --lines 20
```

### BƯỚC 3: Nếu database có lỗi permission

Nếu `npx prisma db push` báo lỗi `permission denied`, sửa `.env`:

```bash
nano .env
```

Đổi `DATABASE_URL` thành:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ctss"
```

(Thay `postgres` bằng password của postgres user)

Sau đó chạy lại:
```bash
npx prisma db push --accept-data-loss
```

### BƯỚC 4: Test login

1. **Clear browser cache**:
   - Mac: `Cmd + Shift + R`
   - Hoặc Incognito window

2. **Truy cập**: `http://72.61.119.247/login`

3. **Đăng nhập**:
   - Phone: `0900000001`
   - Password: `123456`

---

## Debug checklist:

- [ ] Port 3000 đã free (`lsof -Pi :3000 -sTCP:LISTEN`)
- [ ] Database tables đã được tạo (`npx prisma db push`)
- [ ] Users đã được seed (5 users)
- [ ] PM2 đang chạy (`pm2 status`)
- [ ] App đang listen trên port 3000 (`pm2 logs ctss`)

---

## Nếu vẫn không được:

### Kiểm tra PM2 logs:

```bash
pm2 logs ctss --lines 50
```

### Kiểm tra port:

```bash
lsof -Pi :3000 -sTCP:LISTEN
```

Nếu vẫn có process, kill:
```bash
lsof -ti:3000 | xargs kill -9
```

### Kiểm tra database:

```bash
cd ~/ctss
npx prisma studio
```

Hoặc kiểm tra trực tiếp:
```bash
psql -U postgres -d ctss -c "SELECT * FROM \"User\";"
```

---

## Tài khoản demo:

- Admin: `0900000001` / `123456`
- Manager: `0900000002` / `123456`
- Reception: `0900000003` / `123456`
- Stylist: `0900000004` / `123456`
- Assistant: `0900000005` / `123456`

