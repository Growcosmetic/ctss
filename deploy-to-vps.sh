#!/bin/bash

echo "🚀 Deploying to VPS..."

# Pull latest code
echo "📥 Pulling latest code from GitHub..."
git pull origin main

if [ $? -ne 0 ]; then
  echo "❌ Git pull failed!"
  exit 1
fi

# Install dependencies (if needed)
echo "📦 Checking dependencies..."
npm install

# Build
echo "🔨 Building application..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed!"
  exit 1
fi

# Restart PM2
echo "🔄 Restarting PM2..."
pm2 restart ctss

if [ $? -eq 0 ]; then
  echo "✅ Deployment completed successfully!"
  echo "🌐 Application is running at: http://72.61.119.247"
else
  echo "❌ PM2 restart failed!"
  exit 1
fi

