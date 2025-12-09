# 🔧 Fix Database Permission - Version 2

## Vấn đề:
Vẫn còn lỗi `permission denied for schema public` sau khi grant quyền.

## Giải pháp:

### CÁCH 1: Grant quyền chi tiết hơn

```bash
cd ~/ctss
chmod +x fix-database-permission-v2.sh
./fix-database-permission-v2.sh
```

### CÁCH 2: Dùng postgres user để push (Nhanh nhất)

```bash
# 1. Kiểm tra password của postgres user
sudo -u postgres psql -c "\password postgres"
# Nhập password mới (hoặc giữ nguyên nếu đã có)

# 2. Sửa DATABASE_URL trong .env
cd ~/ctss
nano .env
```

Thay đổi dòng `DATABASE_URL` thành:
```
DATABASE_URL="postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/ctss"
```

(Lưu ý: Thay `YOUR_POSTGRES_PASSWORD` bằng password của postgres user)

Sau đó:

```bash
# 3. Push schema với postgres user
npx prisma db push

# 4. Seed users
npm run db:seed

# 5. Đổi lại DATABASE_URL về ctssuser (nếu muốn)
# Hoặc giữ nguyên postgres user (an toàn hơn)
```

### CÁCH 3: Tạo schema mới và grant quyền

```bash
sudo -u postgres psql -d ctss << EOF
-- Tạo schema mới
CREATE SCHEMA IF NOT EXISTS ctss_schema;

-- Grant quyền
GRANT ALL ON SCHEMA ctss_schema TO ctssuser;
GRANT CREATE ON SCHEMA ctss_schema TO ctssuser;

-- Set search path
ALTER DATABASE ctss SET search_path TO ctss_schema, public;

\q
EOF

# Sửa DATABASE_URL trong .env
# DATABASE_URL="postgresql://ctssuser:Ctss@2025@localhost:5432/ctss?schema=ctss_schema"
```

---

## Khuyến nghị:

**Dùng CÁCH 2** (postgres user) vì:
- Nhanh nhất
- Không cần fix permission
- Postgres user có đầy đủ quyền

Sau khi push schema xong, có thể giữ nguyên postgres user hoặc đổi lại ctssuser.

---

## Sau khi fix xong:

```bash
# Seed users
cd ~/ctss
npm run db:seed

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

# Restart PM2
pm2 restart ctss
```

