#!/bin/bash

# Script để setup GitHub token cho git pull/push

echo "🔧 Setting up GitHub token for git operations..."

cd ~/ctss || exit 1

# Token từ user
TOKEN="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"
USERNAME="Growcosmetic"

# Option 1: Đổi remote URL để include token
echo ""
echo "📝 Option 1: Updating remote URL with token..."
git remote set-url origin https://${USERNAME}:${TOKEN}@github.com/${USERNAME}/ctss.git

# Test pull
echo ""
echo "🧪 Testing git pull..."
git pull origin main

echo ""
echo "✅ Setup completed!"
echo ""
echo "💡 Note: Token is now saved in git config"
echo "   To view: git remote -v"
echo ""
echo "⚠️  Security: Consider using SSH key instead for better security"

