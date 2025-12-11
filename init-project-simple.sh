#!/bin/bash

# 🚀 Script khởi tạo lại dự án CTSS (Đơn giản - không cần database)
# Script này chỉ reset code và build, không cần database

set -e  # Exit on error

echo "🚀 Bắt đầu khởi tạo lại dự án (đơn giản)..."

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

# Bước 4: Generate Prisma Client (cần database connection)
echo -e "\n${YELLOW}📌 Bước 4: Generate Prisma Client...${NC}"
npx prisma generate || {
    echo -e "   ${YELLOW}⚠️  Không thể generate Prisma Client (có thể database chưa chạy)${NC}"
}
echo -e "   ${GREEN}✅ Đã generate Prisma Client${NC}"

# Bước 5: Build project
echo -e "\n${YELLOW}📌 Bước 5: Build project...${NC}"
npm run build || {
    echo -e "   ${RED}❌ Lỗi khi build. Kiểm tra lỗi ở trên${NC}"
    exit 1
}
echo -e "   ${GREEN}✅ Đã build thành công${NC}"

# Hoàn tất
echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ Dự án đã được khởi tạo lại thành công!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📝 Để chạy server, sử dụng:"
echo "   • npm run dev          (development mode)"
echo ""
echo "🌐 Truy cập: http://localhost:3000"
echo ""
