# ⚡ Quick Deploy lên VPS

## 🚀 4 Bước đơn giản

### 1) SSH vào VPS

```bash
ssh root@your-vps-ip
cd /root/ctss
git pull
npm install
```

### 2) Setup Database

**Option A: Dùng db push (Nhanh - Khuyến nghị)**

```bash
npx prisma db push
npx prisma generate
```

**Option B: Dùng migrate deploy (Nếu có permissions)**

```bash
npx prisma migrate deploy
npx prisma generate
```

**Nếu lỗi permission:** Xem `QUICK_FIX_DATABASE.md`

### 3) Build

```bash
npm run build
```

### 4) Start

**Option A: Start trực tiếp**

```bash
npm run start
```

**Option B: Dùng PM2 (Khuyến nghị cho production)**

```bash
# Cài PM2 (lần đầu)
npm install -g pm2

# Start app
pm2 start npm --name "ctss" -- start

# Lưu và auto-start
pm2 save
pm2 startup
```

---

## 🔄 Update (Khi có code mới)

```bash
cd /root/ctss
git pull
npm install
npx prisma db push  # hoặc migrate deploy
npx prisma generate
npm run build
pm2 restart ctss    # hoặc systemctl restart ctss
```

---

## 📝 Script tự động

Chạy script tự động:

```bash
cd /root/ctss
chmod +x deploy-vps.sh
./deploy-vps.sh
```

Script sẽ tự động:
- Pull code
- Install dependencies
- Setup database
- Build
- Start app

---

## 🐛 Fix lỗi thường gặp

### Lỗi: "permission denied for schema public"

```bash
# Dùng db push thay vì migrate deploy
npx prisma db push
```

### Lỗi: "Port 3000 already in use"

```bash
# Kill process cũ
pm2 stop ctss
# hoặc
pkill -f "next start"
```

### Lỗi: Build fail

```bash
# Clear và rebuild
rm -rf .next node_modules
npm install
npm run build
```

---

## ✅ Kiểm tra

```bash
# Check app
curl http://localhost:3000/api/health

# Check PM2
pm2 status
pm2 logs ctss
```

---

*Xem chi tiết: HUONG_DAN_DEPLOY_VPS.md*

