#!/bin/bash
# 🚀 Script tự động deploy CTSS lên VPS
# Sử dụng: ./deploy-now.sh

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# VPS Configuration
VPS_HOST="root@72.61.119.247"
VPS_PATH="~/ctss"

echo -e "${BLUE}🚀 CTSS Auto Deploy Script${NC}"
echo "================================"
echo ""

# Check if in correct directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run this script in the project root.${NC}"
    exit 1
fi

# Step 1: Check git status
echo -e "${GREEN}📋 Step 1: Checking git status...${NC}"
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  You have uncommitted changes.${NC}"
    read -p "Do you want to commit and push? (y/n): " commit_choice
    if [ "$commit_choice" = "y" ]; then
        git add .
        read -p "Enter commit message: " commit_msg
        git commit -m "${commit_msg:-Auto commit before deploy}"
        git push origin main
    else
        echo -e "${YELLOW}⚠️  Continuing without commit...${NC}"
    fi
else
    echo -e "${GREEN}✅ Working directory is clean${NC}"
fi

echo ""
echo -e "${GREEN}🚀 Step 2: Deploying to VPS...${NC}"
echo -e "${BLUE}Connecting to ${VPS_HOST}...${NC}"

# Deploy commands
ssh ${VPS_HOST} << 'ENDSSH'
    set -e
    echo "📂 Changing to project directory..."
    cd ~/ctss || { echo "❌ Directory ~/ctss not found!"; exit 1; }
    
    echo "📥 Pulling latest code from GitHub..."
    git pull origin main || { echo "⚠️  Git pull failed, continuing..."; }
    
    echo "📦 Installing dependencies..."
    npm install --legacy-peer-deps || { echo "⚠️  npm install failed, continuing..."; }
    
    echo "🗄️  Updating database schema..."
    npx prisma db push --accept-data-loss || { echo "⚠️  Database push failed, continuing..."; }
    npx prisma generate || { echo "⚠️  Prisma generate failed, continuing..."; }
    
    echo "🔨 Building application..."
    npm run build || { echo "❌ Build failed!"; exit 1; }
    
    echo "🔄 Restarting application with PM2..."
    pm2 restart ctss || pm2 start npm --name "ctss" -- start || { echo "❌ PM2 restart failed!"; exit 1; }
    
    echo "💾 Saving PM2 configuration..."
    pm2 save || true
    
    echo "✅ Deployment completed successfully!"
ENDSSH

    if [ $? -eq 0 ]; then
        echo ""
    echo -e "${GREEN}🎉 Deployment thành công!${NC}"
    echo ""
    echo -e "${BLUE}📝 Kiểm tra ứng dụng:${NC}"
    echo "  - URL: http://72.61.119.247"
    echo "  - Health check: curl http://72.61.119.247/api/health"
    echo ""
    echo -e "${BLUE}📊 Xem logs:${NC}"
    echo "  ssh ${VPS_HOST} 'pm2 logs ctss --lines 50'"
        echo ""
    echo -e "${BLUE}📈 Xem PM2 status:${NC}"
    echo "  ssh ${VPS_HOST} 'pm2 status'"
else
    echo ""
    echo -e "${RED}❌ Deployment failed!${NC}"
    echo "Please check the error messages above."
    exit 1
fi
