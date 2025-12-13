#!/bin/bash
# ============================================
# SCRIPT DEPLOY PHASE 8 - TỪ VPS
# ============================================

set -e  # Exit on error

echo "🚀 Bắt đầu deploy Phase 8 & 8.5..."
echo ""

# Detect project directory
if [ -d "/root/ctss" ]; then
    PROJECT_DIR="/root/ctss"
elif [ -d "~/ctss" ]; then
    PROJECT_DIR="~/ctss"
else
    PROJECT_DIR="$(pwd)"
fi

cd "$PROJECT_DIR" || { echo "❌ Không tìm thấy thư mục project"; exit 1; }

echo "📁 Thư mục project: $PROJECT_DIR"
echo ""

# Step 1: Pull code
echo "📥 Pulling code từ GitHub (branch: phase-8-saas)..."
git fetch origin
git checkout phase-8-saas || git checkout main
git pull origin phase-8-saas || git pull origin main

if [ $? -ne 0 ]; then
    echo "❌ Lỗi khi pull code từ GitHub"
    exit 1
fi

echo "✅ Code đã được cập nhật"
echo ""

# Step 2: Install dependencies
echo "📦 Cài đặt dependencies..."
npm install --legacy-peer-deps

if [ $? -ne 0 ]; then
    echo "❌ Lỗi khi cài đặt dependencies"
    exit 1
fi

echo "✅ Dependencies đã được cài đặt"
echo ""

# Step 3: Database migration
echo "🗄️  Cập nhật database schema..."
npx prisma generate

# Try db push first (faster, no migration files needed)
if npx prisma db push --accept-data-loss; then
    echo "✅ Database schema đã được cập nhật (db push)"
else
    echo "⚠️  db push failed, trying migrate deploy..."
    if npx prisma migrate deploy; then
        echo "✅ Database schema đã được cập nhật (migrate deploy)"
    else
        echo "❌ Lỗi khi cập nhật database"
        echo "💡 Thử chạy thủ công: npx prisma db push --accept-data-loss"
        exit 1
    fi
fi

echo ""

# Step 4: Seed plans (if needed)
echo "🌱 Seeding subscription plans..."
if npx prisma db seed; then
    echo "✅ Plans đã được seed"
else
    echo "⚠️  Seed failed (có thể plans đã tồn tại)"
fi

echo ""

# Step 5: Build
echo "🔨 Building ứng dụng..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Lỗi khi build ứng dụng"
    exit 1
fi

echo "✅ Build thành công"
echo ""

# Step 6: Restart PM2
echo "🔄 Khởi động lại PM2..."

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Cài đặt PM2..."
    npm install -g pm2
fi

# Restart or start app
if pm2 list | grep -q "ctss"; then
    echo "🔄 Restarting ctss..."
    pm2 restart ctss
else
    echo "🚀 Starting ctss..."
    pm2 start npm --name "ctss" -- start
fi

if [ $? -ne 0 ]; then
    echo "❌ Lỗi khi khởi động PM2"
    exit 1
fi

# Save PM2 config
pm2 save

echo "✅ PM2 đã được khởi động"
echo ""

# Step 7: Status check
echo "📊 Kiểm tra trạng thái:"
pm2 status

echo ""
echo "📋 Logs (50 dòng cuối):"
pm2 logs ctss --lines 50 --nostream

echo ""
echo "✅ Deploy hoàn tất!"
echo ""
echo "🌐 Ứng dụng đang chạy tại:"
echo "   - http://72.61.119.247:3000"
echo "   - http://localhost:3000"
echo ""
echo "💡 Để xem logs real-time: pm2 logs ctss"
echo "💡 Để restart: pm2 restart ctss"

