# 🔧 FIX VÀ DEPLOY VPS - HƯỚNG DẪN

## ⚠️ Vấn đề hiện tại:
1. Git pull bị lỗi vì có local changes
2. Database có lỗi Foreign key constraint cho `ProductStock_branchId_fkey`

---

## ✅ Giải pháp - Chạy từng bước:

### Bước 1: Fix Git pull
```bash
cd ~/ctss
git stash
git pull origin main
```

### Bước 2: Fix Database Foreign Key Issue
```bash
cd ~/ctss
npx prisma db push --accept-data-loss
```

Nếu vẫn lỗi, chạy SQL để fix:
```bash
# Kết nối PostgreSQL
psql $DATABASE_URL

# Xóa ProductStock với branchId không tồn tại
DELETE FROM "ProductStock" 
WHERE "branchId" NOT IN (SELECT id FROM "Branch");

# Hoặc tạo branch mặc định nếu chưa có
INSERT INTO "Branch" (id, name, code, "createdAt", "updatedAt")
SELECT 'default-branch-id', 'Chi nhánh mặc định', 'DEFAULT', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Branch" WHERE id = 'default-branch-id');

# Cập nhật ProductStock với branchId null hoặc không hợp lệ
UPDATE "ProductStock" 
SET "branchId" = 'default-branch-id'
WHERE "branchId" NOT IN (SELECT id FROM "Branch") OR "branchId" IS NULL;

# Thoát
\q
```

### Bước 3: Deploy bình thường
```bash
cd ~/ctss
npm install --legacy-peer-deps
npx prisma generate
npm run build
pm2 restart ctss
pm2 save
```

---

## 🚀 Hoặc chạy script tự động (sau khi fix database):

```bash
cd ~/ctss
bash FIX_DEPLOY_VPS.sh
```

---

## 📋 Checklist:

- [ ] Git stash và pull thành công
- [ ] Fix database foreign key constraint
- [ ] Install dependencies
- [ ] Generate Prisma client
- [ ] Build thành công
- [ ] PM2 restart thành công
- [ ] Test ứng dụng hoạt động
