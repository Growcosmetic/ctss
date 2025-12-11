# 🔧 Sửa Lỗi Deploy VPS

## Vấn đề:
1. Thư mục dự án ở `/root/ctss` không phải `/home/user/ctss`
2. Port 3000 đang bị chiếm
3. Có 2 process PM2 đang chạy, một bị lỗi

## Giải pháp - Copy và paste từng khối:

### Bước 1: Dừng tất cả PM2 processes và xóa

```bash
# Dừng tất cả
pm2 stop all
pm2 delete all

# Kiểm tra xem còn process nào không
pm2 list
```

### Bước 2: Tìm và kill process đang dùng port 3000

```bash
# Tìm process đang dùng port 3000
lsof -ti:3000

# Kill process đó (thay PID bằng số từ lệnh trên)
kill -9 $(lsof -ti:3000)

# Hoặc kill tất cả node processes
pkill -9 node
```

### Bước 3: Di chuyển vào đúng thư mục và deploy

```bash
# Di chuyển vào thư mục dự án
cd /root/ctss

# Pull code mới nhất
git pull origin main

# Cài đặt dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Sync database schema
npx prisma db push --accept-data-loss

# Build ứng dụng
npm run build
```

### Bước 4: Khởi động lại PM2 (chỉ 1 process)

```bash
# Xóa tất cả processes cũ (nếu còn)
pm2 delete all

# Khởi động lại với port 3001 (hoặc port khác nếu cần)
PORT=3001 pm2 start npm --name "ctss" -- start

# Hoặc nếu muốn dùng port 3000:
pm2 start npm --name "ctss" -- start

# Lưu PM2 config
pm2 save

# Kiểm tra status
pm2 status
pm2 logs ctss --lines 30
```

### Bước 5: Nếu vẫn lỗi port, kiểm tra .env

```bash
cd /root/ctss
cat .env | grep PORT
```

Nếu PORT=3000 trong .env, có thể cần đổi sang port khác hoặc đảm bảo không có process nào khác đang dùng port 3000.
