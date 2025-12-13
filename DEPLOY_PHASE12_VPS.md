# 🚀 Deploy Phase 12 lên VPS

## Cách 1: SSH vào VPS và chạy script (Khuyến nghị)

### Bước 1: SSH vào VPS
```bash
ssh user@72.61.119.247
# hoặc
ssh root@72.61.119.247
```

### Bước 2: Copy script deploy vào VPS
```bash
# Trên VPS, tạo file deploy script
cat > ~/deploy-phase12.sh << 'SCRIPT'
#!/bin/bash
cd ~/ctss || cd /home/user/ctss
git fetch origin
git checkout phase-8-saas
git pull origin phase-8-saas
npm install --legacy-peer-deps
npx prisma migrate deploy
npx prisma generate
npm run build
pm2 restart ctss || pm2 start npm --name "ctss" -- start
pm2 save
pm2 status
SCRIPT

chmod +x ~/deploy-phase12.sh
~/deploy-phase12.sh
```

## Cách 2: Chạy từng lệnh thủ công

```bash
# SSH vào VPS
ssh user@72.61.119.247

# Vào thư mục project
cd ~/ctss

# Pull code mới nhất
git fetch origin
git checkout phase-8-saas
git pull origin phase-8-saas

# Cài đặt dependencies
npm install --legacy-peer-deps

# Cập nhật database (Phase 12: Automation Engine)
npx prisma db push --accept-data-loss
npx prisma generate

# Build ứng dụng
npm run build

# Restart PM2
pm2 restart ctss

# Kiểm tra
pm2 status
pm2 logs ctss --lines 50
```

## Cách 3: Sử dụng Hostinger Web Terminal

1. Truy cập: https://kul.hostingervps.com/2471/?token=c26a7769db633e2b5d775fd32ee5c681fedb7c11c9168c33799be918095af1ca

2. Copy và paste các lệnh sau:

```bash
cd ~/ctss
git fetch origin
git checkout phase-8-saas
git pull origin phase-8-saas
npm install --legacy-peer-deps
npx prisma migrate deploy
npx prisma generate
npm run build
pm2 restart ctss
pm2 save
pm2 status
```

## ✅ Kiểm tra sau khi deploy

```bash
# Xem PM2 status
pm2 status

# Xem logs
pm2 logs ctss --lines 50

# Test API
curl http://localhost:3000/api/automation/rules
```

## 🐛 Xử lý lỗi

### Lỗi: "Cannot find module"
```bash
rm -rf node_modules
npm install --legacy-peer-deps
npm run build
pm2 restart ctss
```

### Lỗi: "Database migration failed"
```bash
npx prisma db push --accept-data-loss
npx prisma generate
npm run build
pm2 restart ctss
```

### Lỗi: "Port already in use"
```bash
pm2 stop ctss
pm2 delete ctss
pm2 start npm --name "ctss" -- start
pm2 save
```
