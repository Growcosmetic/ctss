#!/bin/bash

# Script tự động deploy CTSS lên VPS - Từng bước

set -e  # Exit on error

echo "🚀 CTSS VPS Deployment - Step by Step"
echo "======================================"
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

# Step 1: Git Configuration
echo -e "${BLUE}📥 Step 1: Git Configuration${NC}"
echo "-----------------------------------"
git config pull.rebase false
echo -e "${GREEN}✅ Git config set${NC}"

# Step 2: Pull latest code
echo ""
echo -e "${BLUE}📥 Step 2: Pulling latest code...${NC}"
echo "-----------------------------------"
if git pull origin main; then
    echo -e "${GREEN}✅ Code pulled successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Git pull failed or already up to date${NC}"
fi

# Step 3: Check Node.js
echo ""
echo -e "${BLUE}📦 Step 3: Checking Node.js...${NC}"
echo "-----------------------------------"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✅ Node.js installed: $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+ first.${NC}"
    exit 1
fi

# Step 4: Install dependencies
echo ""
echo -e "${BLUE}📦 Step 4: Installing dependencies...${NC}"
echo "-----------------------------------"
if npm install; then
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠️  npm install failed, trying with legacy-peer-deps...${NC}"
    npm install --legacy-peer-deps || {
        echo -e "${RED}❌ Failed to install dependencies${NC}"
        exit 1
    }
fi

# Step 5: Check Prisma schema
echo ""
echo -e "${BLUE}🗄️  Step 5: Checking Prisma schema...${NC}"
echo "-----------------------------------"
if [ -f "prisma/schema.prisma" ]; then
    echo -e "${GREEN}✅ Prisma schema found${NC}"
else
    echo -e "${RED}❌ Prisma schema not found at prisma/schema.prisma${NC}"
    exit 1
fi

# Step 6: Check .env file
echo ""
echo -e "${BLUE}🔐 Step 6: Checking .env file...${NC}"
echo "-----------------------------------"
if [ -f ".env" ]; then
    if grep -q "DATABASE_URL" .env; then
        echo -e "${GREEN}✅ .env file found with DATABASE_URL${NC}"
    else
        echo -e "${YELLOW}⚠️  .env file found but DATABASE_URL not set${NC}"
        echo "Please set DATABASE_URL in .env file"
    fi
else
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    if [ -f ".env.example" ]; then
        echo "Copying .env.example to .env..."
        cp .env.example .env
        echo -e "${YELLOW}⚠️  Please edit .env file and set DATABASE_URL${NC}"
    fi
fi

# Step 7: Generate Prisma Client
echo ""
echo -e "${BLUE}🗄️  Step 7: Generating Prisma Client...${NC}"
echo "-----------------------------------"
if npx prisma generate; then
    echo -e "${GREEN}✅ Prisma Client generated${NC}"
else
    echo -e "${RED}❌ Failed to generate Prisma Client${NC}"
    exit 1
fi

# Step 8: Push database schema
echo ""
echo -e "${BLUE}🗄️  Step 8: Pushing database schema...${NC}"
echo "-----------------------------------"
read -p "Push schema to database? (y/n): " push_db
if [ "$push_db" = "y" ] || [ "$push_db" = "Y" ]; then
    if npx prisma db push --accept-data-loss; then
        echo -e "${GREEN}✅ Database schema pushed${NC}"
    else
        echo -e "${YELLOW}⚠️  Database push failed (may need permissions)${NC}"
        echo "See QUICK_FIX_DATABASE.md for help"
    fi
else
    echo -e "${YELLOW}⚠️  Skipped database push${NC}"
fi

# Step 9: Build
echo ""
echo -e "${BLUE}🏗️  Step 9: Building application...${NC}"
echo "-----------------------------------"
if npm run build; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    echo "Check errors above and fix them"
    exit 1
fi

# Step 10: Setup PM2
echo ""
echo -e "${BLUE}🚀 Step 10: Setting up PM2...${NC}"
echo "-----------------------------------"
if command -v pm2 &> /dev/null; then
    echo -e "${GREEN}✅ PM2 already installed${NC}"
else
    echo "Installing PM2..."
    if npm install -g pm2; then
        echo -e "${GREEN}✅ PM2 installed${NC}"
    else
        echo -e "${RED}❌ Failed to install PM2${NC}"
        exit 1
    fi
fi

# Step 11: Stop old app
echo ""
echo -e "${BLUE}🛑 Step 11: Stopping old app (if exists)...${NC}"
echo "-----------------------------------"
pm2 stop ctss 2>/dev/null || true
pm2 delete ctss 2>/dev/null || true
echo -e "${GREEN}✅ Old app stopped${NC}"

# Step 12: Start app
echo ""
echo -e "${BLUE}🚀 Step 12: Starting application...${NC}"
echo "-----------------------------------"
if pm2 start npm --name "ctss" -- start; then
    echo -e "${GREEN}✅ App started with PM2${NC}"
else
    echo -e "${RED}❌ Failed to start app${NC}"
    exit 1
fi

# Step 13: Save PM2
echo ""
echo -e "${BLUE}💾 Step 13: Saving PM2 process list...${NC}"
echo "-----------------------------------"
pm2 save
echo -e "${GREEN}✅ PM2 process list saved${NC}"

# Step 14: Setup auto-start
echo ""
echo -e "${BLUE}🔄 Step 14: Setting up PM2 auto-start...${NC}"
echo "-----------------------------------"
read -p "Setup PM2 auto-start on reboot? (y/n): " setup_startup
if [ "$setup_startup" = "y" ] || [ "$setup_startup" = "Y" ]; then
    STARTUP_CMD=$(pm2 startup | grep -v "PM2" | grep -v "To setup" | grep -v "copy/paste")
    if [ ! -z "$STARTUP_CMD" ]; then
        echo "Run this command as root:"
        echo -e "${YELLOW}$STARTUP_CMD${NC}"
    else
        echo -e "${GREEN}✅ PM2 startup already configured${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Skipped PM2 startup setup${NC}"
fi

# Step 15: Check status
echo ""
echo -e "${BLUE}✅ Step 15: Checking status...${NC}"
echo "-----------------------------------"
pm2 status
echo ""
echo -e "${GREEN}📝 View logs: pm2 logs ctss${NC}"
echo -e "${GREEN}📝 Restart: pm2 restart ctss${NC}"
echo -e "${GREEN}📝 Stop: pm2 stop ctss${NC}"

echo ""
echo -e "${GREEN}🎉 Deployment completed!${NC}"
echo ""
echo "📝 Next steps:"
echo "  - Check app: curl http://localhost:3000/api/health"
echo "  - View logs: pm2 logs ctss"
echo "  - Setup Nginx: See HUONG_DAN_DEPLOY_VPS.md"

