#!/bin/bash

echo "🌱 Tạo 10 khách hàng mẫu trên localhost..."
echo ""

# Chạy script với localhost URL
API_URL=http://localhost:3000 node scripts/seed-customers-api.js

echo ""
echo "✨ Hoàn thành! Refresh trang http://localhost:3000/crm để xem kết quả."

