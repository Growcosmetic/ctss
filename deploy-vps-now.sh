#!/bin/bash
# ============================================
# SCRIPT DEPLOY LÊN VPS - CHẠY TRÊN VPS
# ============================================

echo "🚀 Bắt đầu deploy phiếu xuất kho và di chuyển kho..."

cd ~/ctss

echo "📥 Pulling code từ GitHub..."
git pull origin main

echo "📦 Cài đặt dependencies..."
npm install --legacy-peer-deps

echo "🗄️  Cập nhật database schema..."
npx prisma db push --accept-data-loss
npx prisma generate

echo "🔨 Build ứng dụng..."
npm run build

echo "🔄 Khởi động lại PM2..."
pm2 restart ctss || pm2 start npm --name "ctss" -- start

echo "💾 Lưu cấu hình PM2..."
pm2 save

echo ""
echo "✅ Deploy hoàn tất!"
echo ""
echo "📊 Kiểm tra:"
echo "  pm2 status"
echo "  pm2 logs ctss --lines 50"
echo ""
echo "🌐 Truy cập: http://72.61.119.247/inventory"
echo ""
echo "✨ Tính năng mới:"
echo "  - Phiếu xuất kho với 12 phân loại"
echo "  - Di chuyển kho nội bộ"
echo "  - Công thức tính giảm giá đã được sửa"
echo "  - Validation cho phép unitPrice = 0"
