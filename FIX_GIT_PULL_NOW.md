# 🚀 Fix Git Pull Ngay - Dùng Token

## ⚠️ Vấn đề:
GitHub không chấp nhận password authentication nữa, chỉ chấp nhận token.

---

## ✅ GIẢI PHÁP NGAY:

### Trên VPS, chạy lệnh này:

```bash
cd ~/ctss

# Đổi remote URL để include token (không hỏi username/password nữa)
git remote set-url origin https://Growcosmetic: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@github.com/Growcosmetic/ctss.git

# Pull code
git pull origin main

# Build và restart
npm run build
pm2 restart ctss
pm2 status
```

---

## 🔍 Kiểm tra:

```bash
git remote -v
```

Phải thấy:
```
origin  https://Growcosmetic:ghp_...@github.com/Growcosmetic/ctss.git (fetch)
origin  https://Growcosmetic:ghp_...@github.com/Growcosmetic/ctss.git (push)
```

---

## ✅ Sau khi setup:

Bạn có thể pull/push bình thường mà **KHÔNG CẦN** nhập username/password nữa:

```bash
git pull origin main
git push origin main
```

---

## 🆘 Nếu script vẫn hỏi username:

**Nhấn `Ctrl+C`** để hủy, sau đó chạy lệnh thủ công ở trên.

