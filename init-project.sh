#!/bin/bash

# 🚀 Script khởi tạo lại dự án CTSS
# Script này sẽ reset database, seed data và khởi động lại server

set -e  # Exit on error

echo "🚀 Bắt đầu khởi tạo lại dự án..."

# Màu sắc cho output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Bước 1: Stop server nếu đang chạy
echo -e "\n${YELLOW}📌 Bước 1: Dừng server...${NC}"
if lsof -ti:3000 > /dev/null 2>&1; then
    echo "   Đang dừng process trên port 3000..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    sleep 2
    echo -e "   ${GREEN}✅ Đã dừng server${NC}"
else
    echo -e "   ${GREEN}✅ Không có server nào đang chạy${NC}"
fi

# Bước 2: Clean build cache
echo -e "\n${YELLOW}📌 Bước 2: Xóa cache build...${NC}"
rm -rf .next
rm -rf node_modules/.cache
echo -e "   ${GREEN}✅ Đã xóa cache${NC}"

# Bước 3: Install dependencies (nếu cần)
echo -e "\n${YELLOW}📌 Bước 3: Kiểm tra dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo "   Đang cài đặt dependencies..."
    npm install --legacy-peer-deps
    echo -e "   ${GREEN}✅ Đã cài đặt dependencies${NC}"
else
    echo -e "   ${GREEN}✅ Dependencies đã có${NC}"
fi

# Bước 4: Generate Prisma Client
echo -e "\n${YELLOW}📌 Bước 4: Generate Prisma Client...${NC}"
npx prisma generate
echo -e "   ${GREEN}✅ Đã generate Prisma Client${NC}"

# Bước 5: Push database schema
echo -e "\n${YELLOW}📌 Bước 5: Push database schema...${NC}"
npx prisma db push --accept-data-loss || {
    echo -e "   ${RED}❌ Lỗi khi push schema. Kiểm tra DATABASE_URL trong .env${NC}"
    exit 1
}
echo -e "   ${GREEN}✅ Đã push schema${NC}"

# Bước 6: Seed users
echo -e "\n${YELLOW}📌 Bước 6: Seed users...${NC}"
npm run db:seed || npx tsx prisma/seed.ts || {
    echo -e "   ${YELLOW}⚠️  Không thể seed users (có thể đã tồn tại)${NC}"
}
echo -e "   ${GREEN}✅ Đã seed users${NC}"

# Bước 7: Build project
echo -e "\n${YELLOW}📌 Bước 7: Build project...${NC}"
npm run build || {
    echo -e "   ${RED}❌ Lỗi khi build. Kiểm tra lỗi ở trên${NC}"
    exit 1
}
echo -e "   ${GREEN}✅ Đã build thành công${NC}"

# Bước 8: Start server
echo -e "\n${YELLOW}📌 Bước 8: Khởi động server...${NC}"
echo -e "   ${GREEN}✅ Khởi tạo hoàn tất!${NC}"
echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ Dự án đã được khởi tạo lại thành công!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📝 Để chạy server, sử dụng một trong các lệnh sau:"
echo "   • npm run dev          (development mode)"
echo "   • npm start            (production mode)"
echo ""
echo "🔐 Tài khoản demo:"
echo "   • Admin: 0900000001 / 123456"
echo "   • Manager: 0900000002 / 123456"
echo "   • Reception: 0900000003 / 123456"
echo ""
echo "🌐 Truy cập: http://localhost:3000"
echo ""
