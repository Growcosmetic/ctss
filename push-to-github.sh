#!/bin/bash

# 🚀 Script đẩy code CTSS lên GitHub
# Sử dụng: bash push-to-github.sh

echo "🚀 Bắt đầu đẩy code lên GitHub..."
echo ""

# Kiểm tra remote
echo "📡 Kiểm tra remote..."
git remote -v
echo ""

# Kiểm tra branch hiện tại
BRANCH=$(git branch --show-current)
echo "📍 Branch hiện tại: $BRANCH"
echo ""

# Xem status
echo "📊 Kiểm tra file thay đổi..."
git status --short | head -10
echo ""

# Confirm
read -p "❓ Bạn có chắc muốn commit và push tất cả thay đổi? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "❌ Đã hủy!"
    exit 1
fi

# Add tất cả file
echo "➕ Đang add các file..."
git add .

# Commit
echo "💾 Đang commit..."
git commit -m "✨ Complete CTSS System - All 35 Phases

- Phase 31: MINA Personalization Engine
- Phase 32: Financial Module & Profit Control  
- Phase 33: Dynamic Pricing Engine
- Phase 34: Membership & Loyalty System
- Phase 35: CTSS Control Tower (CEO Command Center)
- Fix all dashboard APIs with fallback mock data
- Fix authentication with mock endpoints
- Complete salon management system 5.0"

# Push
echo "⬆️  Đang push lên GitHub..."
git push -u origin $BRANCH

echo ""
echo "✅ Hoàn thành! Kiểm tra tại: https://github.com/Growcosmetic/ctss"

