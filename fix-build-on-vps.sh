#!/bin/bash
# Script để fix build error trên VPS
# Copy và chạy trên VPS: bash fix-build-on-vps.sh

set -e

echo "🔧 Fixing build error on VPS..."
echo ""

cd ~/ctss

echo "1️⃣ Stopping PM2..."
pm2 stop ctss || true
pm2 delete ctss || true

echo "2️⃣ Cleaning old build..."
rm -rf .next
rm -rf node_modules/.cache

echo "3️⃣ Pulling latest code..."
git pull origin main

echo "4️⃣ Installing dependencies..."
npm install --legacy-peer-deps

echo "5️⃣ Updating database..."
npx prisma db push --accept-data-loss || true
npx prisma generate

echo "6️⃣ Building application..."
echo "⚠️  This may take a few minutes..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "7️⃣ Starting PM2..."
    pm2 start npm --name "ctss" -- start
    pm2 save
    
    echo ""
    echo "🎉 Done! Checking status..."
    pm2 status
    
    echo ""
    echo "📊 View logs: pm2 logs ctss --lines 20"
else
    echo ""
    echo "❌ Build failed! Please check the error above."
    echo "Try running: npm install react-is --save"
    exit 1
fi
