# 📖 Workflow Đơn Giản - CTSS

## 🎯 Mục tiêu: Làm việc với code một cách đơn giản nhất

---

## ✅ Sau khi test và fix tính năng:

### CÁCH 1: Dùng script tự động (Khuyến nghị)

```bash
# Trên máy local của bạn
cd ~/Downloads/ctss

# Chạy script và nhập mô tả
./save-and-push.sh "Fix login issue"
```

Script sẽ tự động:
- ✅ Add tất cả file đã thay đổi
- ✅ Commit với message bạn nhập
- ✅ Push lên GitHub

### CÁCH 2: Làm thủ công (nếu muốn)

```bash
cd ~/Downloads/ctss

# Xem thay đổi
git status

# Add tất cả
git add .

# Commit
git commit -m "🔧 Fix login issue"

# Push
git push origin main
```

---

## 🔄 Sau khi push, sync lên VPS:

### Trên VPS, chạy:

```bash
cd ~/ctss
git pull origin main
npm run build
pm2 restart ctss
```

Hoặc dùng script tự động:

```bash
cd ~/ctss
git pull origin main
./rebuild-vps.sh
```

---

## 📝 Quy tắc đơn giản:

### 1. Khi nào cần commit?
- ✅ Sau khi fix xong một bug
- ✅ Sau khi thêm tính năng mới
- ✅ Sau khi test và xác nhận hoạt động tốt

### 2. Message commit nên viết như thế nào?
- ✅ Ngắn gọn, rõ ràng
- ✅ Ví dụ:
  - `Fix login issue`
  - `Add new dashboard`
  - `Update customer page`

### 3. Khi nào cần rebuild trên VPS?
- ✅ Sau mỗi lần `git push`
- ✅ Khi code có thay đổi về:
  - API routes
  - Frontend components
  - Database schema

---

## 🚀 Workflow hoàn chỉnh:

```
1. Test tính năng trên VPS
   ↓
2. Fix code nếu có lỗi
   ↓
3. Test lại để đảm bảo hoạt động
   ↓
4. Chạy: ./save-and-push.sh "Mô tả fix"
   ↓
5. Trên VPS: git pull → npm run build → pm2 restart
   ↓
6. Test lại trên VPS để xác nhận
```

---

## 💡 Tips:

### Nếu quên commit message:
```bash
# Chỉ cần chạy script, nó sẽ hỏi bạn
./save-and-push.sh
```

### Nếu muốn xem code đã thay đổi gì:
```bash
git status
git diff
```

### Nếu muốn xem lịch sử commit:
```bash
git log --oneline -10
```

---

## 🆘 Nếu gặp lỗi:

### Lỗi: "Your branch is behind"
```bash
git pull origin main
# Giải quyết conflict nếu có
git push origin main
```

### Lỗi: "Permission denied"
```bash
# Kiểm tra SSH key hoặc dùng HTTPS với token
git remote set-url origin https://github.com/Growcosmetic/ctss.git
```

### Lỗi: "Merge conflict"
```bash
# Xem file conflict
git status
# Sửa file conflict, sau đó:
git add .
git commit -m "Resolve merge conflict"
git push origin main
```

---

## 📞 Cần giúp đỡ?

Nếu gặp vấn đề, chỉ cần:
1. Copy lỗi và gửi cho tôi
2. Tôi sẽ hướng dẫn fix ngay!

---

## ✨ Tóm tắt:

**Chỉ cần nhớ 2 lệnh:**

1. **Trên local**: `./save-and-push.sh "Mô tả"`
2. **Trên VPS**: `git pull && npm run build && pm2 restart ctss`

**Đơn giản vậy thôi!** 🎉

