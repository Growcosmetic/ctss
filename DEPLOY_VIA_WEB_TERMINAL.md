# 🚀 Deploy qua Hostinger VPS Web Terminal

## ✅ Cách này đơn giản hơn SSH!

Bạn có thể deploy trực tiếp qua Web Terminal mà không cần SSH password.

---

## 📋 Các bước deploy

### Bước 1: Mở Web Terminal
1. Truy cập: https://kul.hostingervps.com/2471/?token=c26a7769db633e2b5d775fd32ee5c681fedb7c11c9168c33799be918095af1ca
2. Nhấn **"Press any key to wake your server"** nếu cần
3. Đợi terminal load xong

### Bước 2: Vào thư mục project
```bash
cd ~/ctss
# hoặc
cd /root/ctss
# hoặc
cd /home/user/ctss
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
# Kiểm tra PM2 có đang chạy không
pm2 list

# Nếu có process "ctss", restart:
pm2 restart ctss

# Nếu chưa có, start mới:
pm2 start npm --name "ctss" -- start
pm2 save
```

### Bước 8: Kiểm tra logs
```bash
pm2 logs ctss --lines 50
```

---

## 🔍 Kiểm tra sau khi deploy

1. **Truy cập:** http://72.61.119.247/inventory
2. **Mở DevTools (F12)** → Console tab
3. **Kiểm tra:**
   - ✅ Không có lỗi 500
   - ✅ API `/api/inventory/stock` trả về data
   - ✅ Danh sách sản phẩm hiển thị
   - ✅ Import Excel hoạt động

---

## 🐛 Nếu có lỗi

### Lỗi: "command not found: pm2"
```bash
# Cài PM2 global
npm install -g pm2

# Hoặc dùng npx
npx pm2 restart ctss
```

### Lỗi: "Database permission denied"
```bash
# Kiểm tra .env
cat .env | grep DATABASE_URL

# Nếu cần fix permissions (chạy với user postgres):
sudo -u postgres psql
GRANT ALL PRIVILEGES ON DATABASE ctss_db TO ctss_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ctss_user;
\q
```

### Lỗi: "Port 3000 already in use"
```bash
# Tìm process đang dùng port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Hoặc restart PM2
pm2 restart ctss
```

---

## 📝 Script tự động (copy/paste tất cả)

Nếu muốn chạy nhanh, copy tất cả các lệnh sau vào Web Terminal:

```bash
cd ~/ctss && \
git pull origin main && \
npm install --legacy-peer-deps && \
npx prisma db push --accept-data-loss && \
npx prisma generate && \
npm run build && \
pm2 restart ctss && \
pm2 logs ctss --lines 20
```

---

## ✅ Ưu điểm của Web Terminal

- ✅ Không cần SSH password
- ✅ Truy cập từ bất kỳ đâu (chỉ cần browser)
- ✅ Không cần cài SSH client
- ✅ Dễ dàng copy/paste lệnh

---

## 🔗 Link Web Terminal

Lưu link này để dùng sau:
https://kul.hostingervps.com/2471/?token=c26a7769db633e2b5d775fd32ee5c681fedb7c11c9168c33799be918095af1ca
