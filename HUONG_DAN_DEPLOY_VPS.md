# 🚀 Hướng Dẫn Deploy CTSS lên VPS - Nhanh Gọn

## ⚡ Cách 1: Deploy Nhanh (Khuyến nghị)

### Bước 1: Đảm bảo code đã push lên GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Bước 2: SSH vào VPS
```bash
ssh root@72.61.119.247
```
(Nhập password khi được yêu cầu)

### Bước 3: Chạy script deploy
```bash
cd ~/ctss
bash DEPLOY_VPS_COMMANDS.sh
```

Hoặc copy script và chạy trực tiếp:
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

---

## 📋 Cách 2: Deploy Từng Bước (Chi tiết)

### 1. Kết nối VPS
```bash
ssh root@72.61.119.247
```

### 2. Vào thư mục project
```bash
cd ~/ctss
```

### 3. Pull code mới
```bash
git pull origin main
```

### 4. Cài đặt dependencies
```bash
npm install --legacy-peer-deps
```

### 5. Cập nhật database
```bash
npx prisma db push --accept-data-loss
npx prisma generate
```

### 6. Build ứng dụng
```bash
npm run build
```

### 7. Restart PM2
```bash
pm2 restart ctss
```

Nếu PM2 chưa chạy:
```bash
pm2 start npm --name "ctss" -- start
pm2 save
```

### 8. Kiểm tra
```bash
pm2 status
pm2 logs ctss --lines 50
```

---

## 🔍 Kiểm Tra Sau Khi Deploy

### 1. Kiểm tra PM2 status
```bash
pm2 status
```
Phải thấy `ctss` đang chạy (status: online)

### 2. Xem logs
```bash
pm2 logs ctss --lines 50
```
Kiểm tra xem có lỗi không

### 3. Test ứng dụng
- Mở trình duyệt: `http://72.61.61.119.247`
- Hoặc: `https://ctss.huynhchitam.com` (nếu đã setup domain)

---

## ⚠️ Xử Lý Lỗi

### Lỗi: "Cannot find module"
```bash
cd ~/ctss
rm -rf node_modules
npm install --legacy-peer-deps
npm run build
pm2 restart ctss
```

### Lỗi: "Port already in use"
```bash
pm2 stop ctss
pm2 delete ctss
pm2 start npm --name "ctss" -- start
```

### Lỗi: "Database connection failed"
- Kiểm tra file `.env` trên VPS
- Đảm bảo `DATABASE_URL` đúng
- Test connection: `npx prisma db push`

### Lỗi: "Build failed"
```bash
cd ~/ctss
rm -rf .next
npm run build
```

---

## 📞 Thông Tin VPS

- **IP:** 72.61.119.247
- **Domain:** ctss.huynhchitam.com (nếu đã setup)
- **SSH:** `ssh root@72.61.119.247`
- **PM2 Process:** `ctss`

---

## ✅ Checklist Deploy

- [ ] Code đã push lên GitHub
- [ ] SSH vào VPS thành công
- [ ] Pull code mới
- [ ] Install dependencies
- [ ] Update database schema
- [ ] Build thành công
- [ ] PM2 restart thành công
- [ ] Test ứng dụng hoạt động

---

**🎉 Chúc bạn deploy thành công!**
