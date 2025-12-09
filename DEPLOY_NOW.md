# 🚀 HƯỚNG DẪN DEPLOY NHANH

## ✅ **Bước 1: Push GitHub (Đã hoàn thành)**

Code đã được push lên GitHub thành công!

---

## 🚀 **Bước 2: Deploy lên VPS**

### **Cách 1: Tự động (Nếu có SSH key)**

```bash
./deploy-now.sh
```

### **Cách 2: Thủ công (Khuyến nghị)**

**SSH vào VPS:**
```bash
ssh root@72.61.119.247
```

**Chạy các lệnh sau trên VPS:**
```bash
cd ~/ctss

# Pull code mới
git pull origin main

# Install dependencies (nếu có package mới)
npm install

# Setup database
npx prisma db push --accept-data-loss
npx prisma generate

# Build ứng dụng
npm run build

# Restart PM2
pm2 restart ctss

# Hoặc nếu chưa có PM2
pm2 start npm --name "ctss" -- start
pm2 save
```

### **Cách 3: Dùng script có sẵn trên VPS**

```bash
ssh root@72.61.119.247
cd ~/ctss
./deploy-vps.sh
```

---

## ✅ **Kiểm tra sau khi deploy**

```bash
# Kiểm tra PM2
pm2 status
pm2 logs ctss

# Kiểm tra ứng dụng
curl http://localhost:3000/api/health

# Kiểm tra từ browser
http://72.61.119.247
```

---

## 🐛 **Xử lý lỗi**

### **Lỗi: Permission denied (SSH)**
- Cần nhập password hoặc setup SSH key
- Hoặc deploy thủ công trên VPS

### **Lỗi: Git pull failed**
- Kiểm tra kết nối internet trên VPS
- Kiểm tra quyền truy cập GitHub

### **Lỗi: Build failed**
```bash
# Clear và rebuild
rm -rf .next node_modules
npm install
npm run build
```

### **Lỗi: Database permission**
```bash
# Dùng db push thay vì migrate
npx prisma db push --accept-data-loss
```

---

## 📝 **Ghi chú**

- **VPS IP**: 72.61.119.247
- **App URL**: http://72.61.119.247
- **PM2 Name**: ctss
- **Port**: 3000

---

*Last updated: 2025-01-XX*

