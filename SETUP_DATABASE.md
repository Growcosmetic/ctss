# 🗄️ Setup Database cho CTSS

## Vấn đề:
```
The table `public.User` does not exist in the current database.
```

## Giải pháp:

### BƯỚC 1: Kiểm tra file .env có DATABASE_URL

```bash
cd ~/ctss
cat .env | grep DATABASE_URL
```

Phải thấy: `DATABASE_URL="postgresql://..."`

### BƯỚC 2: Generate Prisma Client

```bash
cd ~/ctss
npx prisma generate
```

### BƯỚC 3: Push schema vào database

```bash
cd ~/ctss
npx prisma db push
```

Nếu có lỗi permission, thử:

```bash
npx prisma db push --skip-generate --accept-data-loss
```

### BƯỚC 4: Seed user vào database

```bash
cd ~/ctss
npx prisma db seed
```

Hoặc tạo user thủ công:

```bash
cd ~/ctss
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  try {
    // Tạo admin user
    const admin = await prisma.user.create({
      data: {
        name: 'Admin User',
        phone: '0901234567',
        password: '123456',
        role: 'ADMIN',
      },
    });
    console.log('✅ Admin user created:', admin.id);
    
    // Tạo manager user
    const manager = await prisma.user.create({
      data: {
        name: 'Manager User',
        phone: '0901234568',
        password: '123456',
        role: 'MANAGER',
      },
    });
    console.log('✅ Manager user created:', manager.id);
    
    console.log('✅ Users created successfully!');
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
pm2 logs ctss --lines 20
```

### BƯỚC 6: Test lại login

Truy cập: `http://72.61.119.247/login`

Đăng nhập với:
- Phone: `0901234567`
- Password: `123456`

---

## Nếu database chưa được setup:

### Option 1: Dùng mock login (không cần database)

App đã có mock login API. Thử đăng nhập với:
- Email: `admin@ctss.com`
- Password: `123456`

### Option 2: Setup PostgreSQL

Nếu chưa có PostgreSQL, cài đặt:

```bash
# Cài PostgreSQL
apt update
apt install postgresql postgresql-contrib -y

# Start PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Tạo database và user
sudo -u postgres psql << EOF
CREATE DATABASE ctss;
CREATE USER ctssuser WITH PASSWORD 'Ctss@2025';
GRANT ALL PRIVILEGES ON DATABASE ctss TO ctssuser;
\q
EOF

# Update .env
echo 'DATABASE_URL="postgresql://ctssuser:Ctss@2025@localhost:5432/ctss"' >> ~/ctss/.env
```

Sau đó chạy lại:
```bash
cd ~/ctss
npx prisma db push
npx prisma db seed
```

---

## Kiểm tra lại:

```bash
# Test database connection
cd ~/ctss
npx prisma db push --skip-generate

# Test login API
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"0901234567","password":"123456"}'
```

