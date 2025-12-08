# ✅ Checklist Deploy lên Hostinger

Đánh dấu từng bước khi hoàn thành để theo dõi tiến độ.

---

## 📋 BƯỚC 0: Chuẩn Bị Thông Tin (Làm TRƯỚC khi bắt đầu)

### Thông tin cần có:

- [ ] **VPS IP Address**: `_________________`
- [ ] **SSH Username**: `_________________` (thường là `root`)
- [ ] **SSH Password**: `_________________`
- [ ] **GitHub/GitLab Repo URL**: `_________________`
- [ ] **Database Host**: `_________________` (localhost hoặc IP từ Hostinger)
- [ ] **Database Name**: `_________________`
- [ ] **Database Username**: `_________________`
- [ ] **Database Password**: `_________________`
- [ ] **Database Port**: `_________________` (thường là 5432)
- [ ] **Domain Name** (nếu có): `_________________`

---

## 🚀 BƯỚC 1: Chuẩn Bị Code Local

- [ ] Code đã commit và push lên GitHub/GitLab
- [ ] Đã kiểm tra: `git status` (không có file chưa commit)
- [ ] Đã push: `git push origin main`

**Lệnh cần chạy:**
```bash
git status
git add .
git commit -m "Prepare for deployment"
git push origin main
```

---

## 🔌 BƯỚC 2: Kết Nối SSH vào VPS

- [ ] Đã SSH vào VPS thành công
- [ ] Đã kiểm tra: `whoami` (phải là root hoặc user có quyền)

**Lệnh cần chạy:**
```bash
ssh root@your-vps-ip
# Nhập password khi được yêu cầu
```

---

## ⚙️ BƯỚC 3: Cài Đặt Môi Trường

### 3.1. Cập nhật hệ thống
- [ ] Đã chạy: `apt update && apt upgrade -y`

### 3.2. Cài Node.js
- [ ] Đã cài Node.js
- [ ] Đã kiểm tra: `node -v` (phải >= 18.0.0)
- [ ] Đã kiểm tra: `npm -v`

**Lệnh cần chạy:**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
node -v
npm -v
```

### 3.3. Cài PM2
- [ ] Đã cài PM2
- [ ] Đã kiểm tra: `pm2 -v`

**Lệnh cần chạy:**
```bash
npm install -g pm2
pm2 -v
```

### 3.4. Cài Git (nếu chưa có)
- [ ] Đã cài Git
- [ ] Đã kiểm tra: `git --version`

**Lệnh cần chạy:**
```bash
apt install git -y
git --version
```

### 3.5. Setup PostgreSQL Database
- [ ] Đã quyết định: Dùng database từ Hostinger HOẶC tự cài
- [ ] Nếu tự cài: Đã cài PostgreSQL
- [ ] Đã tạo database: `ctss_db`
- [ ] Đã tạo user: `ctss_user`
- [ ] Đã test kết nối database

**Lệnh cần chạy (nếu tự cài):**
```bash
apt install postgresql postgresql-contrib -y
systemctl start postgresql
systemctl enable postgresql
sudo -u postgres psql
# Trong PostgreSQL shell:
# CREATE DATABASE ctss_db;
# CREATE USER ctss_user WITH PASSWORD 'your-password';
# GRANT ALL PRIVILEGES ON DATABASE ctss_db TO ctss_user;
# \q
```

---

## 📥 BƯỚC 4: Clone và Setup Project

### 4.1. Clone repository
- [ ] Đã tạo thư mục: `/root/projects` hoặc `/root/ctss`
- [ ] Đã clone repo thành công
- [ ] Đã vào thư mục project: `cd ctss`

**Lệnh cần chạy:**
```bash
mkdir -p /root/projects
cd /root/projects
git clone https://github.com/your-username/ctss.git
cd ctss
```

### 4.2. Tạo file .env
- [ ] Đã copy template: `cp env.hostinger.template .env`
- [ ] Đã mở file: `nano .env`
- [ ] Đã điền `DATABASE_URL` đúng
- [ ] Đã điền `NEXT_PUBLIC_APP_URL`
- [ ] Đã điền `JWT_SECRET` (chuỗi ngẫu nhiên)
- [ ] Đã điền `OPENAI_API_KEY` (nếu dùng)
- [ ] Đã lưu file: Ctrl+O, Enter, Ctrl+X

**Lệnh cần chạy:**
```bash
cp env.hostinger.template .env
nano .env
```

### 4.3. Cài dependencies
- [ ] Đã chạy: `npm install`
- [ ] Không có lỗi nghiêm trọng

**Lệnh cần chạy:**
```bash
npm install
# Nếu lỗi: npm install --legacy-peer-deps
```

---

## 🗄️ BƯỚC 5: Setup Database

- [ ] Đã chạy: `npx prisma generate`
- [ ] Đã chạy: `npx prisma db push --accept-data-loss`
- [ ] Không có lỗi database

**Lệnh cần chạy:**
```bash
npx prisma generate
npx prisma db push --accept-data-loss
```

---

## 🔨 BƯỚC 6: Build Application

- [ ] Đã chạy: `npm run build`
- [ ] Build thành công (thấy "✓ Compiled successfully")
- [ ] Không có lỗi build

**Lệnh cần chạy:**
```bash
npm run build
```

---

## 🚀 BƯỚC 7: Start với PM2

- [ ] Đã start: `pm2 start npm --name "ctss" -- start`
- [ ] Đã check: `pm2 status` (thấy ctss đang running)
- [ ] Đã lưu: `pm2 save`
- [ ] Đã setup auto-start: `pm2 startup` (và chạy lệnh PM2 hiển thị)

**Lệnh cần chạy:**
```bash
pm2 start npm --name "ctss" -- start
pm2 status
pm2 save
pm2 startup
# Chạy lệnh mà PM2 hiển thị
```

---

## ✅ BƯỚC 8: Kiểm Tra

- [ ] Đã test: `curl http://localhost:3000`
- [ ] App trả về response (không phải lỗi)
- [ ] Đã xem logs: `pm2 logs ctss` (không có lỗi nghiêm trọng)

**Lệnh cần chạy:**
```bash
curl http://localhost:3000
pm2 logs ctss
pm2 status
```

---

## 🌐 BƯỚC 9: Setup Nginx (Tùy chọn - Nếu có domain)

- [ ] Đã cài Nginx: `apt install nginx -y`
- [ ] Đã tạo config: `/etc/nginx/sites-available/ctss`
- [ ] Đã enable site: `ln -s ...`
- [ ] Đã test config: `nginx -t`
- [ ] Đã reload: `systemctl reload nginx`
- [ ] Đã setup SSL: `certbot --nginx -d your-domain.com`
- [ ] Domain đã trỏ về IP VPS
- [ ] Đã test: `curl https://your-domain.com`

---

## 🎉 HOÀN TẤT!

- [ ] App chạy được tại: `http://your-vps-ip:3000` hoặc `https://your-domain.com`
- [ ] Database kết nối được
- [ ] PM2 auto-start hoạt động
- [ ] Nginx proxy đúng (nếu có)
- [ ] SSL hoạt động (nếu có domain)

---

## 📝 Ghi Chú

- **Nếu gặp lỗi**: Xem phần Troubleshooting trong `HUONG_DAN_DEPLOY_HOSTINGER.md`
- **Để update code**: Chạy script `./deploy-hostinger.sh` hoặc làm thủ công theo Bước 4-7
- **Xem logs**: `pm2 logs ctss`
- **Restart app**: `pm2 restart ctss`
