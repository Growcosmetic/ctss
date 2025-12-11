# 🚀 Lệnh Deploy VPS - Copy & Paste

## Cách 1: Sử dụng Hostinger Web Terminal

1. Truy cập: https://kul.hostingervps.com/2471/?token=c26a7769db633e2b5d775fd32ee5c681fedb7c11c9168c33799be918095af1ca

2. Copy và paste từng khối lệnh sau:

```bash
# Bước 1: Di chuyển vào thư mục dự án
cd /home/user/ctss

# Bước 2: Pull code mới nhất từ GitHub
git pull origin main

# Bước 3: Cài đặt dependencies (nếu có thay đổi)
npm install

# Bước 4: Generate Prisma Client
npx prisma generate

# Bước 5: Sync database schema
npx prisma db push --accept-data-loss

# Bước 6: Build ứng dụng
npm run build

# Bước 7: Restart PM2
pm2 restart ctss
```

## Cách 2: Sử dụng SSH (nếu có quyền truy cập)

```bash
ssh user@72.61.119.247

# Sau khi vào VPS, chạy các lệnh trên
```

## Kiểm tra sau khi deploy

```bash
# Xem trạng thái PM2
pm2 status

# Xem logs
pm2 logs ctss --lines 50

# Kiểm tra ứng dụng
curl http://localhost:3001/inventory
```

## Nếu có lỗi

```bash
# Xem logs chi tiết
pm2 logs ctss --err --lines 100

# Restart lại
pm2 restart ctss

# Nếu cần rebuild
npm run build
pm2 restart ctss
```
