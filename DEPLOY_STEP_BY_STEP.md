# 🚀 Hướng Dẫn Deploy Từng Bước - CTSS lên Hostinger

**VPS IP:** 72.61.119.247  
**SSH Username:** root  
**OS:** Ubuntu 24.04 LTS

---

## ✅ BƯỚC 1: Kết Nối SSH vào VPS

### Trên Mac/Linux Terminal:

```bash
ssh root@72.61.119.247
```

### Trên Windows (PowerShell hoặc PuTTY):

```bash
ssh root@72.61.119.247
```

**Hoặc dùng Terminal trên Hostinger:**
- Click nút "Terminal" ở góc trên bên phải trong hPanel
- Terminal sẽ mở trong browser

**Sau khi kết nối thành công**, bạn sẽ thấy prompt như:
```
root@srv1136013:~#
```

---

## ✅ BƯỚC 2: Cập Nhật Hệ Thống

Chạy lệnh này để cập nhật packages:

```bash
apt update && apt upgrade -y
```

**Chờ hoàn thành** (có thể mất 2-5 phút)

---

## ✅ BƯỚC 3: Cài Đặt Node.js

### 3.1. Thêm NodeSource repository:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
```

### 3.2. Cài Node.js:

```bash
apt-get install -y nodejs
```

### 3.3. Kiểm tra cài đặt:

```bash
node -v
npm -v
```

**Kết quả mong đợi:**
- `node -v` phải hiển thị: `v20.x.x` hoặc cao hơn
- `npm -v` phải hiển thị: `10.x.x` hoặc cao hơn

---

## ✅ BƯỚC 4: Cài Đặt PM2

```bash
npm install -g pm2
```

Kiểm tra:
```bash
pm2 -v
```

---

## ✅ BƯỚC 5: Cài Đặt Git (nếu chưa có)

```bash
apt install git -y
```

Kiểm tra:
```bash
git --version
```

---

## ✅ BƯỚC 6: Cài Đặt PostgreSQL

### 6.1. Cài PostgreSQL:

```bash
apt install postgresql postgresql-contrib -y
```

### 6.2. Start PostgreSQL:

```bash
systemctl start postgresql
systemctl enable postgresql
```

### 6.3. Tạo Database và User:

```bash
sudo -u postgres psql
```

**Trong PostgreSQL shell**, chạy các lệnh sau (copy từng dòng):

```sql
CREATE DATABASE ctss_db;
CREATE USER ctss_user WITH PASSWORD 'Ctss2024!SecurePass';
GRANT ALL PRIVILEGES ON DATABASE ctss_db TO ctss_user;
\q
```

**Lưu ý:** Password `Ctss2024!SecurePass` - bạn có thể đổi thành password khác mạnh hơn.

---

## ✅ BƯỚC 7: Clone Repository

### 7.1. Tạo thư mục:

```bash
mkdir -p /root/projects
cd /root/projects
```

### 7.2. Clone repo:

```bash
git clone https://github.com/Growcosmetic/ctss.git
```

### 7.3. Vào thư mục project:

```bash
cd ctss
```

---

## ✅ BƯỚC 8: Tạo File .env

### 8.1. Copy template:

```bash
cp env.hostinger.template .env
```

### 8.2. Mở file để chỉnh sửa:

```bash
nano .env
```

### 8.3. Điền thông tin sau vào file:

```env
DATABASE_URL="postgresql://ctss_user:Ctss2024!SecurePass@localhost:5432/ctss_db?schema=public"
NODE_ENV=production
NEXT_PUBLIC_APP_URL=http://72.61.119.247:3000
JWT_SECRET=your-super-secret-jwt-key-change-this-min-32-chars-random
OPENAI_API_KEY=sk-proj-your-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini
```

**Lưu ý:**
- Thay `Ctss2024!SecurePass` bằng password bạn đã set ở Bước 6.3
- Thay `your-super-secret-jwt-key-change-this-min-32-chars-random` bằng chuỗi ngẫu nhiên mạnh
- Nếu không dùng OpenAI, có thể bỏ qua `OPENAI_API_KEY`

**Để tạo JWT_SECRET ngẫu nhiên**, chạy:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy kết quả và paste vào `JWT_SECRET=`

### 8.4. Lưu file:

- Nhấn `Ctrl + O` (lưu)
- Nhấn `Enter` (xác nhận)
- Nhấn `Ctrl + X` (thoát)

---

## ✅ BƯỚC 9: Cài Đặt Dependencies

```bash
npm install
```

**Nếu gặp lỗi peer dependencies**, chạy:
```bash
npm install --legacy-peer-deps
```

**Chờ hoàn thành** (có thể mất 3-5 phút)

---

## ✅ BƯỚC 10: Setup Database

### 10.1. Generate Prisma Client:

```bash
npx prisma generate
```

### 10.2. Push schema vào database:

```bash
npx prisma db push --accept-data-loss
```

**Kết quả mong đợi:** Thấy message "Your database is now in sync with your schema"

---

## ✅ BƯỚC 11: Build Application

```bash
npm run build
```

**Chờ hoàn thành** (có thể mất 2-5 phút)

**Kết quả mong đợi:** Thấy "✓ Compiled successfully"

---

## ✅ BƯỚC 12: Start với PM2

### 12.1. Start app:

```bash
pm2 start npm --name "ctss" -- start
```

### 12.2. Kiểm tra status:

```bash
pm2 status
```

Bạn sẽ thấy `ctss` với status `online`

### 12.3. Lưu PM2 process list:

```bash
pm2 save
```

### 12.4. Setup auto-start khi reboot:

```bash
pm2 startup
```

PM2 sẽ hiển thị một lệnh, **copy và chạy lệnh đó**. Ví dụ:
```bash
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u root --hp /root
```

---

## ✅ BƯỚC 13: Kiểm Tra

### 13.1. Test app:

```bash
curl http://localhost:3000
```

Nếu thấy HTML response → **Thành công!** ✅

### 13.2. Xem logs:

```bash
pm2 logs ctss
```

Nhấn `Ctrl + C` để thoát logs

### 13.3. Kiểm tra port:

```bash
netstat -tulpn | grep 3000
```

---

## 🎉 HOÀN TẤT!

App của bạn đã chạy tại: **http://72.61.119.247:3000**

**Mở browser và truy cập:** `http://72.61.119.247:3000`

---

## 🔄 Nếu Cần Update Code Sau Này

```bash
cd /root/projects/ctss
git pull
npm install
npx prisma db push
npx prisma generate
npm run build
pm2 restart ctss
```

Hoặc chạy script tự động:
```bash
cd /root/projects/ctss
./deploy-hostinger.sh
```

---

## 🐛 Nếu Gặp Lỗi

### Lỗi: "Cannot connect to database"
→ Kiểm tra lại `DATABASE_URL` trong `.env` và password

### Lỗi: "Port 3000 already in use"
```bash
pm2 stop ctss
pm2 delete ctss
pm2 start npm --name "ctss" -- start
```

### Lỗi: Build failed
```bash
rm -rf .next node_modules
npm install
npm run build
```

### Xem logs chi tiết:
```bash
pm2 logs ctss --lines 100
```

---

**Chúc bạn deploy thành công! 🚀**
