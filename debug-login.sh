#!/bin/bash

# Script để debug và fix login issue

echo "🔍 Debugging login issue..."

cd ~/ctss || exit 1

# 1. Kiểm tra users trong database
echo ""
echo "📊 Step 1: Checking users in database..."
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  try {
    const users = await prisma.user.findMany();
    console.log('✅ Số lượng users:', users.length);
    if (users.length > 0) {
      users.forEach(u => {
        console.log('  -', u.name, '(' + u.phone + ')', '-', u.role, '- Password:', u.password);
      });
    } else {
      console.log('❌ Không có users nào! Cần seed users.');
    }
  } catch (e) {
    console.error('❌ Error:', e.message);
  } finally {
    await prisma.\$disconnect();
  }
})();
"

# 2. Seed users nếu chưa có
echo ""
echo "🌱 Step 2: Seeding users (if needed)..."
node seed-users-manual.js

# 3. Kiểm tra lại users sau khi seed
echo ""
echo "📊 Step 3: Verifying users after seed..."
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  try {
    const users = await prisma.user.findMany();
    console.log('✅ Số lượng users:', users.length);
    users.forEach(u => {
      console.log('  -', u.name, '(' + u.phone + ')', '-', u.role);
    });
  } catch (e) {
    console.error('❌ Error:', e.message);
  } finally {
    await prisma.\$disconnect();
  }
})();
"

# 4. Restart PM2
echo ""
echo "🔄 Step 4: Restarting PM2..."
pm2 restart ctss

# 5. Show PM2 status
echo ""
echo "📋 PM2 Status:"
pm2 status

echo ""
echo "✅ Debug completed!"
echo ""
echo "💡 Next steps:"
echo "   1. Test login at: http://72.61.119.247/login"
echo "   2. Use: 0900000001 / 123456"
echo "   3. If still fails, check PM2 logs: pm2 logs ctss --lines 50"

