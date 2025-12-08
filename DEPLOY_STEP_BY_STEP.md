# 🚀 Deploy CTSS lên VPS - Từng Bước Chi Tiết

## 📋 Chuẩn bị

Trước khi bắt đầu, đảm bảo bạn đã:
- [ ] SSH vào VPS thành công
- [ ] Đã clone repo về VPS (hoặc đã có thư mục `/root/ctss`)
- [ ] Có quyền root hoặc sudo

---

## 🔧 BƯỚC 1: SSH vào VPS

```bash
ssh root@your-vps-ip
# hoặc
ssh user@your-vps-ip
```

**Kiểm tra:**
```bash
pwd
# Phải ở trong thư mục /root/ctss hoặc /path/to/ctss
```

---

## 📥 BƯỚC 2: Fix Git Configuration

### 2.1. Kiểm tra git status
```bash
cd /root/ctss
git status
```

### 2.2. Nếu có lỗi "divergent branches":
```bash
# Set merge strategy
git config pull.rebase false

# Hoặc nếu muốn force pull (overwrite local changes)
git fetch origin
git reset --hard origin/main
```

### 2.3. Pull code mới nhất
```bash
git pull origin main
```

**Kiểm tra:**
```bash
git log --oneline -3
# Phải thấy commit mới nhất
```

---

## 📦 BƯỚC 3: Install Dependencies

### 3.1. Kiểm tra Node.js version
```bash
node -v
# Phải >= 18.0.0
```

Nếu chưa có Node.js:
```bash
# Cài Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs
```

### 3.2. Install dependencies
```bash
cd /root/ctss
npm install
```

**Nếu có lỗi vulnerabilities:**
```bash
npm install --legacy-peer-deps
```

**Kiểm tra:**
```bash
ls node_modules | head -5
# Phải thấy các thư mục packages
```

---

## 🗄️ BƯỚC 4: Setup Database

### 4.1. Kiểm tra Prisma schema
```bash
ls -la prisma/schema.prisma
# File phải tồn tại
```

### 4.2. Kiểm tra DATABASE_URL trong .env
```bash
cat .env | grep DATABASE_URL
# Phải có dòng: DATABASE_URL="postgresql://..."
```

Nếu chưa có file `.env`:
```bash
cp .env.example .env
nano .env
# Sửa DATABASE_URL
```

### 4.3. Generate Prisma Client (QUAN TRỌNG!)
```bash
npx prisma generate
```

**Kiểm tra:**
```bash
ls node_modules/.prisma/client
# Phải có thư mục này
```

### 4.4. Push schema vào database
```bash
# Option 1: Dùng db push (nhanh, không cần migrations)
npx prisma db push

# Option 2: Dùng migrate deploy (nếu có migrations)
# npx prisma migrate deploy
```

**Nếu lỗi permission:**
```bash
# Xem hướng dẫn trong QUICK_FIX_DATABASE.md
# Hoặc grant permissions:
psql -U postgres -d ctss_db
# Trong psql:
GRANT USAGE ON SCHEMA public TO "user";
GRANT CREATE ON SCHEMA public TO "user";
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "user";
\q
```

---

## 🏗️ BƯỚC 5: Build Application

### 5.1. Build
```bash
npm run build
```

**Nếu có lỗi TypeScript:**
```bash
# Option 1: Fix lỗi (khuyến nghị)
# Xem lỗi và sửa

# Option 2: Tạm thời ignore (không khuyến nghị)
# Sửa next.config.mjs:
# typescript: { ignoreBuildErrors: true }
```

**Kiểm tra:**
```bash
ls -la .next
# Phải có thư mục .next với các file build
```

---

## 🚀 BƯỚC 6: Setup PM2

### 6.1. Cài PM2 (nếu chưa có)
```bash
npm install -g pm2
```

**Kiểm tra:**
```bash
pm2 --version
# Phải hiển thị version
```

### 6.2. Stop app cũ (nếu có)
```bash
pm2 stop ctss
pm2 delete ctss
```

### 6.3. Start app mới
```bash
cd /root/ctss
pm2 start npm --name "ctss" -- start
```

### 6.4. Lưu PM2 process list
```bash
pm2 save
```

### 6.5. Setup PM2 auto-start khi reboot
```bash
pm2 startup
# Copy và chạy lệnh mà PM2 hiển thị
```

**Kiểm tra:**
```bash
pm2 status
# Phải thấy ctss với status "online"
pm2 logs ctss --lines 50
# Xem logs để đảm bảo app chạy OK
```

---

## ✅ BƯỚC 7: Kiểm tra

### 7.1. Kiểm tra app chạy
```bash
# Check port 3000
netstat -tulpn | grep 3000
# hoặc
ss -tulpn | grep 3000
```

### 7.2. Test API
```bash
curl http://localhost:3000/api/health
# hoặc
curl http://localhost:3000/api/dashboard/stats
```

### 7.3. Kiểm tra PM2
```bash
pm2 status
pm2 logs ctss --lines 20
```

---

## 🔄 BƯỚC 8: Update (Khi có code mới)

Khi có code mới trên GitHub:

```bash
# 1. Pull code
cd /root/ctss
git pull origin main

# 2. Install dependencies (nếu có thay đổi)
npm install

# 3. Generate Prisma Client (nếu có schema changes)
npx prisma generate
npx prisma db push  # hoặc migrate deploy

# 4. Rebuild
npm run build

# 5. Restart app
pm2 restart ctss

# 6. Kiểm tra
pm2 logs ctss --lines 20
```

---

## 🐛 Troubleshooting

### Lỗi: "Port 3000 already in use"
```bash
# Tìm process đang dùng port 3000
lsof -i :3000
# Kill process
kill -9 <PID>
# Hoặc
pm2 stop ctss
```

### Lỗi: "Out of memory"
```bash
# Tăng swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Lỗi: "Database connection failed"
```bash
# Kiểm tra PostgreSQL đang chạy
systemctl status postgresql

# Kiểm tra DATABASE_URL trong .env
cat .env | grep DATABASE_URL

# Test connection
psql $DATABASE_URL
```

### Lỗi: "Prisma Client not generated"
```bash
# Xóa và generate lại
rm -rf node_modules/.prisma
npx prisma generate
```

---

## 📝 Checklist Hoàn Thành

- [ ] Git pull thành công
- [ ] npm install hoàn tất
- [ ] Prisma schema tồn tại
- [ ] `npx prisma generate` thành công
- [ ] `npx prisma db push` thành công
- [ ] `npm run build` thành công
- [ ] PM2 đã cài và start app
- [ ] PM2 auto-start đã setup
- [ ] App chạy được (port 3000)
- [ ] API test thành công
- [ ] PM2 logs không có lỗi

---

## 🎉 Hoàn tất!

Sau khi hoàn thành tất cả các bước, app sẽ chạy tại:
- **Local:** http://localhost:3000
- **Public:** http://your-vps-ip:3000

**Lưu ý:** Nếu muốn dùng domain, cần setup Nginx reverse proxy (xem `HUONG_DAN_DEPLOY_VPS.md`).

---

*Last updated: 2024*
