#!/bin/bash

# Script tự động commit và push code lên GitHub
# Sử dụng: ./save-and-push.sh "Mô tả ngắn gọn về thay đổi"

echo "🚀 CTSS - Auto Save & Push Script"
echo "=================================="
echo ""

# Kiểm tra xem có thay đổi không
if [ -z "$(git status --porcelain)" ]; then
    echo "✅ Không có thay đổi nào để commit"
    exit 0
fi

# Hiển thị status
echo "📋 Các file đã thay đổi:"
git status --short
echo ""

# Lấy message từ tham số hoặc hỏi user
if [ -z "$1" ]; then
    echo "💬 Nhập mô tả ngắn gọn về thay đổi:"
    echo "   Ví dụ: Fix login issue, Add new feature, Update dashboard..."
    read -p "   Message: " message
else
    message="$1"
fi

# Nếu vẫn không có message, dùng default
if [ -z "$message" ]; then
    message="Update code"
fi

# Add tất cả thay đổi
echo ""
echo "📦 Đang add các file..."
git add .

# Commit
echo "💾 Đang commit với message: '$message'"
git commit -m "🔧 $message"

# Push
echo "⬆️  Đang push lên GitHub..."
git push origin main

echo ""
echo "✅ Hoàn thành!"
echo ""
echo "📝 Đã commit và push với message: '$message'"
echo ""
echo "💡 Bước tiếp theo trên VPS:"
echo "   cd ~/ctss"
echo "   git pull origin main"
echo "   npm run build"
echo "   pm2 restart ctss"

