# 🚀 Deploy Phase 8 & 8.5 lên VPS

## ✅ Code đã được push lên GitHub

Branch: `phase-8-saas`
Repository: `https://github.com/Growcosmetic/ctss`

---

## 📋 Cách Deploy

### Option 1: Dùng Script Tự Động (Khuyến nghị)

1. **SSH vào VPS:**
   ```bash
   ssh root@72.61.119.247
   ```

2. **Vào thư mục project:**
   ```bash
   cd /root/ctss
   ```

3. **Pull script mới (nếu chưa có):**
   ```bash
   git pull origin phase-8-saas
   ```

4. **Chạy script deploy:**
   ```bash
   chmod +x deploy-phase8-vps.sh
   ./deploy-phase8-vps.sh
   ```

Script sẽ tự động:
- ✅ Pull code từ GitHub
- ✅ Install dependencies
- ✅ Update database schema (Prisma)
- ✅ Seed subscription plans
- ✅ Build ứng dụng
- ✅ Restart PM2

---

### Option 2: Deploy Thủ Công

```bash
# 1. SSH vào VPS
ssh root@72.61.119.247

# 2. Vào thư mục project
cd /root/ctss

# 3. Pull code
git fetch origin
git checkout phase-8-saas
git pull origin phase-8-saas

# 4. Install dependencies
npm install --legacy-peer-deps

# 5. Update database
npx prisma generate
npx prisma db push --accept-data-loss

# 6. Seed plans
npx prisma db seed

# 7. Build
npm run build

# 8. Restart PM2
pm2 restart ctss
# hoặc nếu chưa có:
pm2 start npm --name "ctss" -- start
pm2 save
```

---

## 🔍 Kiểm Tra Sau Khi Deploy

### 1. Kiểm tra PM2:
```bash
pm2 status
pm2 logs ctss --lines 50
```

### 2. Kiểm tra ứng dụng:
- Mở trình duyệt: `http://72.61.119.247:3000`
- Test API: `http://72.61.119.247:3000/api/subscription/current`

### 3. Kiểm tra database:
```bash
npx prisma studio
# Mở browser và kiểm tra:
# - Plan table có 4 plans (FREE, BASIC, PRO, ENTERPRISE)
# - Subscription table có record cho salon
```

---

## ⚠️ Xử Lý Lỗi

### Lỗi: "Cannot find module"
```bash
cd /root/ctss
rm -rf node_modules .next
npm install --legacy-peer-deps
npm run build
pm2 restart ctss
```

### Lỗi: "Database schema out of sync"
```bash
npx prisma db push --accept-data-loss
npx prisma generate
npm run build
pm2 restart ctss
```

### Lỗi: "Port 3000 already in use"
```bash
pm2 stop ctss
pm2 delete ctss
pm2 start npm --name "ctss" -- start
pm2 save
```

### Lỗi: "Plans not found"
```bash
npx prisma db seed
```

---

## 📝 Checklist Sau Khi Deploy

- [ ] PM2 đang chạy (`pm2 status`)
- [ ] Build thành công (`npm run build`)
- [ ] Database có 4 plans
- [ ] Subscription API hoạt động (`/api/subscription/current`)
- [ ] Subscription page load được (`/system/subscription`)
- [ ] Feature guards hoạt động (test POS với FREE plan)
- [ ] Limit guards hoạt động (test booking limit)

---

## 🎯 Test Phase 8 Features

### 1. Test Subscription Page:
- Login với user có role OWNER
- Truy cập `/system/subscription`
- Kiểm tra hiển thị plan hiện tại
- Kiểm tra usage & limits

### 2. Test Feature Gates:
- Login với FREE plan salon
- Thử tạo POS order → Should fail với message "Tính năng POS không có sẵn..."
- Upgrade lên BASIC plan
- Thử tạo POS order → Should succeed

### 3. Test Limits:
- Tạo bookings đến giới hạn (FREE: 100/tháng)
- Thử tạo booking thứ 101 → Should fail với message "Bạn đã đạt giới hạn..."

### 4. Test Edge Cases:
- Test downgrade plan
- Test expired subscription
- Test disabled salon

---

## ✅ Hoàn Tất

Sau khi deploy thành công, Phase 8 & 8.5 đã sẵn sàng cho production!

**Last Updated:** $(date)

