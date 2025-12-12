# ⚡ DEPLOY NGAY LÊN VPS - 3 BƯỚC

## 🚀 Bước 1: SSH vào VPS
```bash
ssh root@72.61.119.247
```

## 🚀 Bước 2: Chạy lệnh deploy
```bash
cd ~/ctss && git pull origin main && npm install --legacy-peer-deps && npx prisma db push --accept-data-loss && npx prisma generate && npm run build && pm2 restart ctss && pm2 save
```

## 🚀 Bước 3: Kiểm tra
```bash
pm2 status
pm2 logs ctss --lines 20
```

---

## ✅ Hoặc copy script và chạy:
```bash
cd ~/ctss
bash DEPLOY_VPS_COMMANDS.sh
```

---

**🌐 Sau khi deploy xong, truy cập:**
- http://72.61.119.247
- https://ctss.huynhchitam.com (nếu đã setup domain)
