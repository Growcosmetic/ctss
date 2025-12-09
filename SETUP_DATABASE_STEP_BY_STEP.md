# 🗄️ Setup Database - Từng Bước Chi Tiết

## ✅ Đã kiểm tra và OK:

1. ✅ Login page đã hỗ trợ cả phone và email
2. ✅ Seed data đã được fix để dùng phone thay vì email
3. ✅ Login API đã hỗ trợ cả phone và email
4. ✅ Demo accounts đã được update để hiển thị phone

---

## 🚀 CÁCH 1: Chạy script tự động (Khuyến nghị)

```bash
cd ~/ctss
git pull origin main
chmod +x setup-database-complete.sh
./setup-database-complete.sh
```

Script sẽ tự động làm tất cả các bước và báo kết quả.

---

## 📋 CÁCH 2: Chạy từng bước thủ công

### BƯỚC 1: Pull code mới

```bash
cd ~/ctss
git pull origin main
```

**Kết quả mong đợi:** Code được pull thành công

---

### BƯỚC 2: Grant quyền cho database user

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

**Kết quả mong đợi:** Không có lỗi, quay về prompt

---

### BƯỚC 3: Generate Prisma Client

```bash
cd ~/ctss
npx prisma generate
```

**Kết quả mong đợi:** 
```
✔ Generated Prisma Client (v5.22.0) to ./node_modules/@prisma/client
```

---

### BƯỚC 4: Push schema vào database

```bash
cd ~/ctss
npx prisma db push
```

**Kết quả mong đợi:** 
```
✔ Your database is now in sync with your Prisma schema.
```

Nếu có lỗi `permission denied`, chạy lại BƯỚC 2.

---

### BƯỚC 5: Seed users

```bash
cd ~/ctss
npm run db:seed
```

Hoặc:

```bash
npx tsx prisma/seed.ts
```

**Kết quả mong đợi:**
```
🌱 Seeding users...
✅ Created user: 0900000001 (ADMIN)
✅ Created user: 0900000002 (MANAGER)
✅ Created user: 0900000003 (RECEPTIONIST)
✅ Created user: 0900000004 (STYLIST)
✅ Created user: 0900000005 (ASSISTANT)
✨ Seeding completed!
```

---

### BƯỚC 6: Kiểm tra users đã được tạo

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

**Kết quả mong đợi:**
```
✅ Số lượng users: 5
  - Admin User (0900000001) - ADMIN
  - Manager User (0900000002) - MANAGER
  - Reception User (0900000003) - RECEPTIONIST
  - Stylist User (0900000004) - STYLIST
  - Assistant User (0900000005) - ASSISTANT
```

---

### BƯỚC 7: Restart PM2

```bash
pm2 restart ctss
pm2 status
pm2 logs ctss --lines 20
```

**Kết quả mong đợi:** 
- Status: `online`
- Không có lỗi database trong logs

---

### BƯỚC 8: Test login

Truy cập: `http://72.61.119.247/login`

Đăng nhập với:
- **Phone:** `0900000001`
- **Password:** `123456`

Hoặc:
- **Email:** `admin@ctss.com` (sẽ được convert thành phone)
- **Password:** `123456`

---

## 📝 Tài khoản demo (sau khi seed):

- **Admin:** `0900000001` / `123456`
- **Manager:** `0900000002` / `123456`
- **Reception:** `0900000003` / `123456`
- **Stylist:** `0900000004` / `123456`
- **Assistant:** `0900000005` / `123456`

---

## 🔧 Troubleshooting

### Nếu BƯỚC 2 thất bại:

```bash
# Kiểm tra PostgreSQL có đang chạy không
systemctl status postgresql

# Nếu không chạy, start nó
systemctl start postgresql
```

### Nếu BƯỚC 4 thất bại với "permission denied":

Chạy lại BƯỚC 2, hoặc thử:

```bash
sudo -u postgres psql -d ctss << EOF
GRANT ALL ON SCHEMA public TO ctssuser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ctssuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ctssuser;
\q
EOF
```

### Nếu BƯỚC 5 thất bại:

```bash
# Kiểm tra file seed có tồn tại không
ls -la prisma/seed.ts

# Chạy trực tiếp
npx tsx prisma/seed.ts
```

---

## ✅ Checklist:

- [ ] Code đã được pull mới nhất
- [ ] Database user đã có quyền
- [ ] Prisma Client đã được generate
- [ ] Schema đã được push vào database
- [ ] Users đã được seed (5 users)
- [ ] PM2 đã restart
- [ ] Login hoạt động với phone

---

Sau khi hoàn thành tất cả các bước, app sẽ hoạt động đầy đủ! 🎉

