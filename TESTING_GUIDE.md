# 🚀 HƯỚNG DẪN TRẢI NGHIỆM CTSS

## Bước 1: Khởi động hệ thống

```bash
# Đảm bảo dependencies đã được cài đặt
npm install

# Setup database (nếu chưa có)
npm run db:generate
npm run db:push

# Khởi động dev server
npm run dev
```

Server sẽ chạy tại: **http://localhost:3000**

## Bước 2: Truy cập trang Test Dashboard

Mở trình duyệt và truy cập:

**👉 http://localhost:3000/test**

Trang này sẽ hiển thị:
- ✅ Real-time KPIs từ Control Tower
- ✅ Doanh thu, bookings, profit margin
- ✅ Links đến các API endpoints
- ✅ Overview 35 phases đã hoàn thành

## Bước 3: Test các API Endpoints chính

### 1. CEO Control Tower Dashboard
```bash
GET http://localhost:3000/api/control-tower/dashboard
```

### 2. Financial Dashboard
```bash
GET http://localhost:3000/api/financial/dashboard
```

### 3. Membership Dashboard
```bash
GET http://localhost:3000/api/membership/dashboard?type=ceo
```

### 4. Pricing Dashboard
```bash
GET http://localhost:3000/api/pricing/dashboard
```

## Bước 4: Test với Postman hoặc cURL

### Test Control Tower:
```bash
curl http://localhost:3000/api/control-tower/dashboard
```

### Test Financial Dashboard:
```bash
curl http://localhost:3000/api/financial/dashboard
```

## Lưu ý:

⚠️ **Nếu gặp lỗi authentication:**
- Cần đăng nhập trước hoặc setup authentication
- Một số endpoints yêu cầu ADMIN role

⚠️ **Nếu database chưa setup:**
- Chạy `npm run db:push` để sync schema
- Có thể seed data với `npm run db:seed` (nếu có)

## 🎉 Trải nghiệm các tính năng:

1. **CEO Dashboard** - Tổng quan toàn hệ thống
2. **Financial Module** - Quản lý tài chính
3. **Pricing Engine** - Dynamic pricing
4. **Membership System** - Loyalty & rewards
5. **Quality Control** - SOP enforcement
6. **AI Features** - Mina, predictions, analysis

---

**Enjoy testing! 🚀**

