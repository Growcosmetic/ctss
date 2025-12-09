#!/bin/bash

echo "🔍 KIỂM TRA DATABASE VÀ USER"
echo "=============================="
echo ""

echo "1. Kiểm tra DATABASE_URL:"
cat ~/ctss/.env | grep DATABASE_URL || echo "❌ Không tìm thấy DATABASE_URL"
echo ""

echo "2. Kiểm tra Prisma Client:"
ls -la ~/ctss/node_modules/.prisma/client 2>/dev/null | head -3 || echo "❌ Prisma Client chưa được generate"
echo ""

echo "3. Kiểm tra database connection:"
cd ~/ctss
npx prisma db push --skip-generate 2>&1 | tail -5
echo ""

echo "4. Kiểm tra user trong database:"
cd ~/ctss
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
      console.log('❌ Chưa có user nào trong database');
    }
  } catch (e) {
    console.error('❌ Error:', e.message);
  } finally {
    await prisma.\$disconnect();
  }
})();
" 2>&1
echo ""

echo "5. Kiểm tra PM2:"
pm2 status
echo ""

echo "6. Test login API:"
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"0901234567","password":"123456"}' | head -5 || echo "❌ API không phản hồi"
echo ""

echo "=== XONG ==="

