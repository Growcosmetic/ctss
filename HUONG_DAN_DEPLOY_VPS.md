# 🚀 Hướng dẫn Deploy CTSS lên VPS

## 📋 Checklist trước khi deploy

- [ ] VPS đã cài Node.js (v18+)
- [ ] VPS đã cài PostgreSQL
- [ ] VPS đã cài Git
- [ ] Đã clone repo về VPS
- [ ] Đã cấu hình `.env` trên VPS
- [ ] Database đã được tạo

---

## 🔧 Bước 1: SSH vào VPS

```bash
ssh root@your-vps-ip
# hoặc
ssh user@your-vps-ip
```

---

## 📥 Bước 2: Pull code mới nhất

```bash
cd /root/ctss
# hoặc cd /path/to/ctss

git pull origin main
```

---

## 📦 Bước 3: Cài đặt dependencies

```bash
npm install
```

**Lưu ý:** Nếu có vulnerabilities, có thể bỏ qua tạm thời:
```bash
npm install --legacy-peer-deps
```

---

## 🗄️ Bước 4: Setup Database

### Option A: Dùng `prisma db push` (Khuyến nghị - Nhanh)

```bash
# Push schema trực tiếp (không cần migrations)
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

### Option B: Dùng `prisma migrate deploy` (Cần permissions)

**Nếu gặp lỗi "permission denied":**

#### Bước 4.1: Grant permissions

```bash
# Kết nối PostgreSQL
psql -U postgres -d ctss_db

# Chạy các lệnh SQL (thay 'user' bằng user trong DATABASE_URL)
GRANT USAGE ON SCHEMA public TO "user";
GRANT CREATE ON SCHEMA public TO "user";
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "user";
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "user";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "user";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO "user";

# Thoát
\q
```

#### Bước 4.2: Chạy migrate

```bash
npx prisma migrate deploy
npx prisma generate
```

### Option C: Tạo migrations mới

```bash
# Tạo migration mới
npx prisma migrate dev --name init

# Hoặc
npx prisma migrate dev --name deploy
```

---

## 🏗️ Bước 5: Build

```bash
npm run build
```

**Lưu ý:** Nếu build fail, kiểm tra:
- Node.js version (cần v18+)
- Memory đủ (ít nhất 2GB RAM)
- Disk space đủ

---

## 🚀 Bước 6: Start Application

### Option A: Start trực tiếp (Development)

```bash
npm run start
```

### Option B: Dùng PM2 (Production - Khuyến nghị)

```bash
# Cài PM2 (nếu chưa có)
npm install -g pm2

# Start app với PM2
pm2 start npm --name "ctss" -- start

# Hoặc dùng ecosystem file
pm2 start ecosystem.config.js

# Lưu PM2 process list
pm2 save

# Setup PM2 startup
pm2 startup
```

### Option C: Dùng systemd (Production)

Tạo file `/etc/systemd/system/ctss.service`:

```ini
[Unit]
Description=CTSS Application
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/ctss
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Sau đó:

```bash
# Reload systemd
systemctl daemon-reload

# Start service
systemctl start ctss

# Enable auto-start
systemctl enable ctss

# Check status
systemctl status ctss
```

---

## 🔍 Bước 7: Kiểm tra

### Kiểm tra app chạy:

```bash
# Xem logs
pm2 logs ctss
# hoặc
journalctl -u ctss -f

# Kiểm tra port
netstat -tulpn | grep 3000
# hoặc
ss -tulpn | grep 3000
```

### Test API:

```bash
curl http://localhost:3000/api/health
# hoặc
curl http://localhost:3000/api/dashboard/stats
```

---

## 🌐 Bước 8: Setup Nginx (Nếu cần)

Tạo file `/etc/nginx/sites-available/ctss`:

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
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:

```bash
ln -s /etc/nginx/sites-available/ctss /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

---

## 🔄 Update Process (Khi có code mới)

```bash
# 1. SSH vào VPS
ssh root@your-vps-ip

# 2. Pull code
cd /root/ctss
git pull origin main

# 3. Install dependencies (nếu có thay đổi)
npm install

# 4. Update database (nếu có schema changes)
npx prisma db push
# hoặc
npx prisma migrate deploy

# 5. Generate Prisma Client
npx prisma generate

# 6. Rebuild
npm run build

# 7. Restart app
pm2 restart ctss
# hoặc
systemctl restart ctss
```

---

## 🐛 Troubleshooting

### Lỗi: "permission denied for schema public"

**Giải pháp:** Xem Bước 4 - Option A (dùng `db push`)

### Lỗi: "Port 3000 already in use"

```bash
# Tìm process đang dùng port 3000
lsof -i :3000
# hoặc
netstat -tulpn | grep 3000

# Kill process
kill -9 <PID>
```

### Lỗi: "Out of memory"

```bash
# Tăng swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Lỗi: Build fail

```bash
# Clear cache
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

---

## 📝 Environment Variables trên VPS

Đảm bảo file `.env` trên VPS có:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ctss_db?schema=public"

# Next.js
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# OpenAI (nếu dùng)
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4o-mini

# JWT Secret
JWT_SECRET=your-secret-key-here-change-in-production
```

---

## ✅ Checklist sau khi deploy

- [ ] App chạy được (check port 3000)
- [ ] Database kết nối được
- [ ] API endpoints hoạt động
- [ ] Frontend load được
- [ ] PM2/systemd auto-restart hoạt động
- [ ] Nginx (nếu có) proxy đúng
- [ ] SSL certificate (nếu có domain)

---

## 🎉 Hoàn tất!

Sau khi hoàn thành các bước trên, app sẽ chạy tại:
- **Local:** http://localhost:3000
- **Public:** http://your-vps-ip:3000
- **Domain:** https://your-domain.com (nếu setup Nginx + SSL)

---

*Last updated: 2024*

