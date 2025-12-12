#!/bin/bash
# ============================================
# SCRIPT FIX VÀ DEPLOY LÊN VPS
# ============================================

echo "🔧 Bắt đầu fix và deploy..."

cd ~/ctss || { echo "❌ Không tìm thấy thư mục ~/ctss"; exit 1; }

echo "📦 Stash local changes..."
git stash

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
