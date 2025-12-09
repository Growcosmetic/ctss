# 🔍 Debug Nginx - Tìm nguyên nhân

## Chạy các lệnh sau để kiểm tra:

### 1. Kiểm tra PM2 có chạy không:

```bash
pm2 status
pm2 list
```

**Kết quả mong đợi:** Phải thấy `ctss` với status `online`

### 2. Kiểm tra app có đang listen trên port 3000:

```bash
netstat -tulpn | grep 3000
```

Hoặc:

```bash
lsof -i :3000
```

**Kết quả mong đợi:** Phải thấy process đang listen trên port 3000

### 3. Test app trực tiếp:

```bash
curl http://localhost:3000
```

**Kết quả mong đợi:** Phải thấy HTML response (không phải lỗi)

### 4. Kiểm tra cấu hình Nginx:

```bash
cat /etc/nginx/sites-available/ctss
```

**Kết quả mong đợi:** Phải có dòng `proxy_pass http://localhost:3000;`

### 5. Kiểm tra file đã được enable:

```bash
ls -la /etc/nginx/sites-enabled/
cat /etc/nginx/sites-enabled/ctss
```

**Kết quả mong đợi:** Phải thấy file `ctss` và nội dung có `proxy_pass http://localhost:3000;`

### 6. Kiểm tra có file default nào đang conflict:

```bash
ls -la /etc/nginx/sites-enabled/
```

**Kết quả mong đợi:** Chỉ nên có file `ctss`, không có file `default`

### 7. Kiểm tra logs Nginx:

```bash
tail -20 /var/log/nginx/error.log
tail -20 /var/log/nginx/access.log
```

### 8. Kiểm tra logs PM2:

```bash
pm2 logs ctss --lines 50
```

---

## Nếu PM2 không chạy:

```bash
cd ~/ctss
pm2 stop all
pm2 delete all

# Kill tất cả process trên port 3000
fuser -k 3000/tcp 2>/dev/null || pkill -f "next start" || true

# Khởi động lại
pm2 start ecosystem.config.js
pm2 save

# Xem logs
pm2 logs ctss --lines 30
```

---

## Nếu cấu hình Nginx sai:

```bash
# Xóa cấu hình cũ
rm -f /etc/nginx/sites-enabled/ctss
rm -f /etc/nginx/sites-enabled/default

# Copy lại file cấu hình
cd ~/ctss
cp nginx-ctss.conf /etc/nginx/sites-available/ctss

# Enable lại
ln -s /etc/nginx/sites-available/ctss /etc/nginx/sites-enabled/ctss

# Test
nginx -t

# Restart
systemctl restart nginx
```

---

## Kiểm tra lại:

```bash
# Test từ server
curl http://localhost

# Hoặc từ browser
http://72.61.119.247
```

