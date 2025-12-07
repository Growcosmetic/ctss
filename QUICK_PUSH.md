# ⚡ Đẩy code lên GitHub - Quick Guide

## Repo GitHub
👉 **https://github.com/Growcosmetic/ctss**

---

## 🚀 Cách 1: Dùng script tự động (Dễ nhất)

```bash
bash push-to-github.sh
```

Script sẽ tự động:
- ✅ Add tất cả file
- ✅ Commit với message chuẩn
- ✅ Push lên GitHub

---

## 🚀 Cách 2: Làm thủ công

### Bước 1: Đổi remote (Đã làm rồi ✅)
```bash
git remote set-url origin https://github.com/Growcosmetic/ctss.git
```

### Bước 2: Add file
```bash
git add .
```

### Bước 3: Commit
```bash
git commit -m "✨ Complete CTSS System - All 35 Phases"
```

### Bước 4: Push
```bash
git push -u origin main
```

---

## 📝 Quick Copy & Paste

```bash
git remote set-url origin https://github.com/Growcosmetic/ctss.git
git add .
git commit -m "✨ Complete CTSS System - All 35 Phases"
git push -u origin main
```

---

## ⚠️ Lưu ý

1. **File .env sẽ KHÔNG được commit** (đã có trong .gitignore)
2. **Node_modules sẽ KHÔNG được commit** (đã có trong .gitignore)
3. Nếu cần hủy: `Ctrl + C` khi chạy script

---

## ❓ Nếu gặp lỗi

### Lỗi authentication
- Kiểm tra GitHub token
- Hoặc dùng SSH key

### Lỗi "branch does not exist"
```bash
git checkout -b main
git push -u origin main
```

### Lỗi conflict
```bash
git pull origin main --rebase
# Giải quyết conflict, sau đó
git push
```

