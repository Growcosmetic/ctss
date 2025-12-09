# 🔧 Fix Hoàn Chỉnh - PM2 và Nginx

## Vấn đề:
Terminal không có output → PM2 không chạy được app.

## Giải pháp từng bước:

### BƯỚC 1: Chạy script kiểm tra

```bash
cd ~/ctss
git pull origin main
chmod +x check-all.sh
./check-all.sh
```

Gửi kết quả cho tôi.

---

### BƯỚC 2: Fix từ đầu (nếu cần)

```bash
cd ~/ctss

# 1. Đảm bảo đã build
npm run build

# 2. Stop tất cả
pm2 stop all
pm2 delete all
pkill -f "next"
pkill -f "npm"
fuser -k 3000/tcp 2>/dev/null || true

# 3. Test chạy app trực tiếp (không qua PM2)
npm start
```

**Nếu `npm start` chạy được** (thấy "Ready on http://localhost:3000"), nhấn `Ctrl+C` để dừng, rồi tiếp tục.

**Nếu `npm start` không chạy được**, gửi lỗi cho tôi.

---

### BƯỚC 3: Chạy PM2 với cách đơn giản nhất

```bash
cd ~/ctss

# Cách 1: Dùng npm start trực tiếp
pm2 start npm --name "ctss" -- start

# Kiểm tra
pm2 status
pm2 logs ctss --lines 30
```

---

### BƯỚC 4: Nếu vẫn không được, thử cách này

```bash
cd ~/ctss

# Tạo file start đơn giản
cat > start-app.sh << 'EOF'
#!/bin/bash
cd /root/ctss
export NODE_ENV=production
export PORT=3000
npm start
EOF

chmod +x start-app.sh

# Chạy với PM2
pm2 start start-app.sh --name "ctss"
pm2 save
pm2 status
pm2 logs ctss --lines 50
```

---

### BƯỚC 5: Kiểm tra lại

```bash
# PM2 status
pm2 status

# Test app
curl http://localhost:3000

# Test Nginx
curl http://localhost

# Xem logs
pm2 logs ctss --lines 50
```

---

## Nếu vẫn không được:

Gửi cho tôi:
1. Kết quả của `./check-all.sh`
2. Kết quả của `npm start` (có chạy được không?)
3. Kết quả của `pm2 logs ctss --lines 50`
4. Kết quả của `cat ecosystem.config.js`

Sau khi có thông tin này, tôi sẽ fix chính xác.

