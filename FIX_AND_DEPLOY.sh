#!/bin/bash
# ============================================
# SCRIPT FIX VÀ DEPLOY TỰ ĐỘNG
# ============================================

echo "🔧 Bắt đầu fix và deploy..."

cd ~/ctss || { echo "❌ Không tìm thấy thư mục ~/ctss"; exit 1; }

# Bước 1: Fix Git
echo "📦 Stash local changes..."
git stash

echo "📥 Pulling code từ GitHub..."
git pull origin main

if [ $? -ne 0 ]; then
    echo "❌ Lỗi khi pull code từ GitHub"
    exit 1
fi

# Bước 2: Fix Database (tạo branch mặc định nếu cần)
echo "🗄️  Fix database constraint..."
npx prisma db execute --stdin <<EOF
INSERT INTO "Branch" (id, name, code, "createdAt", "updatedAt")
SELECT 'default-branch-id', 'Chi nhánh mặc định', 'DEFAULT', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Branch" WHERE id = 'default-branch-id');
EOF

# Bước 3: Cập nhật schema
echo "🗄️  Cập nhật database schema..."
npx prisma db push --accept-data-loss
npx prisma generate

# Bước 4: Install và Build
echo "📦 Cài đặt dependencies..."
npm install --legacy-peer-deps

echo "🔨 Build ứng dụng..."
npm run build

# Bước 5: Restart PM2
echo "🔄 Khởi động lại PM2..."
pm2 restart ctss || pm2 start npm --name "ctss" -- start
pm2 save

echo ""
echo "✅ Deploy hoàn tất!"
echo ""
echo "📊 Kiểm tra:"
pm2 status
pm2 logs ctss --lines 10
