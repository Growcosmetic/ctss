# 🔧 Fix: Nginx hiển thị trang mặc định thay vì CTSS

## Vấn đề:
Bạn thấy trang "Welcome to nginx!" thay vì ứng dụng CTSS.

## Nguyên nhân:
1. PM2 chưa chạy app trên port 3000
2. Hoặc cấu hình Nginx chưa được load đúng

## Giải pháp:

### BƯỚC 1: Kiểm tra PM2

```bash
pm2 status
```

Nếu không thấy `ctss` hoặc status không phải `online`, chạy:

```bash
cd ~/ctss
pm2 stop all
pm2 delete all
pm2 start ecosystem.config.js
pm2 save
pm2 logs ctss --lines 20
```

### BƯỚC 2: Kiểm tra app có đang chạy trên port 3000

```bash
curl http://localhost:3000
```

Nếu không có response hoặc báo lỗi, app chưa chạy.

### BƯỚC 3: Kiểm tra cấu hình Nginx

```bash
# Xem cấu hình hiện tại
cat /etc/nginx/sites-available/ctss

# Kiểm tra có được enable chưa
ls -la /etc/nginx/sites-enabled/

# Test cấu hình
nginx -t
```

### BƯỚC 4: Đảm bảo cấu hình đúng

```bash
# Xem lại file cấu hình
cat /etc/nginx/sites-available/ctss
```

Phải có dòng:
```nginx
proxy_pass http://localhost:3000;
```

### BƯỚC 5: Restart lại Nginx

```bash
systemctl restart nginx
systemctl status nginx
```

### BƯỚC 6: Kiểm tra lại

```bash
# Test từ server
curl http://localhost

# Hoặc từ browser
http://72.61.119.247
```

---

## Nếu vẫn không được:

### Kiểm tra logs:

```bash
# Logs Nginx
tail -f /var/log/nginx/error.log

# Logs PM2
pm2 logs ctss
```

### Kiểm tra port 3000:

```bash
netstat -tulpn | grep 3000
```

Nếu không thấy process nào đang listen trên port 3000, PM2 chưa chạy app.

