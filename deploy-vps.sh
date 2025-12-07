#!/bin/bash

# Script tự động deploy CTSS lên VPS

set -e  # Exit on error

echo "🚀 CTSS VPS Deployment Script"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if in correct directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run this script in the project root.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Step 1: Pull latest code...${NC}"
git pull origin main || {
    echo -e "${YELLOW}⚠️  Git pull failed, continuing anyway...${NC}"
}

echo ""
echo -e "${GREEN}✅ Step 2: Install dependencies...${NC}"
npm install || {
    echo -e "${YELLOW}⚠️  npm install failed, trying with legacy-peer-deps...${NC}"
    npm install --legacy-peer-deps
}

echo ""
echo -e "${GREEN}✅ Step 3: Setup database...${NC}"
echo "Choose database setup method:"
echo "  1) prisma db push (Quick - Recommended)"
echo "  2) prisma migrate deploy (Requires permissions)"
echo "  3) Skip database setup"
read -p "Enter choice [1-3]: " db_choice

case $db_choice in
    1)
        echo "Running prisma db push..."
        npx prisma db push --accept-data-loss || {
            echo -e "${YELLOW}⚠️  db push failed, but continuing...${NC}"
        }
        npx prisma generate
        ;;
    2)
        echo "Running prisma migrate deploy..."
        npx prisma migrate deploy || {
            echo -e "${RED}❌ migrate deploy failed. You may need to grant database permissions.${NC}"
            echo -e "${YELLOW}Try running: npx prisma db push${NC}"
            exit 1
        }
        npx prisma generate
        ;;
    3)
        echo "Skipping database setup..."
        ;;
    *)
        echo -e "${YELLOW}Invalid choice, skipping database setup...${NC}"
        ;;
esac

echo ""
echo -e "${GREEN}✅ Step 4: Build application...${NC}"
npm run build || {
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
}

echo ""
echo -e "${GREEN}✅ Step 5: Start application...${NC}"
echo "Choose start method:"
echo "  1) npm start (Direct)"
echo "  2) PM2 (Recommended for production)"
echo "  3) Skip (Manual start)"
read -p "Enter choice [1-3]: " start_choice

case $start_choice in
    1)
        echo "Starting with npm start..."
        npm run start &
        echo -e "${GREEN}✅ App started in background${NC}"
        ;;
    2)
        if command -v pm2 &> /dev/null; then
            echo "Starting with PM2..."
            pm2 stop ctss 2>/dev/null || true
            pm2 start npm --name "ctss" -- start
            pm2 save
            echo -e "${GREEN}✅ App started with PM2${NC}"
            echo "View logs: pm2 logs ctss"
        else
            echo -e "${YELLOW}⚠️  PM2 not installed. Installing...${NC}"
            npm install -g pm2
            pm2 start npm --name "ctss" -- start
            pm2 save
            echo -e "${GREEN}✅ App started with PM2${NC}"
        fi
        ;;
    3)
        echo "Skipping start. Run manually:"
        echo "  npm run start"
        echo "  or"
        echo "  pm2 start npm --name 'ctss' -- start"
        ;;
    *)
        echo -e "${YELLOW}Invalid choice, skipping start...${NC}"
        ;;
esac

echo ""
echo -e "${GREEN}🎉 Deployment completed!${NC}"
echo ""
echo "📝 Next steps:"
echo "  - Check app: curl http://localhost:3000/api/health"
echo "  - View logs: pm2 logs ctss (if using PM2)"
echo "  - Setup Nginx: See HUONG_DAN_DEPLOY_VPS.md"
echo ""

