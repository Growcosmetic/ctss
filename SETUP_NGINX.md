# 🌐 Hướng dẫn Setup Nginx cho CTSS

## ⚠️ QUAN TRỌNG: Fix lỗi PM2 trước!

Trước khi setup Nginx, bạn cần fix lỗi port conflict:

```bash
# 1. Stop và xóa tất cả processes
pm2 stop all
pm2 delete all

# 2. Kill các process đang dùng port 3000
pkill -f "next start"
lsof -ti:3000 | xargs kill -9

# 3. Pull code mới
cd ~/ctss
git pull origin main

# 4. Khởi động lại PM2
pm2 start ecosystem.config.js
pm2 save

# 5. Kiểm tra
pm2 status
pm2 logs ctss
```

Nếu thấy `online` và không có lỗi, tiếp tục bước sau.

---

## BƯỚC 1: Cài đặt Nginx

```bash
apt update
apt install nginx -y
```

## BƯỚC 2: Tạo cấu hình Nginx

```bash
# Copy file cấu hình từ repo
cd ~/ctss
cp nginx-ctss.conf /etc/nginx/sites-available/ctss

# Hoặc tạo file mới
nano /etc/nginx/sites-available/ctss
```

Dán nội dung sau vào file:

```nginx
server {
    listen 80;
    server_name _;

    # Increase body size limit for file uploads
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

Lưu file: `Ctrl+O` → `Enter` → `Ctrl+X`

## BƯỚC 3: Kích hoạt cấu hình

```bash
# Tạo symbolic link
ln -s /etc/nginx/sites-available/ctss /etc/nginx/sites-enabled/

# Xóa cấu hình mặc định (nếu có)
rm -f /etc/nginx/sites-enabled/default

# Kiểm tra cấu hình có lỗi không
nginx -t

# Nếu thấy "successful", khởi động lại Nginx
systemctl restart nginx

# Kiểm tra trạng thái
systemctl status nginx
```

## BƯỚC 4: Mở firewall

```bash
# Mở port 80 (HTTP)
ufw allow 80/tcp

# Mở port 443 (HTTPS - cho sau này)
ufw allow 443/tcp

# Reload firewall
ufw reload
```

## BƯỚC 5: Kiểm tra

```bash
# Test từ server
curl http://localhost

# Hoặc từ browser
http://YOUR_VPS_IP
```

---

## 🔧 Troubleshooting

### Nếu Nginx không khởi động được:

```bash
# Xem logs
tail -f /var/log/nginx/error.log

# Kiểm tra cấu hình
nginx -t
```

### Nếu truy cập được nhưng báo 502 Bad Gateway:

1. **Kiểm tra PM2 đang chạy:**
   ```bash
   pm2 status
   ```

2. **Kiểm tra app có listen trên port 3000:**
   ```bash
   netstat -tulpn | grep 3000
   ```

3. **Kiểm tra logs PM2:**
   ```bash
   pm2 logs ctss
   ```

### Nếu cần restart lại:

```bash
# Restart PM2
pm2 restart ctss

# Restart Nginx
systemctl restart nginx
```

---

## 🎉 Hoàn thành!

Sau khi hoàn thành, bạn có thể truy cập:
- **HTTP:** `http://YOUR_VPS_IP`
- **Không cần port 3000 nữa!**

