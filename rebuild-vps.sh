#!/bin/bash

# Script để rebuild Next.js app trên VPS

echo "🔧 Rebuilding CTSS on VPS..."

cd ~/ctss || exit 1

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Install dependencies (nếu có thay đổi)
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🗄️  Generating Prisma client..."
npx prisma generate

# Build Next.js app
echo "🏗️  Building Next.js app..."
npm run build

# Restart PM2
echo "🔄 Restarting PM2..."
pm2 restart ctss

# Show logs
echo "📋 PM2 Status:"
pm2 status

echo ""
echo "✅ Rebuild completed!"
echo "🌐 App should be available at: http://72.61.119.247"
echo ""
echo "💡 If login still shows validation error, clear browser cache:"
echo "   - Mac: Cmd+Shift+R"
echo "   - Windows: Ctrl+Shift+R"
echo "   - Or use Incognito/Private window"

