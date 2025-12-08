# 🚀 Hướng Dẫn Deploy CTSS lên Hostinger

Hướng dẫn từng bước để deploy dự án Next.js lên Hostinger VPS/Cloud.

---

## 📋 Yêu Cầu Trước Khi Bắt Đầu

### 1. Thông Tin Cần Có:
- ✅ IP VPS Hostinger hoặc domain
- ✅ Username và password SSH
- ✅ Database PostgreSQL (từ Hostinger hoặc external)
- ✅ Domain name (nếu có)

### 2. Kiểm Tra Hostinger Plan:
- **VPS Hosting**: ✅ Phù hợp (có quyền root, cài Node.js)
- **Cloud Hosting**: ✅ Phù hợp (có Node.js support)
- **Shared Hosting**: ❌ Không phù hợp (không chạy được Next.js)

---

## 🎯 Phương Án 1: Deploy lên Hostinger VPS (Khuyến nghị)

### Bước 1: Chuẩn Bị Máy Tính Local

#### 1.1. Đảm bảo code đã push lên GitHub/GitLab

```bash
# Kiểm tra git status
git status

# Nếu chưa commit, commit code
git add .
git commit -m "Prepare for deployment"

# Push lên remote
git push origin main
```

#### 1.2. Chuẩn bị file .env

Tạo file `.env` với nội dung:

```env
# Database (sẽ cập nhật sau khi setup DB trên Hostinger)
DATABASE_URL="postgresql://user:password@host:5432/ctss_db?schema=public"

# Next.js
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# JWT Secret (tạo một chuỗi ngẫu nhiên)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# OpenAI (nếu dùng)
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4o-mini
```

---

### Bước 2: Kết Nối SSH vào Hostinger VPS

#### 2.1. Tìm thông tin SSH trong Hostinger Panel

1. Đăng nhập vào **hPanel** của Hostinger
2. Vào **VPS** → Chọn VPS của bạn
3. Xem thông tin:
   - **IP Address**: `xxx.xxx.xxx.xxx`
   - **SSH Username**: Thường là `root`
   - **SSH Password**: Password bạn đã set

#### 2.2. Kết nối SSH

**Trên Windows (dùng PowerShell hoặc PuTTY):**
```bash
ssh root@your-vps-ip
```

**Trên Mac/Linux:**
```bash
ssh root@your-vps-ip
```

Nhập password khi được yêu cầu.

---

### Bước 3: Cài Đặt Môi Trường trên VPS

#### 3.1. Cập nhật hệ thống

```bash
# Ubuntu/Debian
apt update && apt upgrade -y

# CentOS/RHEL
yum update -y
```

#### 3.2. Cài đặt Node.js (v18 hoặc cao hơn)

```bash
# Cài Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Kiểm tra version
node -v  # Phải >= 18.0.0
npm -v
```

#### 3.3. Cài đặt PostgreSQL (nếu chưa có)

```bash
# Cài PostgreSQL
apt install postgresql postgresql-contrib -y

# Start PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Tạo database và user
sudo -u postgres psql

# Trong PostgreSQL shell:
CREATE DATABASE ctss_db;
CREATE USER ctss_user WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE ctss_db TO ctss_user;
\q
```

**Lưu ý:** Nếu Hostinger đã cung cấp PostgreSQL database, bỏ qua bước này và dùng thông tin từ hPanel.

#### 3.4. Cài đặt PM2 (Process Manager)

```bash
npm install -g pm2
```

#### 3.5. Cài đặt Git (nếu chưa có)

```bash
apt install git -y
```

---

### Bước 4: Clone và Setup Dự Án

#### 4.1. Clone repository

```bash
# Tạo thư mục cho dự án
mkdir -p /root/projects
cd /root/projects

# Clone repo (thay YOUR_REPO_URL bằng URL GitHub/GitLab của bạn)
git clone https://github.com/your-username/ctss.git
cd ctss
```

**Nếu repo là private**, bạn cần setup SSH key hoặc dùng Personal Access Token.

#### 4.2. Tạo file .env

```bash
# Tạo file .env
nano .env
```

Dán nội dung `.env` đã chuẩn bị ở Bước 1.2, **nhớ cập nhật DATABASE_URL** với thông tin database thực tế.

Lưu file: `Ctrl + O`, Enter, `Ctrl + X`

#### 4.3. Cài đặt dependencies

```bash
npm install
```

Nếu gặp lỗi peer dependencies:
```bash
npm install --legacy-peer-deps
```

---

### Bước 5: Setup Database

#### 5.1. Push schema vào database

```bash
# Generate Prisma Client
npx prisma generate

# Push schema (khuyến nghị cho lần đầu)
npx prisma db push --accept-data-loss
```

**Nếu gặp lỗi permission**, thử:

```bash
# Option 1: Dùng migrate deploy
npx prisma migrate deploy

# Option 2: Nếu vẫn lỗi, kiểm tra DATABASE_URL trong .env
```

#### 5.2. Kiểm tra database

```bash
# Xem tables đã tạo chưa
npx prisma studio
# (Sẽ mở browser, nhưng trên VPS không có GUI, bỏ qua)
```

---

### Bước 6: Build và Start Application

#### 6.1. Build production

```bash
npm run build
```

Nếu build thành công, bạn sẽ thấy:
```
✓ Compiled successfully
```

#### 6.2. Start với PM2

```bash
# Start app với PM2
pm2 start npm --name "ctss" -- start

# Hoặc dùng ecosystem file (tốt hơn)
pm2 start ecosystem.config.js

# Lưu PM2 process list
pm2 save

# Setup PM2 auto-start khi reboot
pm2 startup
# (Chạy lệnh mà PM2 hiển thị, ví dụ: sudo env PATH=... pm2 startup systemd -u root --hp /root)
```

#### 6.3. Kiểm tra app đang chạy

```bash
# Xem status
pm2 status

# Xem logs
pm2 logs ctss

# Kiểm tra port 3000
netstat -tulpn | grep 3000
```

---

### Bước 7: Setup Nginx (Reverse Proxy)

#### 7.1. Cài đặt Nginx

```bash
apt install nginx -y
systemctl start nginx
systemctl enable nginx
```

#### 7.2. Tạo Nginx config

```bash
nano /etc/nginx/sites-available/ctss
```

Dán nội dung sau (thay `your-domain.com` bằng domain của bạn):

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Logs
    access_log /var/log/nginx/ctss-access.log;
    error_log /var/log/nginx/ctss-error.log;

    # Proxy to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

Lưu file: `Ctrl + O`, Enter, `Ctrl + X`

#### 7.3. Enable site

```bash
# Tạo symlink
ln -s /etc/nginx/sites-available/ctss /etc/nginx/sites-enabled/

# Xóa default site (tùy chọn)
rm /etc/nginx/sites-enabled/default

# Test config
nginx -t

# Reload Nginx
systemctl reload nginx
```

#### 7.4. Setup SSL với Let's Encrypt (Khuyến nghị)

```bash
# Cài Certbot
apt install certbot python3-certbot-nginx -y

# Lấy SSL certificate
certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
certbot renew --dry-run
```

Sau khi setup SSL, Nginx sẽ tự động redirect HTTP → HTTPS.

---

### Bước 8: Mở Firewall (Nếu cần)

```bash
# Kiểm tra firewall
ufw status

# Mở port 80, 443, 22
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw enable
```

---

## 🎯 Phương Án 2: Deploy lên Hostinger Cloud Hosting

Nếu bạn dùng **Cloud Hosting** (không phải VPS), Hostinger có thể đã cung cấp:

1. **Node.js** đã được cài sẵn
2. **Database** PostgreSQL trong hPanel
3. **File Manager** hoặc **SSH** để upload code

### Các bước:

#### 1. Upload code qua File Manager hoặc Git

```bash
# Nếu có SSH access
cd ~/domains/your-domain.com/public_html
git clone https://github.com/your-username/ctss.git
cd ctss
```

#### 2. Setup .env với database từ hPanel

Lấy thông tin database từ **hPanel → Databases**:
- Host: `localhost` hoặc IP được cung cấp
- Database name: `u123456789_ctss`
- Username: `u123456789_user`
- Password: Password bạn đã set

```env
DATABASE_URL="postgresql://u123456789_user:password@localhost:5432/u123456789_ctss?schema=public"
```

#### 3. Build và start

```bash
npm install
npx prisma generate
npx prisma db push
npm run build
npm run start
```

#### 4. Setup PM2 (nếu có quyền)

```bash
npm install -g pm2
pm2 start npm --name "ctss" -- start
pm2 save
```

---

## 🔄 Update Code (Khi có thay đổi)

### Script tự động update:

Tạo file `update.sh`:

```bash
#!/bin/bash
cd /root/projects/ctss
git pull origin main
npm install
npx prisma db push
npx prisma generate
npm run build
pm2 restart ctss
echo "✅ Update completed!"
```

Chạy:
```bash
chmod +x update.sh
./update.sh
```

---

## 🐛 Troubleshooting

### Lỗi: "Cannot connect to database"

**Kiểm tra:**
1. Database đã được tạo chưa?
2. `DATABASE_URL` trong `.env` đúng chưa?
3. Firewall có chặn port 5432 không?

**Fix:**
```bash
# Test kết nối database
psql -h localhost -U ctss_user -d ctss_db
```

### Lỗi: "Port 3000 already in use"

**Fix:**
```bash
# Tìm process đang dùng port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Hoặc restart PM2
pm2 restart ctss
```

### Lỗi: "Out of memory" khi build

**Fix:**
```bash
# Tăng swap
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile

# Thêm vào /etc/fstab để tự động mount
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

### Lỗi: "Permission denied"

**Fix:**
```bash
# Cấp quyền cho thư mục
chmod -R 755 /root/projects/ctss
chown -R root:root /root/projects/ctss
```

### App không chạy sau khi reboot

**Fix:**
```bash
# Đảm bảo PM2 startup đã setup
pm2 startup
# Chạy lệnh mà PM2 hiển thị

# Kiểm tra
pm2 save
```

---

## ✅ Checklist Sau Khi Deploy

- [ ] Node.js đã cài (version >= 18)
- [ ] PostgreSQL đã setup và kết nối được
- [ ] Code đã clone về VPS
- [ ] File `.env` đã tạo và cấu hình đúng
- [ ] `npm install` thành công
- [ ] `npx prisma db push` thành công
- [ ] `npm run build` thành công
- [ ] PM2 đã start app
- [ ] App chạy được tại `http://localhost:3000`
- [ ] Nginx đã config và proxy đúng
- [ ] Domain đã trỏ về IP VPS
- [ ] SSL certificate đã setup (nếu có domain)
- [ ] Firewall đã mở port cần thiết
- [ ] PM2 auto-start đã setup

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề:

1. **Xem logs:**
   ```bash
   pm2 logs ctss
   # hoặc
   tail -f /var/log/nginx/ctss-error.log
   ```

2. **Kiểm tra status:**
   ```bash
   pm2 status
   systemctl status nginx
   systemctl status postgresql
   ```

3. **Test API:**
   ```bash
   curl http://localhost:3000/api/health
   ```

---

## 🎉 Hoàn Tất!

Sau khi hoàn thành, app sẽ chạy tại:
- **Local:** http://localhost:3000
- **Public IP:** http://your-vps-ip:3000
- **Domain:** https://your-domain.com (nếu setup Nginx + SSL)

**Chúc bạn deploy thành công! 🚀**
