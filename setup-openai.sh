#!/bin/bash

# Script để thêm OpenAI API Key vào .env

echo "🔑 Hướng dẫn cấu hình OpenAI API Key"
echo ""
echo "Bước 1: Lấy API Key từ OpenAI"
echo "👉 Truy cập: https://platform.openai.com/api-keys"
echo "👉 Tạo API key mới và copy"
echo ""
read -p "Nhập OpenAI API Key của bạn (sk-proj-...): " api_key

if [ -z "$api_key" ]; then
    echo "❌ API Key không được để trống!"
    exit 1
fi

# Kiểm tra file .env
if [ ! -f .env ]; then
    echo "⚠️  File .env không tồn tại, đang tạo mới..."
    touch .env
fi

# Kiểm tra xem đã có OPENAI_API_KEY chưa
if grep -q "OPENAI_API_KEY" .env; then
    echo "⚠️  Đã có OPENAI_API_KEY trong .env, đang cập nhật..."
    # Xóa dòng cũ
    sed -i '' '/^OPENAI_API_KEY=/d' .env
    sed -i '' '/^OPENAI_MODEL=/d' .env
fi

# Thêm API key vào .env
echo "" >> .env
echo "# OpenAI Configuration" >> .env
echo "OPENAI_API_KEY=$api_key" >> .env
echo "OPENAI_MODEL=gpt-4o-mini" >> .env

echo ""
echo "✅ Đã thêm OpenAI API Key vào .env!"
echo ""
echo "📝 Các bước tiếp theo:"
echo "1. Restart server: npm run dev"
echo "2. Test AI features tại: http://localhost:3000/mina"
echo ""
echo "🔒 Lưu ý: File .env đã được thêm vào .gitignore, không lo lộ API key!"

