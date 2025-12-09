#!/bin/bash

echo "🚀 Bắt đầu tạo 10 khách hàng mẫu..."
echo ""

cd ~/ctss

echo "📥 Pull code mới nhất..."
git pull origin main

echo ""
echo "🌐 Kiểm tra server..."
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Server đang chạy"
    API_URL="http://localhost:3000" node scripts/seed-customers-api.js
else
    echo "⚠️  Server không chạy trên localhost, thử VPS URL..."
    API_URL="http://72.61.119.247" node scripts/seed-customers-api.js
fi

echo ""
echo "✨ Hoàn thành!"

