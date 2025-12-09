#!/bin/bash

# Script để chạy seed customers trên VPS
# Usage: ./scripts/run-seed-on-vps.sh

echo "🚀 Chạy script seed customers trên VPS..."
echo ""

# Kiểm tra xem server có đang chạy không
if ! curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "⚠️  Server không chạy trên localhost:3000"
    echo "   Đang thử với URL VPS..."
    API_URL="http://72.61.119.247" node scripts/seed-customers-api.js
else
    echo "✅ Server đang chạy, sử dụng localhost..."
    node scripts/seed-customers-api.js
fi

echo ""
echo "✨ Hoàn thành!"

