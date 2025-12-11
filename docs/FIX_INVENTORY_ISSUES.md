# 🔧 SỬA LỖI INVENTORY MODULE

## 🐛 Các lỗi đã sửa

### 1. Import Excel API
**Vấn đề:**
- ❌ Vẫn dùng `supplier` (String) thay vì `supplierId`
- ❌ Không xử lý `sku`, `costPrice`, `isActive` khi import
- ❌ Không check SKU uniqueness

**Đã sửa:**
- ✅ Xử lý đúng `supplierId` (tìm supplier theo tên nếu chỉ có tên)
- ✅ Xử lý `sku` với check uniqueness
- ✅ Xử lý `costPrice` và `isActive`
- ✅ Auto-generate SKU nếu thiếu

### 2. API GET /api/inventory
**Vấn đề:**
- ⚠️ Không include supplier relation

**Đã sửa:**
- ✅ Include supplier relation trong response

## 📋 Hướng dẫn deploy VPS

### Bước 1: SSH vào VPS
```bash
ssh user@72.61.119.247
```

### Bước 2: Chạy các lệnh deploy
```bash
cd ~/ctss

# Pull code mới nhất
git pull origin main

# Cài đặt dependencies
npm install --legacy-peer-deps

# ⚠️ QUAN TRỌNG: Cập nhật database schema
npx prisma db push --accept-data-loss
npx prisma generate

# Build ứng dụng
npm run build

# Restart PM2
pm2 restart ctss

# Kiểm tra logs
pm2 logs ctss --lines 50
```

### Bước 3: Kiểm tra lỗi
Nếu có lỗi về SKU unique constraint:
```bash
# Kiểm tra duplicate SKU
psql -U your_user -d ctss -c "SELECT sku, COUNT(*) FROM \"Product\" WHERE sku IS NOT NULL GROUP BY sku HAVING COUNT(*) > 1;"

# Nếu có duplicate, cần update:
# UPDATE "Product" SET sku = sku || '-' || id WHERE id IN (...);
```

## 🔍 Kiểm tra sau khi deploy

1. **Truy cập:** `http://72.61.119.247/inventory`
2. **Kiểm tra:**
   - ✅ Danh sách sản phẩm hiển thị
   - ✅ Tạo sản phẩm mới với costPrice, isActive, sku
   - ✅ Import Excel hoạt động
   - ✅ Tab "Quản lý nhà cung cấp" hiển thị
   - ✅ Chuyển kho hoạt động (nếu có UI)

3. **Kiểm tra Console:**
   - Mở DevTools (F12)
   - Xem tab Console và Network
   - Kiểm tra các API calls có thành công không

## ⚠️ Lưu ý quan trọng

1. **Database Schema:** Phải chạy `npx prisma db push --accept-data-loss` trên VPS để cập nhật schema
2. **Prisma Client:** Phải chạy `npx prisma generate` để generate client mới
3. **SKU Unique:** Nếu có lỗi về SKU duplicate, cần xử lý data cũ trước

## 🆘 Nếu vẫn có lỗi

1. Kiểm tra PM2 logs: `pm2 logs ctss --lines 100`
2. Kiểm tra database connection
3. Kiểm tra Prisma schema sync: `npx prisma db pull` (xem có khác biệt không)
4. Kiểm tra API endpoints trong Network tab của browser
