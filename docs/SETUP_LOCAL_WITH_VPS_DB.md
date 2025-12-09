# Cấu hình Localhost dùng Database VPS

## Cách 1: SSH Tunnel (An toàn nhất - Khuyến nghị)

### Bước 1: Tạo SSH Tunnel

```bash
# Tạo tunnel từ local port 5433 đến VPS PostgreSQL (port 5432)
ssh -L 5433:localhost:5432 root@72.61.119.247 -N

# Giữ terminal này mở, mở terminal khác để làm việc
```

### Bước 2: Cập nhật .env.local

Tạo file `.env.local` trong thư mục root:

```env
# Dùng SSH tunnel (localhost:5433 -> VPS:5432)
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5433/ctss?schema=public"

# Hoặc nếu VPS dùng user khác:
# DATABASE_URL="postgresql://ctssuser:Ctss@2025@localhost:5433/ctss?schema=public"
```

**Lưu ý:** Thay `YOUR_PASSWORD` bằng password PostgreSQL trên VPS.

### Bước 3: Test kết nối

```bash
# Generate Prisma Client
npx prisma generate

# Test connection
npx prisma db pull
```

---

## Cách 2: Remote Connection (Cần mở port trên VPS)

### Bước 1: Mở port PostgreSQL trên VPS

```bash
# SSH vào VPS
ssh root@72.61.119.247

# Sửa PostgreSQL config để cho phép remote connection
sudo nano /etc/postgresql/14/main/postgresql.conf
# Tìm và sửa: listen_addresses = '*'

# Sửa pg_hba.conf
sudo nano /etc/postgresql/14/main/pg_hba.conf
# Thêm dòng:
# host    all             all             0.0.0.0/0               md5

# Restart PostgreSQL
sudo systemctl restart postgresql

# Mở firewall (nếu có)
sudo ufw allow 5432/tcp
```

### Bước 2: Cập nhật .env.local

```env
# Kết nối trực tiếp đến VPS
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@72.61.119.247:5432/ctss?schema=public"
```

**⚠️ Cảnh báo:** Cách này kém an toàn hơn vì mở port ra internet.

---

## Cách 3: Dùng ngrok (Nhanh nhất cho test)

### Bước 1: Cài ngrok trên VPS

```bash
# Trên VPS
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
tar xvzf ngrok-v3-stable-linux-amd64.tgz
sudo mv ngrok /usr/local/bin/
```

### Bước 2: Tạo tunnel trên VPS

```bash
# Trên VPS
ngrok tcp 5432
# Copy URL (ví dụ: tcp://0.tcp.ngrok.io:12345)
```

### Bước 3: Cập nhật .env.local

```env
# Dùng ngrok URL
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@0.tcp.ngrok.io:12345/ctss?schema=public"
```

---

## Sau khi cấu hình xong

1. **Restart dev server:**
```bash
# Dừng server hiện tại (Ctrl+C)
npm run dev
```

2. **Refresh trang CRM:**
```
http://localhost:3000/crm
```

3. **Bạn sẽ thấy 10 khách hàng đã tạo trên VPS!**

---

## Kiểm tra kết nối

```bash
# Test với Prisma Studio
npx prisma studio
# Mở http://localhost:5555 để xem database
```

---

## Troubleshooting

### Lỗi: "Connection refused"
- Kiểm tra SSH tunnel có đang chạy không
- Kiểm tra PostgreSQL trên VPS có đang chạy: `sudo systemctl status postgresql`

### Lỗi: "Password authentication failed"
- Kiểm tra password trong DATABASE_URL
- Test password: `psql -h localhost -p 5433 -U postgres -d ctss`

### Lỗi: "Database does not exist"
- Kiểm tra database name trong DATABASE_URL
- List databases: `psql -h localhost -p 5433 -U postgres -l`

