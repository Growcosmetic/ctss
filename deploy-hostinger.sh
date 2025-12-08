#!/bin/bash

# Script tự động deploy CTSS lên Hostinger VPS
# Sử dụng: ./deploy-hostinger.sh

set -e  # Exit on error

echo "🚀 CTSS Hostinger Deployment Script"
echo "===================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if in correct directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run this script in the project root.${NC}"
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Warning: .env file not found!${NC}"
    echo -e "${BLUE}📝 Please create .env file with:${NC}"
    echo "   DATABASE_URL=postgresql://..."
    echo "   NODE_ENV=production"
    echo "   NEXT_PUBLIC_APP_URL=https://your-domain.com"
    echo ""
    read -p "Continue anyway? (y/n): " continue_choice
    if [ "$continue_choice" != "y" ]; then
        exit 1
    fi
fi

echo -e "${GREEN}✅ Step 1: Pull latest code...${NC}"
if [ -d ".git" ]; then
    git pull origin main || {
        echo -e "${YELLOW}⚠️  Git pull failed, continuing anyway...${NC}"
    }
else
    echo -e "${YELLOW}⚠️  Not a git repository, skipping pull...${NC}"
fi

echo ""
echo -e "${GREEN}✅ Step 2: Install dependencies...${NC}"
npm install || {
    echo -e "${YELLOW}⚠️  npm install failed, trying with legacy-peer-deps...${NC}"
    npm install --legacy-peer-deps
}

echo ""
echo -e "${GREEN}✅ Step 3: Setup database...${NC}"
echo "Choose database setup method:"
echo "  1) prisma db push (Quick - Recommended for first time)"
echo "  2) prisma migrate deploy (For production with migrations)"
echo "  3) Skip database setup"
read -p "Enter choice [1-3]: " db_choice

case $db_choice in
    1)
        echo "Running prisma generate..."
        npx prisma generate
        echo "Running prisma db push..."
        npx prisma db push --accept-data-loss || {
            echo -e "${YELLOW}⚠️  db push failed, but continuing...${NC}"
        }
        ;;
    2)
        echo "Running prisma generate..."
        npx prisma generate
        echo "Running prisma migrate deploy..."
        npx prisma migrate deploy || {
            echo -e "${RED}❌ migrate deploy failed.${NC}"
            echo -e "${YELLOW}Try running: npx prisma db push${NC}"
            read -p "Continue anyway? (y/n): " continue_db
            if [ "$continue_db" != "y" ]; then
                exit 1
            fi
        }
        ;;
    3)
        echo "Skipping database setup..."
        echo "Generating Prisma Client..."
        npx prisma generate
        ;;
    *)
        echo -e "${YELLOW}Invalid choice, skipping database setup...${NC}"
        npx prisma generate
        ;;
esac

echo ""
echo -e "${GREEN}✅ Step 4: Build application...${NC}"
npm run build || {
    echo -e "${RED}❌ Build failed!${NC}"
    echo -e "${YELLOW}Check the error above and fix it before continuing.${NC}"
    exit 1
}

echo ""
echo -e "${GREEN}✅ Step 5: Start application...${NC}"
echo "Choose start method:"
echo "  1) PM2 (Recommended for production)"
echo "  2) npm start (Direct - for testing)"
echo "  3) Skip (Manual start later)"
read -p "Enter choice [1-3]: " start_choice

case $start_choice in
    1)
        if command -v pm2 &> /dev/null; then
            echo "Stopping existing ctss process (if any)..."
            pm2 stop ctss 2>/dev/null || true
            pm2 delete ctss 2>/dev/null || true
            
            echo "Starting with PM2..."
            pm2 start npm --name "ctss" -- start
            pm2 save
            
            echo -e "${GREEN}✅ App started with PM2${NC}"
            echo ""
            echo -e "${BLUE}📝 Useful PM2 commands:${NC}"
            echo "  - View logs: pm2 logs ctss"
            echo "  - View status: pm2 status"
            echo "  - Restart: pm2 restart ctss"
            echo "  - Stop: pm2 stop ctss"
        else
            echo -e "${YELLOW}⚠️  PM2 not installed. Installing...${NC}"
            npm install -g pm2
            pm2 start npm --name "ctss" -- start
            pm2 save
            echo -e "${GREEN}✅ App started with PM2${NC}"
            echo ""
            echo -e "${BLUE}💡 Setup PM2 auto-start on reboot:${NC}"
            echo "  Run: pm2 startup"
            echo "  Then run the command that PM2 displays"
        fi
        ;;
    2)
        echo "Starting with npm start..."
        echo -e "${YELLOW}⚠️  Note: This will run in foreground. Press Ctrl+C to stop.${NC}"
        npm run start
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
echo -e "${BLUE}📝 Next steps:${NC}"
echo "  1. Check app: curl http://localhost:3000"
echo "  2. View logs: pm2 logs ctss (if using PM2)"
echo "  3. Setup Nginx: See HUONG_DAN_DEPLOY_HOSTINGER.md"
echo "  4. Setup SSL: certbot --nginx -d your-domain.com"
echo ""
echo -e "${GREEN}✅ Done!${NC}"
