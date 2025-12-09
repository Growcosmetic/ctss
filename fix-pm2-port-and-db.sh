#!/bin/bash

# Script để fix port conflict và database

echo "🔧 Fixing PM2 port conflict and database..."

cd ~/ctss || exit 1

# 1. Stop all PM2 processes
echo ""
echo "🛑 Step 1: Stopping all PM2 processes..."
pm2 stop all
pm2 delete all

# 2. Kill any process using port 3000
echo ""
echo "🔪 Step 2: Killing processes on port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "No process found on port 3000"
pkill -f "next start" 2>/dev/null || echo "No next start process found"
sleep 2

# 3. Verify port 3000 is free
echo ""
echo "✅ Step 3: Verifying port 3000 is free..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 3000 is still in use. Trying to kill again..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    sleep 2
else
    echo "✅ Port 3000 is free"
fi

# 4. Push database schema
echo ""
echo "🗄️  Step 4: Pushing database schema..."
npx prisma db push --accept-data-loss

# 5. Generate Prisma client
echo ""
echo "📦 Step 5: Generating Prisma client..."
npx prisma generate

# 6. Seed users
echo ""
echo "🌱 Step 6: Seeding users..."
node seed-users-manual.js

# 7. Verify users
echo ""
echo "📊 Step 7: Verifying users..."
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  try {
    const users = await prisma.user.findMany();
    console.log('✅ Số lượng users:', users.length);
    if (users.length > 0) {
      users.forEach(u => {
        console.log('  -', u.name, '(' + u.phone + ')', '-', u.role);
      });
    } else {
      console.log('❌ Không có users! Chạy lại seed-users-manual.js');
    }
  } catch (e) {
    console.error('❌ Error:', e.message);
  } finally {
    await prisma.\$disconnect();
  }
})();
"

# 8. Start PM2
echo ""
echo "🚀 Step 8: Starting PM2..."
pm2 start ecosystem.config.js

# 9. Show status
echo ""
echo "📋 PM2 Status:"
pm2 status

# 10. Show logs
echo ""
echo "📋 Recent logs:"
pm2 logs ctss --lines 10 --nostream

echo ""
echo "✅ Fix completed!"
echo ""
echo "💡 Next steps:"
echo "   1. Test login at: http://72.61.119.247/login"
echo "   2. Use: 0900000001 / 123456"
echo "   3. If still fails, check logs: pm2 logs ctss --lines 50"

