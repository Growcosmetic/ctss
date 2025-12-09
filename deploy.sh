#!/bin/bash
# Deploy nhanh: Pull + Push GitHub + Deploy VPS

echo "📥 Pulling latest code..."
git pull origin main

echo "📤 Pushing to GitHub..."
git push origin main

echo "🚀 Deploying to VPS..."
ssh root@72.61.119.247 'cd ~/ctss && git pull && npm install && npx prisma db push --accept-data-loss && npx prisma generate && npm run build && pm2 restart ctss'

echo "✅ Deploy thành công! http://72.61.119.247"
