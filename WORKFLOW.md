# 🔄 Workflow Development - CTSS

## Quy trình làm việc thống nhất

### 1️⃣ **LOCAL - Chỉnh sửa code**
```bash
# Làm việc trên localhost
npm run dev

# Chỉnh sửa code trong các file
# Test trên http://localhost:3000
```

### 2️⃣ **DATA - Seed/Test data (nếu cần)**
```bash
# Seed customers trên localhost
./scripts/seed-local.sh

# Hoặc seed trên VPS
ssh root@72.61.119.247 "cd ~/ctss && node scripts/seed-customers-api.js"
```

### 3️⃣ **DEPLOY - Deploy lên VPS**
```bash
# Cách 1: Dùng script tự động
./deploy-to-vps.sh

# Cách 2: Manual
git push origin main
ssh root@72.61.119.247 "cd ~/ctss && git pull origin main && npm install && npm run build && pm2 restart ctss"
```

### 4️⃣ **PUSH GITHUB - Lưu code**
```bash
# Commit và push
git add -A
git commit -m "Mô tả thay đổi"
git push origin main
```

---

## 🚀 Script tự động hóa (All-in-one)

### Script: `save-and-deploy.sh`

Chạy một lệnh để làm tất cả:
1. Commit code
2. Push GitHub
3. Deploy lên VPS

```bash
./save-and-deploy.sh "Mô tả thay đổi"
```

---

## 📋 Checklist trước khi deploy

- [ ] Code đã test trên localhost
- [ ] Không có lỗi build (`npm run build`)
- [ ] Đã commit và push GitHub
- [ ] Database trên VPS đã có dữ liệu (nếu cần)

---

## 🔧 Các lệnh thường dùng

### Local Development
```bash
npm run dev              # Chạy dev server
npm run build           # Build production
npm run lint            # Check lỗi code
```

### Database
```bash
npx prisma generate      # Generate Prisma Client
npx prisma db push      # Push schema to DB
npx prisma studio       # Xem database (http://localhost:5555)
```

### Git
```bash
git status              # Xem thay đổi
git add -A              # Thêm tất cả
git commit -m "..."     # Commit
git push origin main    # Push lên GitHub
```

### VPS
```bash
# SSH vào VPS
ssh root@72.61.119.247

# Pull code mới
cd ~/ctss && git pull origin main

# Restart app
pm2 restart ctss

# Xem logs
pm2 logs ctss
```

---

## 📝 Quy tắc commit message

- `✨` Feature mới
- `🐛` Fix bug
- `🔧` Cấu hình/thiết lập
- `📝` Documentation
- `🎨` UI/UX improvements
- `⚡` Performance
- `🔒` Security
- `♻️` Refactor

Ví dụ:
```bash
git commit -m "✨ Add customer search feature"
git commit -m "🐛 Fix customer name display issue"
git commit -m "📝 Update CRM documentation"
```

---

## 🎯 Best Practices

1. **Luôn test trên localhost trước khi deploy**
2. **Commit thường xuyên** (mỗi feature/bug fix)
3. **Push GitHub sau mỗi commit** (để backup)
4. **Deploy sau khi code đã stable**
5. **Kiểm tra VPS sau khi deploy**

---

**Last Updated:** 2025-01-XX

