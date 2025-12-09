# 🚀 Hướng dẫn Deploy với PM2

## ✅ BƯỚC 1: Pull code mới

```bash
cd ~/ctss
git pull origin main
```

## ✅ BƯỚC 2: Cài đặt PM2 (nếu chưa có)

```bash
npm install -g pm2
```

## ✅ BƯỚC 3: Tạo thư mục logs

```bash
mkdir -p logs
```

## ✅ BƯỚC 4: Khởi động app với PM2

```bash
pm2 start ecosystem.config.js
```

## ✅ BƯỚC 5: Lưu cấu hình PM2

```bash
# Lưu danh sách processes hiện tại
pm2 save

# Setup tự động khởi động lại khi server reboot
pm2 startup
```

Sau khi chạy `pm2 startup`, sẽ có một dòng lệnh hiển thị. **Copy và chạy dòng lệnh đó** (thường là `sudo env PATH=... pm2 startup systemd -u root --hp /root`).

## ✅ BƯỚC 6: Kiểm tra trạng thái

```bash
# Xem trạng thái
pm2 status

# Xem logs
pm2 logs ctss

# Xem logs real-time
pm2 logs ctss --lines 50
```

## ✅ BƯỚC 7: Mở firewall (nếu cần)

```bash
# Kiểm tra firewall
ufw status

# Mở port 3000
ufw allow 3000/tcp

# Reload firewall
ufw reload
```

## ✅ BƯỚC 8: Kiểm tra app đang chạy

```bash
# Kiểm tra từ server
curl http://localhost:3000

# Hoặc từ browser
http://YOUR_VPS_IP:3000
```

---

## 📋 Các lệnh PM2 hữu ích

```bash
# Xem trạng thái
pm2 status

# Xem logs
pm2 logs ctss

# Restart app
pm2 restart ctss

# Stop app
pm2 stop ctss

# Xóa app khỏi PM2
pm2 delete ctss

# Xem thông tin chi tiết
pm2 info ctss

# Xem monitoring
pm2 monit
```

---

## 🔧 Troubleshooting

### Nếu app không chạy:

1. **Kiểm tra logs:**
   ```bash
   pm2 logs ctss --lines 100
   ```

2. **Kiểm tra port 3000 đã được sử dụng chưa:**
   ```bash
   netstat -tulpn | grep 3000
   ```

3. **Kiểm tra file .env:**
   ```bash
   cat .env
   ```

4. **Kiểm tra database connection:**
   ```bash
   # Test database connection
   npx prisma db push --skip-generate
   ```

### Nếu cần thay đổi PORT:

Sửa file `ecosystem.config.js`:
```javascript
env: {
  NODE_ENV: 'production',
  PORT: 3001  // Thay đổi port ở đây
}
```

Sau đó restart:
```bash
pm2 restart ctss
```

---

## 🎉 Hoàn thành!

Sau khi hoàn thành các bước trên, app sẽ chạy trên:
- **URL:** `http://YOUR_VPS_IP:3000`
- **PM2:** Quản lý tự động, tự restart khi crash
- **Logs:** Lưu trong `./logs/pm2-error.log` và `./logs/pm2-out.log`

