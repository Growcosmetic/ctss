# ⚡ DEPLOY NHANH - 1 LỆNH

## 🚀 **Cách nhanh nhất:**

```bash
./deploy.sh
```

**Hoặc:**

```bash
git push origin main && ssh root@72.61.119.247 'cd ~/ctss && git pull && npm install && npx prisma db push --accept-data-loss && npx prisma generate && npm run build && pm2 restart ctss'
```

---

## ✅ **Kiểm tra:**

```bash
curl http://72.61.119.247/api/health
```

---

*Xong!*

