#!/bin/bash

echo "🗄️ SETUP DATABASE HOÀN CHỈNH CHO CTSS"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# BƯỚC 1: Pull code mới
echo -e "${YELLOW}BƯỚC 1: Pull code mới...${NC}"
cd ~/ctss
git pull origin main
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Pull code thành công${NC}"
else
    echo -e "${RED}❌ Pull code thất bại${NC}"
    exit 1
fi
echo ""

# BƯỚC 2: Grant quyền cho database user
echo -e "${YELLOW}BƯỚC 2: Grant quyền cho database user...${NC}"
sudo -u postgres psql << 'EOF'
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

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Grant quyền thành công${NC}"
else
    echo -e "${RED}❌ Grant quyền thất bại${NC}"
    exit 1
fi
echo ""

# BƯỚC 3: Generate Prisma Client
echo -e "${YELLOW}BƯỚC 3: Generate Prisma Client...${NC}"
cd ~/ctss
npx prisma generate
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Generate Prisma Client thành công${NC}"
else
    echo -e "${RED}❌ Generate Prisma Client thất bại${NC}"
    exit 1
fi
echo ""

# BƯỚC 4: Push schema vào database
echo -e "${YELLOW}BƯỚC 4: Push schema vào database...${NC}"
cd ~/ctss
npx prisma db push
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Push schema thành công${NC}"
else
    echo -e "${RED}❌ Push schema thất bại${NC}"
    echo -e "${YELLOW}⚠️  Nếu có lỗi permission, chạy lại BƯỚC 2${NC}"
    exit 1
fi
echo ""

# BƯỚC 5: Seed users
echo -e "${YELLOW}BƯỚC 5: Seed users vào database...${NC}"
cd ~/ctss
npm run db:seed 2>&1 || npx tsx prisma/seed.ts
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Seed users thành công${NC}"
else
    echo -e "${RED}❌ Seed users thất bại${NC}"
    exit 1
fi
echo ""

# BƯỚC 6: Kiểm tra users đã được tạo
echo -e "${YELLOW}BƯỚC 6: Kiểm tra users đã được tạo...${NC}"
cd ~/ctss
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  try {
    const users = await prisma.user.findMany();
    console.log('✅ Số lượng users:', users.length);
    if (users.length > 0) {
      users.forEach(u => {
        console.log('  -', u.name, '(' + u.phone + ')', '-', u.role);
      });
    } else {
      console.log('❌ Chưa có user nào');
    }
  } catch (e) {
    console.error('❌ Error:', e.message);
  } finally {
    await prisma.\$disconnect();
  }
})();
"
echo ""

# BƯỚC 7: Restart PM2
echo -e "${YELLOW}BƯỚC 7: Restart PM2...${NC}"
pm2 restart ctss
sleep 3
pm2 status
echo ""

# BƯỚC 8: Test login API
echo -e "${YELLOW}BƯỚC 8: Test login API...${NC}"
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"0900000001","password":"123456"}' | head -5
echo ""
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ SETUP DATABASE HOÀN TẤT!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📝 Tài khoản demo:"
echo "  - Admin: 0900000001 / 123456"
echo "  - Manager: 0900000002 / 123456"
echo "  - Reception: 0900000003 / 123456"
echo "  - Stylist: 0900000004 / 123456"
echo "  - Assistant: 0900000005 / 123456"
echo ""
echo "🌐 Truy cập: http://72.61.119.247/login"
echo ""

