#!/bin/bash
# ============================================
# LỆNH DEPLOY LÊN VPS
# ============================================

echo "🔐 Bước 1: SSH vào VPS"
echo ""
echo "Lệnh:"
echo "ssh root@72.61.119.247"
echo ""
echo "💡 Nếu lần đầu tiên:"
echo "   - Gõ 'yes' khi được hỏi 'Are you sure you want to continue connecting?'"
echo "   - Nhập password khi được yêu cầu"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Bước 2: Sau khi SSH thành công, chạy các lệnh sau:"
echo ""
echo "cd ~/ctss"
echo "git pull origin main"
echo "npm install"
echo "npx prisma db push --accept-data-loss"
echo "npx prisma generate"
echo "npm run build"
echo "pm2 restart ctss"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Kiểm tra sau khi deploy:"
echo "pm2 status"
echo "pm2 logs ctss --lines 50"
echo ""
echo "🌐 Truy cập: http://72.61.119.247"

