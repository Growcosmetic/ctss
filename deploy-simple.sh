#!/bin/bash
# 🚀 Script deploy đơn giản - chỉ deploy, không commit
# Sử dụng: ./deploy-simple.sh

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

VPS_HOST="root@72.61.119.247"

echo -e "${BLUE}🚀 Deploying to VPS...${NC}"
echo ""

ssh ${VPS_HOST} << 'ENDSSH'
    set -e
    cd ~/ctss
    
    echo "📥 Pulling latest code..."
    git pull origin main
    
    echo "📦 Installing dependencies..."
    npm install --legacy-peer-deps
    
    echo "🗄️  Updating database..."
    npx prisma db push --accept-data-loss
    npx prisma generate
    
    echo "🔨 Building application..."
    npm run build
    
    echo "🔄 Restarting PM2..."
    pm2 restart ctss || pm2 start npm --name "ctss" -- start
    pm2 save
    
    echo "✅ Deployment completed!"
ENDSSH

echo ""
echo -e "${GREEN}🎉 Deploy thành công!${NC}"
echo "URL: http://72.61.119.247"
