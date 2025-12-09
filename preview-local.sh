#!/bin/bash

echo "🚀 Bắt đầu setup để xem trước local..."

# Kiểm tra node_modules
if [ ! -d "node_modules" ]; then
  echo "📦 Cài đặt dependencies..."
  npm install
fi

# Kiểm tra .env.local
if [ ! -f ".env.local" ]; then
  echo "📝 Tạo file .env.local..."
  cat > .env.local << EOF
# Database
DATABASE_URL="postgresql://ctssuser:Ctss@2025@localhost:5432/ctss"

# Auth Secret
NEXTAUTH_SECRET="somesecret123"

# OpenAI (fake key cho local)
OPENAI_API_KEY="sk-proj-fake-key-cho-qua-build-123456"
EOF
  echo "✅ Đã tạo .env.local"
else
  echo "✅ File .env.local đã tồn tại"
fi

# Generate Prisma Client
echo "🔧 Generate Prisma Client..."
npx prisma generate

# Kiểm tra port 3000
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
  echo "⚠️  Port 3000 đang được sử dụng"
  read -p "Bạn có muốn kill process đang dùng port 3000? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    lsof -ti:3000 | xargs kill -9
    echo "✅ Đã kill process trên port 3000"
  fi
fi

# Chạy dev server
echo "🎉 Khởi động dev server..."
echo "📱 Mở trình duyệt: http://localhost:3000"
echo "📅 Test booking page: http://localhost:3000/booking"
echo ""
echo "💡 Nhấn Ctrl+C để dừng server"
echo ""

npm run dev

