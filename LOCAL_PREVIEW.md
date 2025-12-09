# 🖥️ Xem Trước Local Trước Khi Đẩy Lên VPS

## 📋 Bước 1: Cài đặt Dependencies (nếu chưa có)

```bash
npm install
```

## 📋 Bước 2: Tạo file `.env.local`

Tạo file `.env.local` trong thư mục gốc với nội dung:

```bash
# Database (có thể dùng SQLite cho local hoặc PostgreSQL)
DATABASE_URL="postgresql://ctssuser:Ctss@2025@localhost:5432/ctss"
# Hoặc dùng SQLite cho đơn giản:
# DATABASE_URL="file:./dev.db"

# Auth Secret
NEXTAUTH_SECRET="somesecret123"

# OpenAI (có thể để fake key cho local)
OPENAI_API_KEY="sk-proj-fake-key-cho-qua-build-123456"
```

## 📋 Bước 3: Setup Database (nếu dùng PostgreSQL)

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed users (nếu cần)
node seed-users-manual.js
```

## 📋 Bước 4: Chạy Dev Server

```bash
npm run dev
```

Sau đó mở trình duyệt: **http://localhost:3000**

## 📋 Bước 5: Test Booking Page

Truy cập: **http://localhost:3000/booking**

## ✅ Checklist Trước Khi Đẩy Lên VPS

- [ ] Code chạy OK trên local
- [ ] UI hiển thị đúng như mong muốn
- [ ] Không có lỗi console
- [ ] Test các tính năng chính (login, booking, check-in)
- [ ] Commit và push code lên GitHub
- [ ] Pull và build trên VPS

## 🚀 Workflow Đề Xuất

1. **Sửa code** → Test local (`npm run dev`)
2. **Xem trước** → Kiểm tra UI/UX
3. **Commit** → `git add . && git commit -m "..." && git push`
4. **Deploy VPS** → SSH vào VPS và chạy:
   ```bash
   cd ~/ctss
   git pull origin main
   npm run build
   pm2 restart ctss
   ```

## 💡 Tips

- **Hot Reload**: Dev server tự động reload khi bạn sửa code
- **Console Logs**: Mở DevTools (F12) để xem logs
- **Network Tab**: Kiểm tra API calls
- **Responsive**: Test trên mobile (F12 → Toggle device toolbar)

## 🔧 Troubleshooting

### Port 3000 đã được sử dụng?
```bash
# Tìm process đang dùng port 3000
lsof -ti:3000 | xargs kill -9

# Hoặc chạy trên port khác
PORT=3001 npm run dev
```

### Database connection error?
- Kiểm tra PostgreSQL đang chạy: `pg_isready`
- Kiểm tra `.env.local` có đúng `DATABASE_URL` không
- Hoặc dùng SQLite cho đơn giản: `DATABASE_URL="file:./dev.db"`

### Build errors?
- Xóa `.next` folder: `rm -rf .next`
- Chạy lại: `npm run dev`

