# 🔧 Fix và Deploy lại

## ✅ Đã fix:
- ✅ Thêm `react-is` dependency vào package.json
- ✅ Đã push lên GitHub

## 📋 Deploy lại trên VPS:

### SSH vào VPS và chạy:

```bash
ssh root@72.61.119.247

cd ~/ctss
git pull origin main
npm install --legacy-peer-deps
npx prisma db push --accept-data-loss
npx prisma generate
npm run build
pm2 restart ctss
pm2 save
```

### Kiểm tra:

```bash
# Xem PM2 status (phải là "online")
pm2 status

# Xem logs
pm2 logs ctss --lines 50

# Kiểm tra build có thành công không
# Nếu vẫn lỗi, thử:
npm install react-is --save
npm run build
pm2 restart ctss
```

## 🌐 Sau khi deploy thành công:
- URL: http://72.61.119.247
- Health check: http://72.61.119.247/api/health
