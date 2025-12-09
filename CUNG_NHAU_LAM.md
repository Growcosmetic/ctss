# 🤝 Cùng Nhau Deploy CTSS lên VPS

## 📋 Chuẩn bị

Trước khi bắt đầu, bạn cần:
- [ ] SSH vào VPS
- [ ] Đã clone repo về VPS
- [ ] Có quyền root hoặc sudo

---

## 🚀 Bắt Đầu - Từng Bước

### BƯỚC 1: SSH vào VPS

**Bạn làm:**
```bash
ssh root@your-vps-ip
```

**Sau khi SSH thành công, chạy:**
```bash
pwd
cd /root/ctss
pwd
```

**Gửi cho tôi kết quả:** `pwd` hiển thị gì?

---

### BƯỚC 2: Kiểm tra Git

**Bạn chạy:**
```bash
cd /root/ctss
git status
```

**Gửi cho tôi:** Kết quả của `git status`

**Nếu có lỗi "divergent branches", chạy:**
```bash
git config pull.rebase false
git pull origin main
```

**Gửi cho tôi:** Kết quả của `git pull`

---

### BƯỚC 3: Kiểm tra Node.js

**Bạn chạy:**
```bash
node -v
npm -v
```

**Gửi cho tôi:** Version của Node.js và npm

**Nếu chưa có Node.js:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs
```

---

### BƯỚC 4: Install Dependencies

**Bạn chạy:**
```bash
cd /root/ctss
npm install
```

**Gửi cho tôi:** Kết quả của `npm install`

**Nếu có lỗi, thử:**
```bash
npm install --legacy-peer-deps
```

---

### BƯỚC 5: Kiểm tra Prisma Schema

**Bạn chạy:**
```bash
ls -la prisma/schema.prisma
cat prisma/schema.prisma | head -10
```

**Gửi cho tôi:** File có tồn tại không?

---

### BƯỚC 6: Kiểm tra .env

**Bạn chạy:**
```bash
cat .env | grep DATABASE_URL
```

**Gửi cho tôi:** DATABASE_URL có giá trị gì? (chỉ gửi format, không gửi password)

**Nếu chưa có .env:**
```bash
cp .env.example .env
nano .env
# Sửa DATABASE_URL
```

---

### BƯỚC 7: Generate Prisma Client

**Bạn chạy:**
```bash
npx prisma generate
```

**Gửi cho tôi:** Kết quả của lệnh này

**Nếu thành công, tiếp tục:**
```bash
npx prisma db push
```

**Gửi cho tôi:** Kết quả của `prisma db push`

---

### BƯỚC 8: Build Application

**Bạn chạy:**
```bash
npm run build
```

**Gửi cho tôi:** Kết quả của build (có lỗi gì không?)

**Nếu build thành công, tiếp tục bước 9**

---

### BƯỚC 9: Setup PM2

**Bạn chạy:**
```bash
npm install -g pm2
pm2 --version
```

**Gửi cho tôi:** PM2 version

---

### BƯỚC 10: Start App

**Bạn chạy:**
```bash
cd /root/ctss
pm2 stop ctss 2>/dev/null || true
pm2 delete ctss 2>/dev/null || true
pm2 start npm --name "ctss" -- start
pm2 status
```

**Gửi cho tôi:** Kết quả của `pm2 status`

---

### BƯỚC 11: Kiểm tra App

**Bạn chạy:**
```bash
pm2 logs ctss --lines 20
curl http://localhost:3000/api/health
```

**Gửi cho tôi:** 
- Logs có lỗi gì không?
- API response là gì?

---

### BƯỚC 12: Save PM2

**Bạn chạy:**
```bash
pm2 save
pm2 startup
```

**Gửi cho tôi:** Lệnh mà PM2 hiển thị (để setup auto-start)

---

## 🎉 Hoàn Tất!

Nếu tất cả các bước đều OK, app đã chạy thành công!

---

## 📝 Checklist

- [ ] SSH vào VPS thành công
- [ ] Git pull thành công
- [ ] Node.js đã cài
- [ ] npm install thành công
- [ ] Prisma schema tồn tại
- [ ] .env có DATABASE_URL
- [ ] Prisma generate thành công
- [ ] Prisma db push thành công
- [ ] Build thành công
- [ ] PM2 đã cài
- [ ] App đã start với PM2
- [ ] App chạy được (API test OK)
- [ ] PM2 logs không có lỗi

---

## 🆘 Nếu Gặp Lỗi

**Gửi cho tôi:**
1. Lệnh bạn đã chạy
2. Lỗi cụ thể (copy toàn bộ error message)
3. Output của lệnh

**Tôi sẽ giúp bạn fix từng lỗi một!**

---

*Hãy bắt đầu từ BƯỚC 1 và gửi kết quả cho tôi!*

