# ⚡ DEPLOY NHANH - 1 LỆNH

## 🚀 **Cách nhanh nhất:**

```bash
./deploy.sh
```

**Script sẽ tự động:**
1. Pull code mới từ GitHub
2. Push code lên GitHub
3. Deploy lên VPS

---

## 🔧 **Nếu gặp lỗi conflict:**

```bash
# Pull code mới trước
git pull origin main

# Nếu có conflict, resolve rồi:
git add .
git commit -m "Merge conflicts resolved"
git push origin main

# Sau đó deploy
./deploy.sh
```

---

## ✅ **Kiểm tra:**

```bash
curl http://72.61.119.247/api/health
```

---

*Xong!*
