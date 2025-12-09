#!/bin/bash

# Script deploy nhanh: Push GitHub + Deploy VPS
# Usage: ./deploy-now.sh

set -e

echo "🚀 CTSS Deployment Script"
echo "=========================="
echo ""

# Bước 1: Push GitHub
echo "📤 Bước 1: Push lên GitHub..."
git push origin main

if [ $? -ne 0 ]; then
    echo "❌ Push GitHub thất bại!"
    exit 1
fi

echo "✅ Đã push lên GitHub"
echo ""

# Bước 2: Deploy VPS
echo "🚀 Bước 2: Deploy lên VPS..."
echo "Vui lòng SSH vào VPS và chạy các lệnh sau:"
echo ""
echo "ssh root@72.61.119.247"
echo "cd ~/ctss"
echo "git pull origin main"
echo "npm install"
echo "npx prisma db push"
echo "npx prisma generate"
echo "npm run build"
echo "pm2 restart ctss"
echo ""
echo "Hoặc chạy script tự động trên VPS:"
echo "cd ~/ctss && ./deploy-vps.sh"
echo ""

# Option: Tự động SSH (nếu có SSH key)
read -p "Bạn có muốn tự động SSH và deploy không? (y/n): " auto_deploy

if [ "$auto_deploy" = "y" ]; then
    echo "Đang SSH vào VPS..."
    ssh root@72.61.119.247 << 'ENDSSH'
cd ~/ctss
echo "📥 Pulling code..."
git pull origin main
if [ $? -eq 0 ]; then
    echo "✅ Git pull thành công"
    echo "📦 Installing dependencies..."
    npm install
    echo "🗄️  Setting up database..."
    npx prisma db push --accept-data-loss || true
    npx prisma generate
    echo "🔨 Building..."
    npm run build
    echo "🔄 Restarting PM2..."
    pm2 restart ctss || pm2 start npm --name "ctss" -- start
    pm2 save
    echo "✅ Deployment hoàn thành!"
else
    echo "❌ Git pull thất bại"
    exit 1
fi
ENDSSH

    if [ $? -eq 0 ]; then
        echo ""
        echo "✨ Deployment thành công!"
        echo "🌐 Ứng dụng: http://72.61.119.247"
    else
        echo ""
        echo "⚠️  SSH thất bại. Vui lòng deploy thủ công theo hướng dẫn trên."
    fi
else
    echo ""
    echo "📝 Vui lòng deploy thủ công theo hướng dẫn trên."
fi

