# ⚡ Quick Deploy lên Hostinger - Hướng Dẫn Nhanh

Hướng dẫn tóm tắt để deploy nhanh lên Hostinger VPS.

---

## 🎯 5 Bước Đơn Giản

### Bước 1: SSH vào VPS Hostinger

```bash
ssh root@your-vps-ip
```

### Bước 2: Cài đặt Node.js và PM2

```bash
# Cài Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Cài PM2
npm install -g pm2

# Kiểm tra
node -v  # Phải >= 18
```

### Bước 3: Clone và Setup Project

```bash
# Clone repo
cd /root
git clone https://github.com/your-username/ctss.git
cd ctss

# Tạo file .env
nano .env
# (Dán nội dung .env với DATABASE_URL từ Hostinger)

# Cài dependencies
npm install
```

### Bước 4: Setup Database và Build

```bash
# Generate Prisma Client
npx prisma generate

# Push schema
npx prisma db push --accept-data-loss

# Build
npm run build
```

### Bước 5: Start với PM2

```bash
# Start app
pm2 start npm --name "ctss" -- start

# Lưu và auto-start
pm2 save
pm2 startup
# (Chạy lệnh mà PM2 hiển thị)
```

---

## 🚀 Hoặc Dùng Script Tự Động

```bash
cd /root/ctss
chmod +x deploy-hostinger.sh
./deploy-hostinger.sh
```

Script sẽ tự động:
- ✅ Pull code (nếu có git)
- ✅ Install dependencies
- ✅ Setup database
- ✅ Build app
- ✅ Start với PM2

---

## 🌐 Setup Domain (Tùy chọn)

### 1. Cài Nginx

```bash
apt install nginx -y
```

### 2. Tạo config

```bash
nano /etc/nginx/sites-available/ctss
```

Dán:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Enable và reload

```bash
ln -s /etc/nginx/sites-available/ctss /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 4. Setup SSL

```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d your-domain.com
```

---

## 🔄 Update Code

```bash
cd /root/ctss
git pull
npm install
npx prisma db push
npx prisma generate
npm run build
pm2 restart ctss
```

---

## ✅ Kiểm Tra

```bash
# Check PM2
pm2 status
pm2 logs ctss

# Test app
curl http://localhost:3000
```

---

## 🐛 Lỗi Thường Gặp

### Database connection failed
→ Kiểm tra `DATABASE_URL` trong `.env`

### Port 3000 already in use
→ `pm2 stop ctss` hoặc `pkill -f "next start"`

### Build failed
→ `rm -rf .next node_modules && npm install && npm run build`

---

**Xem chi tiết:** `HUONG_DAN_DEPLOY_HOSTINGER.md`
