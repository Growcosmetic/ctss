#!/bin/bash
# ============================================
# SCRIPT DEPLOY LÊN VPS - CHẠY TRÊN VPS
# ============================================

echo "🚀 Bắt đầu deploy CTSS lên VPS..."
echo ""

cd ~/ctss || { echo "❌ Không tìm thấy thư mục ~/ctss"; exit 1; }

echo "📥 Pulling code từ GitHub..."
git pull origin main

if [ $? -ne 0 ]; then
    echo "❌ Lỗi khi pull code từ GitHub"
    exit 1
fi

echo "📦 Cài đặt dependencies..."
npm install --legacy-peer-deps

if [ $? -ne 0 ]; then
    echo "❌ Lỗi khi cài đặt dependencies"
    exit 1
fi

echo "🗄️  Cập nhật database schema..."
npx prisma db push --accept-data-loss
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Lỗi khi cập nhật database"
    exit 1
fi

echo "🔨 Build ứng dụng..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Lỗi khi build ứng dụng"
    exit 1
fi

echo "🔄 Khởi động lại PM2..."
pm2 restart ctss || pm2 start npm --name "ctss" -- start

if [ $? -ne 0 ]; then
    echo "❌ Lỗi khi khởi động PM2"
    exit 1
fi

echo "💾 Lưu cấu hình PM2..."
pm2 save

echo ""
echo "✅ Deploy hoàn tất!"
echo ""
echo "📊 Kiểm tra trạng thái:"
pm2 status
echo ""
echo "📋 Xem logs (50 dòng cuối):"
pm2 logs ctss --lines 50 --nostream
echo ""
echo "🌐 Truy cập ứng dụng:"
echo "  - http://72.61.119.247"
echo "  - https://ctss.huynhchitam.com (nếu đã setup domain)"
echo ""
echo "✨ Tính năng mới trong lần deploy này:"
echo "  - ✅ Hoàn thiện Copy/Duplicate Booking với API"
echo "  - ✅ Hoàn thiện Edit Booking với API"
echo "  - ✅ Quick Edit Booking (click để edit nhanh)"
echo "  - ✅ Walk-in Booking flow hoàn chỉnh"
echo "  - ✅ Staff Management module hoàn chỉnh"
echo "  - ✅ Cập nhật danh sách Dashboards (27 dashboards)"
echo ""
