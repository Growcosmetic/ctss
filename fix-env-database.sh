#!/bin/bash

echo "🔧 FIX .env - Dùng postgres user"
echo "=================================="
echo ""

# Backup .env
cp ~/ctss/.env ~/ctss/.env.backup
echo "✅ Đã backup .env"

# Kiểm tra password postgres
echo ""
echo "📝 Bạn cần nhập password của postgres user"
echo "   (Nếu chưa có, nhấn Enter để set password mới)"
echo ""

# Set password postgres (nếu chưa có)
read -p "Nhập password cho postgres user (hoặc Enter để giữ nguyên): " POSTGRES_PASSWORD

if [ -z "$POSTGRES_PASSWORD" ]; then
    echo "Giữ nguyên password hiện tại"
    POSTGRES_PASSWORD="postgres"
else
    echo "Setting password..."
    sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD '$POSTGRES_PASSWORD';" 2>/dev/null || true
fi

# Update .env
cd ~/ctss
cat > .env << EOF
DATABASE_URL="postgresql://postgres:${POSTGRES_PASSWORD}@localhost:5432/ctss"
NEXTAUTH_SECRET="somesecret123"
OPENAI_API_KEY="sk-proj-fake-key-cho-qua-build-123456"
EOF

echo ""
echo "✅ Đã update .env với postgres user"
echo ""
echo "📝 DATABASE_URL mới:"
echo "DATABASE_URL=\"postgresql://postgres:***@localhost:5432/ctss\""
echo ""
echo "🚀 Tiếp theo, chạy:"
echo "   npx prisma db push"
echo "   npm run db:seed"

