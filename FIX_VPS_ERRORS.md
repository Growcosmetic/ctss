# 🔧 Fix VPS Errors

## ❌ Các lỗi thường gặp trên VPS

### 1. Git Divergent Branches

**Lỗi:**
```
fatal: Need to specify how to reconcile divergent branches.
```

**Giải pháp:**
```bash
# Set merge strategy
git config pull.rebase false

# Hoặc dùng rebase
git config pull.rebase true

# Hoặc chỉ fast-forward
git config pull.ff only

# Sau đó pull lại
git pull origin main
```

**Hoặc force pull (nếu muốn overwrite local):**
```bash
git fetch origin
git reset --hard origin/main
```

---

### 2. Prisma Schema Not Found

**Lỗi:**
```
Error: Could not find Prisma Schema
```

**Giải pháp:**
```bash
# Kiểm tra file có tồn tại không
ls -la prisma/schema.prisma

# Nếu không có, pull lại code
git pull origin main

# Generate Prisma Client
npx prisma generate

# Push schema (nếu cần)
npx prisma db push
```

---

### 3. Firebase Module Not Found

**Lỗi:**
```
Module not found: Can't resolve '../lib/firebase'
```

**Lưu ý:** Lỗi này có thể từ project khác (ai-sales-assistant), không phải CTSS.

**Nếu trong CTSS có lỗi này:**

1. **Kiểm tra file có tồn tại:**
   ```bash
   ls -la lib/firebase.ts
   ```

2. **Nếu không có, tạo file hoặc xóa import:**
   - Tìm các file import firebase
   - Xóa hoặc comment import
   - Hoặc tạo file `lib/firebase.ts` với mock implementation

3. **Tìm và sửa:**
   ```bash
   # Tìm các file import firebase
   grep -r "firebase" app/ --include="*.ts" --include="*.tsx"
   
   # Xóa hoặc comment các import này
   ```

---

### 4. PM2 Command Not Found

**Lỗi:**
```
zsh: command not found: pm2
```

**Giải pháp:**

#### Option 1: Cài PM2 (Khuyến nghị)
```bash
# Cài PM2 globally
npm install -g pm2

# Hoặc dùng npx
npx pm2 start npm --name "ctss" -- start
```

#### Option 2: Dùng systemd
```bash
# Tạo service file
sudo nano /etc/systemd/system/ctss.service
```

Nội dung:
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
sudo systemctl daemon-reload
sudo systemctl start ctss
sudo systemctl enable ctss
```

#### Option 3: Dùng npm start trực tiếp
```bash
# Start app
npm run start

# Hoặc chạy trong background với nohup
nohup npm run start > app.log 2>&1 &
```

---

## 🚀 Quick Fix Script

Tạo file `fix-vps.sh`:

```bash
#!/bin/bash

echo "🔧 Fixing VPS errors..."

# 1. Fix git
echo "📝 Configuring git..."
git config pull.rebase false

# 2. Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# 3. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 4. Generate Prisma Client
echo "🗄️ Generating Prisma Client..."
npx prisma generate

# 5. Build
echo "🏗️ Building..."
npm run build

# 6. Install PM2 if not exists
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

# 7. Restart app
echo "🚀 Restarting app..."
pm2 restart ctss || pm2 start npm --name "ctss" -- start

echo "✅ Done!"
```

Chạy:
```bash
chmod +x fix-vps.sh
./fix-vps.sh
```

---

## 📝 Checklist Deploy VPS

- [ ] Git pull thành công
- [ ] npm install hoàn tất
- [ ] Prisma schema tồn tại
- [ ] `npx prisma generate` chạy thành công
- [ ] `npm run build` thành công
- [ ] PM2 hoặc systemd đã setup
- [ ] App chạy được (check port 3000)
- [ ] Database kết nối được

---

*Last updated: 2024*

