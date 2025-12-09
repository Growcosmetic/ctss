# 🚀 Quick Setup: Dùng Token để Pull Code

## Token của bạn:
```
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
```

---

## ✅ CÁCH 1: Setup Token trong Git Config (Khuyến nghị)

### Trên VPS, chạy:

```bash
cd ~/ctss

# Đổi remote URL để include token
git remote set-url origin https://Growcosmetic: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@github.com/Growcosmetic/ctss.git

# Test pull
git pull origin main
```

Sau đó bạn có thể pull/push bình thường mà không cần nhập lại token.

---

## ✅ CÁCH 2: Dùng Script Tự Động

```bash
cd ~/ctss
chmod +x setup-git-token.sh
./setup-git-token.sh
```

---

## ✅ CÁCH 3: Pull với Token (Mỗi lần)

```bash
cd ~/ctss
git pull https://Growcosmetic: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@github.com/Growcosmetic/ctss.git main
```

---

## 🔒 Lưu ý Bảo Mật:

Token đã được lưu trong `.git/config` - không an toàn lắm nếu ai đó có quyền truy cập VPS.

**Khuyến nghị:** Sau khi setup xong, nên:
1. Setup SSH key (an toàn hơn)
2. Hoặc giữ token này và không chia sẻ

---

## 🚀 Sau khi pull xong:

```bash
cd ~/ctss
npm run build
pm2 restart ctss
pm2 status
```

---

## ✅ Kiểm tra:

```bash
git remote -v
```

Phải thấy:
```
origin  https://Growcosmetic:ghp_...@github.com/Growcosmetic/ctss.git (fetch)
origin  https://Growcosmetic:ghp_...@github.com/Growcosmetic/ctss.git (push)
```

