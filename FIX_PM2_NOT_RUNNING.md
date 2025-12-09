# 🔧 Fix: PM2 không chạy app

## Vấn đề:
`pm2 status` không hiển thị gì → PM2 không chạy app thành công.

## Giải pháp từng bước:

### BƯỚC 1: Kiểm tra file ecosystem.config.js có đúng không

```bash
cd ~/ctss
cat ecosystem.config.js
```

Phải thấy:
```javascript
script: 'node_modules/next/dist/bin/next',
args: 'start',
```

### BƯỚC 2: Kiểm tra app có build chưa

```bash
ls -la .next
```

Phải thấy thư mục `.next` tồn tại.

Nếu không có, chạy:
```bash
npm run build
```

### BƯỚC 3: Test chạy app trực tiếp (không qua PM2)

```bash
npm start
```

Nếu chạy được (thấy "Ready on http://localhost:3000"), nhấn `Ctrl+C` để dừng.

### BƯỚC 4: Chạy PM2 với lệnh đầy đủ

```bash
cd ~/ctss

# Stop và xóa tất cả
pm2 stop all
pm2 delete all

# Khởi động lại với đường dẫn đầy đủ
pm2 start ecosystem.config.js --cwd /root/ctss

# Hoặc thử cách khác:
pm2 start npm --name "ctss" -- start

# Kiểm tra
pm2 status
pm2 logs ctss --lines 30
```

### BƯỚC 5: Nếu vẫn không được, thử cách này

```bash
cd ~/ctss

# Tạo file start script
cat > start.sh << 'EOF'
#!/bin/bash
cd /root/ctss
npm start
EOF

chmod +x start.sh

# Chạy với PM2
pm2 start start.sh --name "ctss"
pm2 save
pm2 status
```

### BƯỚC 6: Kiểm tra logs chi tiết

```bash
pm2 logs ctss --lines 50
pm2 describe ctss
```

---

## Cách khác: Chạy trực tiếp với PM2

```bash
cd ~/ctss
pm2 start "npm start" --name "ctss"
pm2 save
pm2 status
```

---

## Kiểm tra lại:

```bash
# PM2 status
pm2 status

# Test app
curl http://localhost:3000

# Test qua Nginx
curl http://localhost
```

