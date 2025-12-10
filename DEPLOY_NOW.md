# 🚀 DEPLOY LÊN VPS - HƯỚNG DẪN NHANH

## ✅ Đã hoàn thành:
- ✅ Code đã được commit
- ✅ Code đã được push lên GitHub

## 📋 Bước tiếp theo - Deploy lên VPS:

### Cách 1: SSH vào VPS và chạy lệnh

```bash
# SSH vào VPS
ssh root@72.61.119.247

# Sau khi vào VPS, chạy các lệnh sau:
cd ~/ctss
git pull origin main
npm install
npx prisma db push --accept-data-loss
npx prisma generate
npm run build
pm2 restart ctss
```

### Cách 2: Dùng script deploy.sh (nếu SSH key đã setup)

```bash
./deploy.sh
```

---

## 🔍 Kiểm tra sau khi deploy:

```bash
# Kiểm tra PM2 status
pm2 status

# Xem logs
pm2 logs ctss --lines 50

# Kiểm tra ứng dụng
curl http://72.61.119.247/api/health
```

---

## 📝 Các thay đổi đã deploy:

1. ✅ Seed data system (`data/seed-data.js`)
2. ✅ Script seed toàn bộ hệ thống (`scripts/seed-all-via-api.js`)
3. ✅ POST endpoint cho `/api/services`
4. ✅ Sửa Prisma schema
5. ✅ README hướng dẫn seed data

---

## 🌐 Sau khi deploy xong:

- Truy cập: http://72.61.119.247
- CRM: http://72.61.119.247/crm
- Booking: http://72.61.119.247/booking

---

**Lưu ý**: Nếu SSH bị từ chối, cần:
1. Kiểm tra SSH key đã được thêm vào VPS chưa
2. Hoặc dùng password để SSH
3. Hoặc deploy thủ công qua SSH client
