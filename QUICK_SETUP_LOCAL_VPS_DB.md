# 🚀 Cấu hình Localhost dùng Database VPS (Nhanh nhất)

## Cách đơn giản nhất: SSH Tunnel

### Bước 1: Tạo SSH Tunnel

Mở terminal mới và chạy:

```bash
ssh -L 5433:localhost:5432 root@72.61.119.247 -N
```

**Giữ terminal này mở** (đừng đóng), mở terminal khác để làm việc tiếp.

### Bước 2: Tạo file .env.local

Trong thư mục project, tạo file `.env.local`:

```bash
# Copy từ .env nếu có
cp .env .env.local

# Hoặc tạo mới
touch .env.local
```

### Bước 3: Cập nhật DATABASE_URL

Mở file `.env.local` và thêm/sửa:

```env
# Dùng SSH tunnel (localhost:5433 -> VPS:5432)
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5433/ctss?schema=public"
```

**Lưu ý:** 
- Thay `YOUR_PASSWORD` bằng password PostgreSQL trên VPS
- Nếu không biết password, có thể dùng user `postgres` và password mặc định hoặc password bạn đã set

### Bước 4: Restart Dev Server

```bash
# Dừng server hiện tại (Ctrl+C nếu đang chạy)
# Rồi chạy lại:
npm run dev
```

### Bước 5: Refresh trang

Mở `http://localhost:3000/crm` và refresh → Bạn sẽ thấy 10 khách hàng từ VPS!

---

## Nếu không biết password PostgreSQL trên VPS

SSH vào VPS và kiểm tra:

```bash
ssh root@72.61.119.247
cd ~/ctss
cat .env | grep DATABASE_URL
```

Hoặc reset password:

```bash
sudo -u postgres psql
ALTER USER postgres WITH PASSWORD 'new_password';
\q
```

---

## Kiểm tra kết nối

```bash
# Test connection qua tunnel
psql -h localhost -p 5433 -U postgres -d ctss

# Hoặc dùng Prisma Studio
npx prisma studio
```

---

## Troubleshooting

### Lỗi: "Connection refused"
→ Kiểm tra SSH tunnel có đang chạy không (terminal phải mở)

### Lỗi: "Password authentication failed"  
→ Kiểm tra password trong DATABASE_URL

### Lỗi: "Database does not exist"
→ Kiểm tra database name (có thể là `ctss` hoặc `ctss_db`)

