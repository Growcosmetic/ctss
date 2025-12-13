#!/bin/bash
# ============================================
# SCRIPT DEPLOY PHASE 12 LÊN VPS
# Chạy script này trên VPS sau khi SSH vào
# ============================================

echo "🚀 Bắt đầu deploy Phase 12 (Automation Engine) lên VPS..."
echo ""

cd ~/ctss || cd /home/user/ctss || { echo "❌ Không tìm thấy thư mục ctss"; exit 1; }

echo "📥 Pulling code từ GitHub (branch: phase-8-saas)..."
git fetch origin
git checkout phase-8-saas
git pull origin phase-8-saas

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

echo "🗄️  Cập nhật database schema (Phase 12: Automation Engine)..."
npx prisma migrate deploy
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
echo "✅ Deploy Phase 12 hoàn tất!"
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
echo "✨ Tính năng mới trong Phase 12:"
echo "  - ✅ Automation Engine (rule-based, safe)"
echo "  - ✅ Automation Rules management"
echo "  - ✅ Automation Logs & Rollback"
echo "  - ✅ Trigger từ AIAction (HIGH/CRITICAL priority)"
echo "  - ✅ UI /dashboard/automation (OWNER only)"
echo ""

