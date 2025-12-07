# 🚀 Hướng dẫn đẩy code lên GitHub

## Bước 1: Đổi remote sang repo mới

```bash
# Xóa remote cũ
git remote remove origin

# Thêm remote mới
git remote add origin https://github.com/Growcosmetic/ctss.git

# Kiểm tra lại
git remote -v
```

## Bước 2: Kiểm tra file cần commit

```bash
# Xem các file đã thay đổi
git status

# Xem file chưa được track
git status --untracked-files=all
```

## Bước 3: Add các file vào staging

```bash
# Add tất cả file thay đổi
git add .

# Hoặc add từng file cụ thể
git add app/
git add features/
git add prisma/
# ...
```

## Bước 4: Commit code

```bash
# Commit với message mô tả
git commit -m "✨ Complete CTSS System - All 35 Phases

- Phase 31: MINA Personalization Engine
- Phase 32: Financial Module & Profit Control  
- Phase 33: Dynamic Pricing Engine
- Phase 34: Membership & Loyalty System
- Phase 35: CTSS Control Tower (CEO Command Center)
- Fix all dashboard APIs with fallback mock data
- Fix authentication with mock endpoints
- Complete salon management system 5.0"
```

## Bước 5: Push lên GitHub

```bash
# Lần đầu push lên repo mới (branch main)
git push -u origin main

# Hoặc nếu branch là master
git push -u origin master

# Các lần sau chỉ cần
git push
```

## Bước 6: Kiểm tra trên GitHub

Sau khi push xong, vào: https://github.com/Growcosmetic/ctss

Bạn sẽ thấy code đã được đẩy lên!

---

## 🔒 Lưu ý quan trọng

### 1. File .env KHÔNG được commit
File `.gitignore` đã có sẵn rule để ignore:
- `.env`
- `.env*.local`
- `node_modules/`
- `.next/`

### 2. Nếu có conflict
```bash
# Pull code từ GitHub trước
git pull origin main --rebase

# Giải quyết conflict, sau đó
git add .
git commit -m "Resolve conflicts"
git push
```

### 3. Nếu muốn push branch khác
```bash
# Tạo branch mới
git checkout -b develop

# Push branch mới
git push -u origin develop
```

---

## 📝 Quick Commands (Copy & Paste)

```bash
# 1. Đổi remote
git remote set-url origin https://github.com/Growcosmetic/ctss.git

# 2. Add tất cả
git add .

# 3. Commit
git commit -m "✨ Complete CTSS System - All 35 Phases"

# 4. Push
git push -u origin main
```

---

## ❓ Troubleshooting

### Lỗi: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/Growcosmetic/ctss.git
```

### Lỗi: "failed to push some refs"
```bash
git pull origin main --rebase
git push -u origin main
```

### Lỗi: "authentication failed"
- Kiểm tra token GitHub
- Hoặc dùng SSH: `git remote set-url origin git@github.com:Growcosmetic/ctss.git`

