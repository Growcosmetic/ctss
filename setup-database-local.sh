#!/bin/bash

# 🗄️ Script setup database cho local development

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🚀 Bắt đầu setup database...${NC}"

# Bước 1: Kiểm tra và khởi động PostgreSQL
echo -e "\n${YELLOW}📌 Bước 1: Kiểm tra PostgreSQL...${NC}"
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "   Đang khởi động PostgreSQL..."
    brew services restart postgresql@14 || brew services start postgresql@14
    echo "   Đợi PostgreSQL khởi động..."
    sleep 5
    
    # Kiểm tra lại
    if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
        echo -e "   ${RED}❌ Không thể khởi động PostgreSQL${NC}"
        echo "   Thử chạy thủ công: brew services start postgresql@14"
        exit 1
    fi
fi
echo -e "   ${GREEN}✅ PostgreSQL đã chạy${NC}"

# Bước 2: Tạo database nếu chưa có
echo -e "\n${YELLOW}📌 Bước 2: Kiểm tra database 'ctss'...${NC}"
if psql -h localhost -U $(whoami) -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw ctss; then
    echo -e "   ${GREEN}✅ Database 'ctss' đã tồn tại${NC}"
else
    echo "   Đang tạo database 'ctss'..."
    createdb ctss 2>/dev/null || psql -h localhost -U $(whoami) -d postgres -c "CREATE DATABASE ctss;" 2>/dev/null || {
        echo -e "   ${YELLOW}⚠️  Không thể tạo database tự động${NC}"
        echo "   Vui lòng tạo thủ công:"
        echo "   psql postgres"
        echo "   CREATE DATABASE ctss;"
        echo "   \\q"
    }
    echo -e "   ${GREEN}✅ Đã tạo database 'ctss'${NC}"
fi

# Bước 3: Generate Prisma Client
echo -e "\n${YELLOW}📌 Bước 3: Generate Prisma Client...${NC}"
npx prisma generate
echo -e "   ${GREEN}✅ Đã generate Prisma Client${NC}"

# Bước 4: Push schema
echo -e "\n${YELLOW}📌 Bước 4: Push database schema...${NC}"
npx prisma db push --accept-data-loss || {
    echo -e "   ${RED}❌ Lỗi khi push schema${NC}"
    echo "   Kiểm tra DATABASE_URL trong .env"
    exit 1
}
echo -e "   ${GREEN}✅ Đã push schema${NC}"

# Bước 5: Seed users
echo -e "\n${YELLOW}📌 Bước 5: Seed users...${NC}"
npm run db:seed || npx tsx prisma/seed.ts || {
    echo -e "   ${YELLOW}⚠️  Không thể seed users (có thể đã tồn tại)${NC}"
}
echo -e "   ${GREEN}✅ Đã seed users${NC}"

# Hoàn tất
echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ Database đã được setup thành công!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "🔐 Tài khoản demo:"
echo "   • Admin: 0900000001 / 123456"
echo "   • Manager: 0900000002 / 123456"
echo "   • Reception: 0900000003 / 123456"
echo ""
echo "🌐 Truy cập: http://localhost:3000"
echo ""
