#!/bin/bash

# Script để setup GitHub token cho git pull/push

echo "🔧 Setting up GitHub token for git operations..."

cd ~/ctss || exit 1

# Token từ user
TOKEN="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"
USERNAME="Growcosmetic"

# Đổi remote URL để include token (không hỏi username/password nữa)
echo ""
echo "📝 Updating remote URL with token..."
git remote set-url origin https://${USERNAME}:${TOKEN}@github.com/${USERNAME}/ctss.git

echo ""
echo "✅ Remote URL updated!"
echo ""

# Kiểm tra remote URL
echo "📋 Current remote URL:"
git remote -v

echo ""
echo "🧪 Testing git pull..."
git pull origin main

echo ""
echo "✅ Setup completed!"
echo ""
echo "💡 Token is now saved in git config"
echo "   You can pull/push without entering credentials"
echo ""
echo "⚠️  Security: Token is visible in .git/config"
echo "   Consider using SSH key for better security"

