# 🚀 HƯỚNG DẪN DEPLOY LÊN VPS

## ⚠️ QUAN TRỌNG
Bạn đang ở **localhost (MacBook)**, không phải VPS. Cần SSH vào VPS để deploy.

## 📋 Các bước deploy VPS

### Bước 1: SSH vào VPS
```bash
ssh user@72.61.119.247
# Nhập password khi được hỏi
```

### Bước 2: Vào thư mục project
```bash
cd ~/ctss
# hoặc
cd /path/to/ctss
```

### Bước 3: Pull code mới nhất
```bash
git pull origin main
```

### Bước 4: Cài đặt dependencies
```bash
npm install --legacy-peer-deps
```

### Bước 5: ⚠️ QUAN TRỌNG - Cập nhật database schema
```bash
# Cập nhật schema (có thể mất dữ liệu SKU duplicate)
npx prisma db push --accept-data-loss

# Generate Prisma Client mới
npx prisma generate
```

### Bước 6: Build ứng dụng
```bash
npm run build
```

### Bước 7: Restart PM2
```bash
pm2 restart ctss
# hoặc nếu chưa có PM2 process:
pm2 start npm --name ctss -- start
```

### Bước 8: Kiểm tra
```bash
# Xem status
pm2 status

# Xem logs
pm2 logs ctss --lines 50

# Xem logs real-time
pm2 logs ctss
```

## 🔍 Kiểm tra sau khi deploy

1. Truy cập: `http://72.61.119.247/inventory`
2. Mở DevTools (F12) → Console tab
3. Kiểm tra:
   - ✅ Không có lỗi 500
   - ✅ API `/api/inventory/stock` trả về data
   - ✅ Danh sách sản phẩm hiển thị
   - ✅ Import Excel hoạt động

## 🐛 Nếu có lỗi database permission trên VPS

```bash
# Kiểm tra .env file
cat .env | grep DATABASE_URL

# Kiểm tra database connection
psql -U ctss_user -d ctss_db -h localhost

# Nếu không connect được, cần fix permissions:
# (Chạy với user postgres)
sudo -u postgres psql
GRANT ALL PRIVILEGES ON DATABASE ctss_db TO ctss_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ctss_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ctss_user;
\q
```

## 📝 Script tự động (tùy chọn)

Tạo file `deploy.sh` trên VPS:

```bash
#!/bin/bash
cd ~/ctss
git pull origin main
npm install --legacy-peer-deps
npx prisma db push --accept-data-loss
npx prisma generate
npm run build
pm2 restart ctss
pm2 logs ctss --lines 20
```

Chạy: `bash deploy.sh`
