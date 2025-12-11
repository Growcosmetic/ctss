# 🔧 Fix Build Error trên VPS

## ❌ Vấn đề:
- PM2 status: `errored`
- Lỗi: "Could not find a production build in the '.next' directory"
- Build không thành công hoặc thư mục .next bị thiếu

## ✅ Giải pháp:

### Bước 1: Dừng PM2 và xóa build cũ
```bash
cd ~/ctss
pm2 stop ctss
pm2 delete ctss
rm -rf .next
rm -rf node_modules/.cache
```

### Bước 2: Pull code mới nhất
```bash
git pull origin main
```

### Bước 3: Cài đặt dependencies
```bash
npm install --legacy-peer-deps
```

### Bước 4: Update database
```bash
npx prisma db push --accept-data-loss
npx prisma generate
```

### Bước 5: Build lại (quan trọng!)
```bash
npm run build
```

**Kiểm tra build có thành công:**
- Phải thấy: `✓ Compiled successfully`
- Phải có thư mục `.next` được tạo
- Không được có lỗi `Module not found` hoặc `Build failed`

### Bước 6: Khởi động lại với PM2
```bash
pm2 start npm --name "ctss" -- start
pm2 save
```

### Bước 7: Kiểm tra
```bash
pm2 status  # Phải là "online"
pm2 logs ctss --lines 20  # Xem logs
```

## 🔍 Nếu build vẫn fail:

### Kiểm tra lỗi cụ thể:
```bash
npm run build 2>&1 | tee build.log
cat build.log
```

### Thử cài đặt react-is riêng:
```bash
npm install react-is --save
npm run build
```

### Kiểm tra Node version:
```bash
node -v  # Phải >= 18.x
npm -v
```

## 📝 Lưu ý:
- **QUAN TRỌNG**: Phải build thành công trước khi start PM2
- Nếu build fail, không được start PM2
- Kiểm tra logs build để tìm lỗi cụ thể
