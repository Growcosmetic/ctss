#!/bin/bash

# Script để sync code từ local lên VPS
# Sử dụng: ./sync-to-vps.sh

echo "🔄 CTSS - Sync to VPS Script"
echo "============================="
echo ""

# Kiểm tra xem có thay đổi chưa commit không
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Có thay đổi chưa commit!"
    echo ""
    echo "Bạn có muốn commit và push trước không? (y/n)"
    read -p "> " answer
    
    if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
        echo ""
        echo "💬 Nhập mô tả về thay đổi:"
        read -p "> " message
        
        if [ -z "$message" ]; then
            message="Update code"
        fi
        
        git add .
        git commit -m "🔧 $message"
        git push origin main
        echo ""
    else
        echo "❌ Vui lòng commit và push trước khi sync"
        exit 1
    fi
fi

echo ""
echo "📋 Hướng dẫn sync code lên VPS:"
echo ""
echo "1. SSH vào VPS:"
echo "   ssh root@72.61.119.247"
echo ""
echo "2. Chạy các lệnh sau trên VPS:"
echo "   cd ~/ctss"
echo "   git pull origin main"
echo "   npm run build"
echo "   pm2 restart ctss"
echo ""
echo "Hoặc chạy script tự động:"
echo "   cd ~/ctss"
echo "   git pull origin main"
echo "   ./rebuild-vps.sh"
echo ""

