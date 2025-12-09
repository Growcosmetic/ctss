#!/bin/bash
# Deploy nhanh: Push GitHub + Deploy VPS

git push origin main && \
ssh root@72.61.119.247 'cd ~/ctss && git pull && npm install && npx prisma db push --accept-data-loss && npx prisma generate && npm run build && pm2 restart ctss' && \
echo "✅ Deploy thành công! http://72.61.119.247"

