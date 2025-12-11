# 🔧 Fix ngay trên VPS

## Vấn đề:
- Git pull bị block vì có local changes
- react-is đã có trong package.json nhưng có thể chưa được cài đặt

## Giải pháp:

### Chạy các lệnh sau trên VPS:

```bash
cd ~/ctss

# Stash local changes để pull được
git stash

# Pull code mới nhất
git pull origin main

# Cài đặt react-is và dependencies
npm install react-is --save
npm install --legacy-peer-deps

# Build lại
npm run build
```

### Nếu build thành công:

```bash
# Start PM2
pm2 start npm --name "ctss" -- start
pm2 save
pm2 status
```

### Nếu build vẫn fail:

```bash
# Kiểm tra react-is đã được cài chưa
npm list react-is

# Nếu chưa có, cài lại
npm install react-is --save --force
npm run build
```

### Kiểm tra sau khi deploy:

```bash
pm2 logs ctss --lines 20
curl http://localhost:3000/api/health
```
