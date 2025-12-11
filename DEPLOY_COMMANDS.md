# 🚀 Hướng dẫn Deploy lên VPS

## ✅ Code đã được push lên GitHub thành công!

## 📋 Các bước deploy:

### Bước 1: SSH vào VPS
```bash
ssh root@72.61.119.247
```

### Bước 2: Sau khi SSH thành công, chạy các lệnh sau:

```bash
cd ~/ctss
git pull origin main
npm install --legacy-peer-deps
npx prisma db push --accept-data-loss
npx prisma generate
npm run build
pm2 restart ctss
pm2 save
```

### Bước 3: Kiểm tra deploy thành công

```bash
# Xem PM2 status
pm2 status

# Xem logs
pm2 logs ctss --lines 50

# Kiểm tra ứng dụng
curl http://localhost:3000/api/health
```

## 🌐 Truy cập ứng dụng:
- URL: http://72.61.119.247
- Health check: http://72.61.119.247/api/health

## 📝 Lưu ý:
- Nếu `pm2 restart ctss` báo lỗi "not found", chạy: `pm2 start npm --name "ctss" -- start`
- Nếu có lỗi build, kiểm tra logs: `pm2 logs ctss`
- Nếu có lỗi database, kiểm tra kết nối database trong `.env`

## ✅ Các thay đổi đã deploy:
- ✅ Fix infinite loop trong Services page
- ✅ Tối ưu API calls
- ✅ Thêm debounce cho search
- ✅ Cải thiện performance
