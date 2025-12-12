# 🌐 Hướng dẫn đổi tên miền từ Cloudflare về VPS

## 📋 Tổng quan

Bạn sẽ cần:
1. **Cấu hình DNS trên Cloudflare** - Trỏ domain về IP VPS
2. **Cấu hình Nginx trên VPS** - Nhận traffic từ domain
3. **Setup SSL/HTTPS** - Bảo mật với Let's Encrypt

---

## 🔧 BƯỚC 1: Cấu hình DNS trên Cloudflare

### 1.1. Đăng nhập Cloudflare
- Truy cập: https://dash.cloudflare.com
- Chọn domain của bạn

### 1.2. Thêm DNS Records

Vào **DNS** → **Records**, thêm các records sau:

#### Option A: Chỉ dùng domain chính (ví dụ: `yourdomain.com`)

| Type | Name | Content | Proxy | TTL |
|------|------|---------|-------|-----|
| A | @ | `72.61.119.247` | 🟠 Proxied (ON) | Auto |
| A | www | `72.61.119.247` | 🟠 Proxied (ON) | Auto |

#### Option B: Dùng subdomain (ví dụ: `app.yourdomain.com`)

| Type | Name | Content | Proxy | TTL |
|------|------|---------|-------|-----|
| A | app | `72.61.119.247` | 🟠 Proxied (ON) | Auto |

**Lưu ý:**
- **Proxy ON (🟠)** = Cloudflare bảo vệ DDoS, cache
- **DNS only (🟦)** = Trỏ trực tiếp, không qua Cloudflare

### 1.3. Kiểm tra DNS đã trỏ đúng

Sau 5-10 phút, kiểm tra:
```bash
# Trên máy local
nslookup yourdomain.com
# hoặc
dig yourdomain.com

# Kết quả phải trả về: 72.61.119.247
```

---

## 🖥️ BƯỚC 2: Cấu hình Nginx trên VPS

### 2.1. SSH vào VPS

```bash
ssh root@72.61.119.247
```

### 2.2. Cài đặt Nginx (nếu chưa có)

```bash
apt update
apt install nginx -y
```

### 2.3. Tạo file cấu hình Nginx cho domain

```bash
nano /etc/nginx/sites-available/ctss
```

**Paste nội dung sau (thay `yourdomain.com` bằng domain của bạn):**

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

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

**Lưu ý:** Thay `yourdomain.com` bằng domain thực tế của bạn (ví dụ: `chitam.salonhero.vn`)

### 2.4. Kích hoạt cấu hình

```bash
# Tạo symbolic link
ln -s /etc/nginx/sites-available/ctss /etc/nginx/sites-enabled/

# Xóa default config (nếu có)
rm /etc/nginx/sites-enabled/default

# Test cấu hình
nginx -t

# Nếu OK, reload Nginx
systemctl reload nginx
```

### 2.5. Kiểm tra

```bash
# Kiểm tra Nginx đang chạy
systemctl status nginx

# Kiểm tra PM2 đang chạy
pm2 status

# Test từ VPS
curl http://localhost:3000/health
```

---

## 🔒 BƯỚC 3: Setup SSL/HTTPS với Let's Encrypt

### 3.1. Cài đặt Certbot

```bash
apt install certbot python3-certbot-nginx -y
```

### 3.2. Lấy SSL Certificate

**QUAN TRỌNG:** Trước khi chạy lệnh này, đảm bảo:
- ✅ DNS đã trỏ đúng về VPS (kiểm tra bằng `nslookup`)
- ✅ Nginx đã được cấu hình và chạy
- ✅ Port 80 và 443 đã mở trên firewall

```bash
# Lấy certificate (thay yourdomain.com)
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Hoặc nếu dùng subdomain
certbot --nginx -d app.yourdomain.com
```

**Certbot sẽ:**
- Tự động cấu hình Nginx cho HTTPS
- Tạo file cấu hình mới với SSL
- Tự động renew certificate

### 3.3. Kiểm tra auto-renewal

```bash
# Test auto-renewal
certbot renew --dry-run

# Nếu OK, certificate sẽ tự động renew mỗi 90 ngày
```

---

## ⚙️ BƯỚC 4: Cập nhật Environment Variables

### 4.1. Cập nhật `.env` trên VPS

```bash
cd ~/ctss
nano .env
```

**Cập nhật:**

```env
# Thay đổi từ IP sang domain
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Hoặc nếu dùng subdomain
NEXT_PUBLIC_APP_URL=https://app.yourdomain.com
```

### 4.2. Restart ứng dụng

```bash
pm2 restart ctss
pm2 save
```

---

## ✅ BƯỚC 5: Kiểm tra hoàn chỉnh

### 5.1. Kiểm tra từ trình duyệt

- ✅ Truy cập: `http://yourdomain.com` → Phải redirect sang HTTPS
- ✅ Truy cập: `https://yourdomain.com` → Phải hiển thị ứng dụng
- ✅ Kiểm tra SSL: Click vào 🔒 trên trình duyệt → Phải thấy "Connection is secure"

### 5.2. Kiểm tra từ terminal

```bash
# Test HTTP (phải redirect sang HTTPS)
curl -I http://yourdomain.com

# Test HTTPS
curl -I https://yourdomain.com

# Kiểm tra SSL
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
```

---

## 🔧 TROUBLESHOOTING

### ❌ Lỗi: "502 Bad Gateway"

**Nguyên nhân:** PM2 không chạy hoặc chạy sai port

**Giải pháp:**
```bash
# Kiểm tra PM2
pm2 status
pm2 logs ctss

# Nếu không chạy, restart
pm2 restart ctss

# Kiểm tra port 3000
lsof -i:3000
```

### ❌ Lỗi: "SSL certificate error"

**Nguyên nhân:** DNS chưa trỏ đúng hoặc chưa propagate

**Giải pháp:**
```bash
# Kiểm tra DNS
nslookup yourdomain.com

# Nếu chưa đúng, đợi 10-30 phút rồi thử lại
# Hoặc kiểm tra lại DNS trên Cloudflare
```

### ❌ Lỗi: "This site can't be reached"

**Nguyên nhân:** Firewall chưa mở port 80/443

**Giải pháp:**
```bash
# Kiểm tra firewall
ufw status

# Mở port nếu cần
ufw allow 80/tcp
ufw allow 443/tcp
ufw reload
```

### ❌ Lỗi: "Nginx: [emerg] bind() to 0.0.0.0:80 failed"

**Nguyên nhân:** Port 80 đã bị sử dụng

**Giải pháp:**
```bash
# Tìm process đang dùng port 80
lsof -i:80

# Kill process (thay PID)
kill -9 <PID>

# Restart Nginx
systemctl restart nginx
```

---

## 📝 TÓM TẮT CÁC LỆNH QUAN TRỌNG

```bash
# 1. Cấu hình Nginx
nano /etc/nginx/sites-available/ctss
ln -s /etc/nginx/sites-available/ctss /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# 2. Setup SSL
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 3. Cập nhật env và restart
cd ~/ctss
nano .env  # Cập nhật NEXT_PUBLIC_APP_URL
pm2 restart ctss

# 4. Kiểm tra
systemctl status nginx
pm2 status
curl https://yourdomain.com/health
```

---

## 🎯 KẾT QUẢ CUỐI CÙNG

Sau khi hoàn thành, bạn sẽ có:
- ✅ Domain trỏ về VPS: `https://yourdomain.com`
- ✅ SSL certificate tự động renew
- ✅ Ứng dụng chạy qua HTTPS
- ✅ Cloudflare bảo vệ DDoS (nếu dùng Proxy ON)

**Truy cập:**
- Inventory: `https://yourdomain.com/inventory`
- CRM: `https://yourdomain.com/crm`
- Dashboard: `https://yourdomain.com`

---

## 💡 LƯU Ý QUAN TRỌNG

1. **Cloudflare Proxy ON vs OFF:**
   - **Proxy ON (🟠)**: Cloudflare ẩn IP thật, bảo vệ DDoS, có cache
   - **Proxy OFF (🟦)**: Trỏ trực tiếp, IP thật hiển thị, không cache
   - **Khuyến nghị:** Dùng Proxy ON cho production

2. **SSL với Cloudflare:**
   - Nếu dùng Cloudflare Proxy ON, có thể dùng SSL của Cloudflare (Full SSL mode)
   - Hoặc dùng Let's Encrypt như hướng dẫn trên

3. **Environment Variables:**
   - Nhớ cập nhật `NEXT_PUBLIC_APP_URL` trong `.env`
   - Restart PM2 sau khi thay đổi

4. **Backup:**
   - Backup file cấu hình Nginx: `/etc/nginx/sites-available/ctss`
   - Backup `.env` file

---

**Chúc bạn thành công! 🚀**
