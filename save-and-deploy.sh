#!/bin/bash

# Script tự động: Save code -> Push GitHub -> Deploy VPS
# Usage: ./save-and-deploy.sh "Mô tả commit"

if [ -z "$1" ]; then
    echo "❌ Vui lòng nhập mô tả commit"
    echo "Usage: ./save-and-deploy.sh \"Mô tả thay đổi\""
    exit 1
fi

COMMIT_MSG="$1"

echo "🚀 Bắt đầu workflow: Save -> Push -> Deploy"
echo ""

# Bước 1: Kiểm tra thay đổi
echo "📋 Bước 1: Kiểm tra thay đổi..."
if [ -z "$(git status --porcelain)" ]; then
    echo "⚠️  Không có thay đổi nào để commit"
    exit 0
fi

git status --short
echo ""

# Bước 2: Add và Commit
echo "💾 Bước 2: Commit code..."
git add -A
git commit -m "$COMMIT_MSG"

if [ $? -ne 0 ]; then
    echo "❌ Commit thất bại!"
    exit 1
fi

echo "✅ Đã commit: $COMMIT_MSG"
echo ""

# Bước 3: Push GitHub
echo "📤 Bước 3: Push lên GitHub..."
git push origin main

if [ $? -ne 0 ]; then
    echo "❌ Push GitHub thất bại!"
    exit 1
fi

echo "✅ Đã push lên GitHub"
echo ""

# Bước 4: Deploy VPS
echo "🚀 Bước 4: Deploy lên VPS..."
echo "Đang pull code và restart trên VPS..."

ssh root@72.61.119.247 << 'ENDSSH'
cd ~/ctss
git pull origin main
if [ $? -eq 0 ]; then
    echo "✅ Đã pull code mới"
    npm install
    npm run build
    pm2 restart ctss
    echo "✅ Đã restart PM2"
else
    echo "❌ Git pull thất bại"
    exit 1
fi
ENDSSH

if [ $? -eq 0 ]; then
    echo ""
    echo "✨ Hoàn thành workflow!"
    echo "🌐 Ứng dụng đã được deploy tại: http://72.61.119.247"
else
    echo ""
    echo "⚠️  Deploy có thể đã thất bại, vui lòng kiểm tra lại"
fi

