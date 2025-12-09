# 🚀 QUICK FIX - Database Permission

## Vấn đề:
`ctssuser` không có đủ quyền để tạo schema.

## Giải pháp nhanh nhất: Dùng postgres user

### BƯỚC 1: Set password cho postgres user (nếu chưa có)

```bash
sudo -u postgres psql -c "\password postgres"
```

Nhập password mới (ví dụ: `postgres123`) hoặc Enter để giữ nguyên.

### BƯỚC 2: Sửa .env

```bash
cd ~/ctss
nano .env
```

Thay đổi dòng `DATABASE_URL` thành:

```
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/ctss"
```

(Lưu ý: Thay `postgres123` bằng password bạn vừa set)

Hoặc chạy script tự động:

```bash
cd ~/ctss
git pull origin main
chmod +x fix-env-database.sh
./fix-env-database.sh
```

### BƯỚC 3: Push schema

```bash
cd ~/ctss
npx prisma db push
```

Bây giờ sẽ thành công vì postgres user có đầy đủ quyền!

### BƯỚC 4: Seed users

```bash
cd ~/ctss
npm run db:seed
```

### BƯỚC 5: Kiểm tra users

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

### BƯỚC 6: Restart PM2

```bash
pm2 restart ctss
```

### BƯỚC 7: Test login

Truy cập: `http://72.61.119.247/login`

Đăng nhập với:
- Phone: `0900000001`
- Password: `123456`

---

## Lưu ý:

- Sau khi setup xong, có thể giữ nguyên postgres user (an toàn)
- Hoặc đổi lại ctssuser sau khi đã grant đủ quyền

---

## Tài khoản demo:

- Admin: `0900000001` / `123456`
- Manager: `0900000002` / `123456`
- Reception: `0900000003` / `123456`
- Stylist: `0900000004` / `123456`
- Assistant: `0900000005` / `123456`
