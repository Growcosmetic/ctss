#!/bin/bash

# Script để kiểm tra thông tin database trên VPS
# Usage: ./scripts/check-vps-db-info.sh

echo "🔍 Kiểm tra thông tin database trên VPS..."
echo ""

ssh root@72.61.119.247 << 'EOF'
cd ~/ctss

echo "📋 Thông tin DATABASE_URL từ .env:"
if [ -f .env ]; then
    grep DATABASE_URL .env | sed 's/\(password\)[^@]*/\1***/g'
else
    echo "⚠️  File .env không tồn tại"
fi

echo ""
echo "📊 Kiểm tra PostgreSQL:"
sudo systemctl status postgresql --no-pager | head -5

echo ""
echo "🗄️  Databases:"
sudo -u postgres psql -c "\l" | grep ctss || echo "Database 'ctss' chưa tồn tại"

echo ""
echo "👤 Users:"
sudo -u postgres psql -c "\du" | grep -E "postgres|ctss" || echo "Không tìm thấy users"

EOF

echo ""
echo "✨ Hoàn thành!"

