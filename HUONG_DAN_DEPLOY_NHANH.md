# 🚀 Hướng Dẫn Deploy CTSS lên Hostinger - Bản Rút Gọn

## ✅ Bước 1: Chuẩn bị trên máy tính của bạn

### 1.1. Kiểm tra build thành công
```bash
npm run build
```
Nếu build thành công (không có lỗi) → Tiếp tục

### 1.2. Commit và push code lên GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

---

## ✅ Bước 2: Kết nối vào VPS Hostinger

### 2.1. Lấy thông tin SSH từ Hostinger
- Vào **hPanel** → **VPS** → Xem thông tin:
  - IP Address: `xxx.xxx.xxx.xxx`
  - SSH Username: `root` (hoặc username khác)
  - SSH Password: (password bạn đã set)

### 2.2. Kết nối SSH
```bash
ssh root@your-vps-ip
```
Nhập password khi được yêu cầu.

---

## ✅ Bước 3: Cài đặt môi trường trên VPS

### 3.1. Cài Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
node -v  # Kiểm tra phải >= 18
```

### 3.2. Cài PM2 (quản lý process)
```bash
npm install -g pm2
```

### 3.3. Cài Git (nếu chưa có)
```bash
apt install git -y
```

---

## ✅ Bước 4: Clone code và setup

### 4.1. Clone repository
```bash
cd /root
git clone https://github.com/your-username/ctss.git
cd ctss
```

### 4.2. Tạo file .env
```bash
nano .env
```

Dán nội dung sau (nhớ thay thông tin database thực tế):
```env
# Database (lấy từ Hostinger hPanel → Databases)
DATABASE_URL="postgresql://username:password@host:5432/database_name?schema=public"

# Next.js
NODE_ENV=production
NEXT_PUBLIC_APP_URL=http://your-vps-ip:3000

# JWT Secret (tạo chuỗi ngẫu nhiên)
JWT_SECRET=your-super-secret-key-change-this

# OpenAI (nếu dùng)
OPENAI_API_KEY=sk-proj-...
```

Lưu: `Ctrl + O`, Enter, `Ctrl + X`

### 4.3. Cài dependencies
```bash
npm install
```

---

## ✅ Bước 5: Setup Database

### 5.1. Tạo database trên Hostinger
- Vào **hPanel** → **Databases** → **PostgreSQL**
- Tạo database mới
- Lưu lại: host, database name, username, password

### 5.2. Cập nhật DATABASE_URL trong .env
```bash
nano .env
# Sửa DATABASE_URL với thông tin vừa tạo
```

### 5.3. Push schema vào database
```bash
npx prisma generate
npx prisma db push --accept-data-loss
```

---

## ✅ Bước 6: Build và chạy app

### 6.1. Build production
```bash
npm run build
```

### 6.2. Start với PM2
```bash
pm2 start npm --name "ctss" -- start
pm2 save
pm2 startup
# Chạy lệnh mà PM2 hiển thị (ví dụ: sudo env PATH=...)
```

### 6.3. Kiểm tra
```bash
pm2 status
pm2 logs ctss
```

App đang chạy tại: `http://your-vps-ip:3000`

---

## ✅ Bước 7: Setup Nginx (tùy chọn - nếu có domain)

### 7.1. Cài Nginx
```bash
apt install nginx -y
```

### 7.2. Tạo config
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

### 7.3. Enable và reload
```bash
ln -s /etc/nginx/sites-available/ctss /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 7.4. Setup SSL (nếu có domain)
```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d your-domain.com
```

---

## 🔄 Update code sau này

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

## 🐛 Lỗi thường gặp

### Database connection failed
→ Kiểm tra `DATABASE_URL` trong `.env` có đúng không

### Port 3000 already in use
```bash
pm2 stop ctss
# hoặc
pkill -f "next start"
```

### Build failed
```bash
rm -rf .next node_modules
npm install
npm run build
```

---

## ✅ Checklist

- [ ] Code đã push lên GitHub
- [ ] SSH vào được VPS
- [ ] Node.js đã cài (>= 18)
- [ ] PM2 đã cài
- [ ] Code đã clone về VPS
- [ ] File `.env` đã tạo và đúng
- [ ] Database đã tạo trên Hostinger
- [ ] `npx prisma db push` thành công
- [ ] `npm run build` thành công
- [ ] PM2 đã start app
- [ ] App chạy được tại `http://your-vps-ip:3000`

---

## 🎉 Xong!

App của bạn đã chạy tại:
- **IP:** http://your-vps-ip:3000
- **Domain:** https://your-domain.com (nếu setup Nginx + SSL)

**Chúc bạn thành công! 🚀**
