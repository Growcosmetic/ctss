#!/bin/bash

# Script deploy CTSS lên VPS Hostinger
# Sử dụng: ./deploy-vps.sh

set -e

VPS_USER="user"
VPS_HOST="72.61.119.247"
VPS_PATH="/home/user/ctss"

echo "🚀 Bắt đầu deploy lên VPS..."

# Bước 1: Push code lên GitHub
echo "📤 Đang push code lên GitHub..."
git add -A
git commit -m "Deploy: $(date +%Y-%m-%d_%H:%M:%S)" || echo "No changes to commit"
git push origin main

echo "✅ Đã push lên GitHub"

# Bước 2: SSH vào VPS và deploy
echo "🔌 Đang kết nối VPS và deploy..."

ssh ${VPS_USER}@${VPS_HOST} << 'ENDSSH'
cd /home/user/ctss

echo "📥 Đang pull code mới nhất..."
git pull origin main

echo "📦 Đang cài đặt dependencies..."
npm install

echo "🗄️ Đang sync database..."
npx prisma generate
npx prisma db push --accept-data-loss

echo "🏗️ Đang build ứng dụng..."
npm run build

echo "🔄 Đang restart PM2..."
pm2 restart ctss || pm2 start npm --name "ctss" -- start

echo "✅ Deploy hoàn tất!"
pm2 status
ENDSSH

echo "🎉 Deploy thành công!"
