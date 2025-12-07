# CTSS API Documentation

Tài liệu đầy đủ về tất cả API endpoints cho 9 module CTSS.

## 📋 Tổng quan

Tất cả API routes sử dụng:
- **Next.js 14 App Router** (`route.ts`)
- **Prisma Client** cho database operations
- **RESTful conventions**
- **Standardized response format**

### Response Format

**Success:**
```json
{
  "success": true,
  "data": {...},
  "message": "Optional message"
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message"
}
```

---

## 1. Dashboard API

### GET /api/dashboard
Lấy thống kê dashboard

**Query Parameters:**
- `dateFrom` (optional): Ngày bắt đầu
- `dateTo` (optional): Ngày kết thúc

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "todayRevenue": 0,
      "todayBookings": 0,
      "newCustomersToday": 0,
      "activeStaffToday": 0
    },
    "recentBookings": [...],
    "revenueChart": [...]
  }
}
```

---

## 2. Booking API

### GET /api/bookings
Lấy danh sách lịch hẹn

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)
- `status` (optional): PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW
- `customerId` (optional)
- `staffId` (optional)
- `date` (optional): YYYY-MM-DD

**Response:**
```json
{
  "success": true,
  "data": {
    "bookings": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

### POST /api/bookings
Tạo lịch hẹn mới

**Body:**
```json
{
  "customerId": "string",
  "staffId": "string (optional)",
  "bookingDate": "YYYY-MM-DD",
  "bookingTime": "ISO datetime",
  "duration": 60,
  "notes": "string (optional)",
  "items": [
    {
      "serviceId": "string",
      "price": 100000,
      "duration": 60,
      "notes": "string (optional)"
    }
  ],
  "createdById": "string"
}
```

### GET /api/bookings/[id]
Lấy chi tiết lịch hẹn

### PUT /api/bookings/[id]
Cập nhật lịch hẹn

**Body:**
```json
{
  "staffId": "string (optional)",
  "bookingDate": "YYYY-MM-DD (optional)",
  "bookingTime": "ISO datetime (optional)",
  "duration": 60,
  "status": "PENDING | CONFIRMED | IN_PROGRESS | COMPLETED | CANCELLED | NO_SHOW",
  "notes": "string (optional)"
}
```

### DELETE /api/bookings/[id]
Hủy lịch hẹn

**Body:**
```json
{
  "cancelledBy": "string (optional)"
}
```

---

## 3. CRM / Customers API

### GET /api/customers
Lấy danh sách khách hàng

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)
- `search` (optional): Tìm kiếm theo tên, email, phone
- `status` (optional): ACTIVE, INACTIVE, BLACKLISTED

### POST /api/customers
Tạo khách hàng mới

**Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string (optional)",
  "phone": "string",
  "dateOfBirth": "YYYY-MM-DD (optional)",
  "gender": "MALE | FEMALE | OTHER (optional)",
  "address": "string (optional)",
  "city": "string (optional)",
  "province": "string (optional)",
  "postalCode": "string (optional)"
}
```

### GET /api/customers/[id]
Lấy chi tiết khách hàng

### PUT /api/customers/[id]
Cập nhật khách hàng

**Body:** (tất cả fields optional)
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string",
  "dateOfBirth": "YYYY-MM-DD",
  "gender": "MALE | FEMALE | OTHER",
  "address": "string",
  "city": "string",
  "province": "string",
  "postalCode": "string",
  "status": "ACTIVE | INACTIVE | BLACKLISTED"
}
```

### DELETE /api/customers/[id]
Xóa khách hàng

---

## 4. Services API

### GET /api/services
Lấy danh sách dịch vụ

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)
- `categoryId` (optional)
- `isActive` (optional): true/false
- `search` (optional): Tìm kiếm theo tên, mô tả

### POST /api/services
Tạo dịch vụ mới

**Body:**
```json
{
  "categoryId": "string",
  "name": "string",
  "description": "string (optional)",
  "duration": 60,
  "image": "string (optional)",
  "sortOrder": 0
}
```

**Lưu ý:** Giá dịch vụ được quản lý riêng trong `service_prices` table.

### GET /api/services/[id]
Lấy chi tiết dịch vụ

### PUT /api/services/[id]
Cập nhật dịch vụ

**Body:** (tất cả fields optional)
```json
{
  "categoryId": "string",
  "name": "string",
  "description": "string",
  "duration": 60,
  "image": "string",
  "isActive": true,
  "sortOrder": 0
}
```

### DELETE /api/services/[id]
Vô hiệu hóa dịch vụ (soft delete)

---

## 5. Inventory API

### GET /api/inventory
Lấy danh sách sản phẩm

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)
- `categoryId` (optional)
- `isActive` (optional): true/false
- `lowStock` (optional): true - chỉ lấy sản phẩm sắp hết
- `search` (optional): Tìm kiếm theo tên, SKU, mô tả

### POST /api/inventory
Tạo sản phẩm mới

**Body:**
```json
{
  "categoryId": "string",
  "name": "string",
  "sku": "string (unique)",
  "description": "string (optional)",
  "cost": 50000,
  "price": 100000,
  "stockQuantity": 0,
  "minStockLevel": 10,
  "unit": "pcs",
  "image": "string (optional)",
  "supplierId": "string (optional)"
}
```

### GET /api/inventory/[id]
Lấy chi tiết sản phẩm (bao gồm lịch sử inventory logs)

### PUT /api/inventory/[id]
Cập nhật sản phẩm

**Body:** (tất cả fields optional)
```json
{
  "categoryId": "string",
  "name": "string",
  "sku": "string",
  "description": "string",
  "cost": 50000,
  "price": 100000,
  "stockQuantity": 0,
  "minStockLevel": 10,
  "unit": "pcs",
  "image": "string",
  "isActive": true,
  "supplierId": "string"
}
```

### DELETE /api/inventory/[id]
Vô hiệu hóa sản phẩm (soft delete)

---

## 6. Staff API

### GET /api/staff
Lấy danh sách nhân viên

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)
- `search` (optional): Tìm kiếm theo employeeId, position, tên
- `isActive` (optional): true/false

### POST /api/staff
Tạo nhân viên mới

**Body:**
```json
{
  "userId": "string",
  "employeeId": "string (unique)",
  "position": "string (optional)",
  "hireDate": "YYYY-MM-DD (optional)",
  "salary": 5000000,
  "commissionRate": 10.5,
  "specialization": ["string"]
}
```

### GET /api/staff/[id]
Lấy chi tiết nhân viên (bao gồm services, shifts)

### PUT /api/staff/[id]
Cập nhật nhân viên

**Body:** (tất cả fields optional)
```json
{
  "position": "string",
  "hireDate": "YYYY-MM-DD",
  "salary": 5000000,
  "commissionRate": 10.5,
  "specialization": ["string"],
  "isActive": true
}
```

### DELETE /api/staff/[id]
Vô hiệu hóa nhân viên (soft delete)

---

## 7. POS API

### GET /api/pos
Lấy danh sách đơn hàng POS

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)
- `status` (optional): PENDING, COMPLETED, CANCELLED, REFUNDED
- `type` (optional): SALE, RETURN, REFUND, SERVICE, PRODUCT, MIXED
- `dateFrom` (optional): YYYY-MM-DD
- `dateTo` (optional): YYYY-MM-DD

### POST /api/pos
Tạo đơn hàng POS mới

**Body:**
```json
{
  "customerId": "string (optional)",
  "staffId": "string (optional)",
  "bookingId": "string (optional)",
  "type": "SALE | RETURN | REFUND | SERVICE | PRODUCT | MIXED",
  "items": [
    {
      "serviceId": "string (optional)",
      "productId": "string (optional)",
      "name": "string",
      "quantity": 1,
      "price": 100000,
      "discount": 0
    }
  ],
  "discount": 0,
  "tax": 0,
  "paymentMethod": "CASH | CARD | TRANSFER | WALLET | CREDIT | OTHER",
  "notes": "string (optional)",
  "createdById": "string"
}
```

**Lưu ý:** 
- Tự động tạo inventory log khi bán sản phẩm
- Tự động giảm stock quantity

### GET /api/pos/[id]
Lấy chi tiết đơn hàng

### PUT /api/pos/[id]
Cập nhật đơn hàng

**Body:**
```json
{
  "status": "PENDING | COMPLETED | CANCELLED | REFUNDED",
  "discount": 0,
  "tax": 0,
  "notes": "string"
}
```

### DELETE /api/pos/[id]
Hủy đơn hàng

**Lưu ý:** 
- Nếu đơn hàng đã completed, tự động restore inventory
- Tạo inventory log với type RETURN

---

## 8. Reports API

### GET /api/reports
Tạo báo cáo

**Query Parameters:**
- `type` (required): SALES, REVENUE, STAFF_PERFORMANCE, CUSTOMER_ANALYTICS, INVENTORY, BOOKING, FINANCIAL, PAYROLL, CUSTOM
- `dateFrom` (optional): YYYY-MM-DD
- `dateTo` (optional): YYYY-MM-DD

**Response Examples:**

**SALES:**
```json
{
  "success": true,
  "data": {
    "period": { "from": "...", "to": "..." },
    "totalSales": 10000000,
    "totalOrders": 50,
    "averageOrder": 200000
  }
}
```

**REVENUE:**
```json
{
  "success": true,
  "data": {
    "period": { "from": "...", "to": "..." },
    "totalRevenue": 10000000,
    "byType": {
      "SERVICE": 5000000,
      "PRODUCT": 3000000,
      "MIXED": 2000000
    }
  }
}
```

**STAFF_PERFORMANCE:**
```json
{
  "success": true,
  "data": [
    {
      "staffId": "...",
      "employeeId": "EMP001",
      "totalSales": 5000000,
      "totalBookings": 20,
      "completedBookings": 18
    }
  ]
}
```

**CUSTOMER_ANALYTICS:**
```json
{
  "success": true,
  "data": {
    "totalCustomers": 100,
    "activeCustomers": 80,
    "newCustomers": 10,
    "topCustomers": [...]
  }
}
```

**INVENTORY:**
```json
{
  "success": true,
  "data": {
    "totalProducts": 50,
    "activeProducts": 45,
    "lowStockCount": 5,
    "lowStockItems": [...],
    "totalInventoryValue": 50000000
  }
}
```

**BOOKING:**
```json
{
  "success": true,
  "data": {
    "period": { "from": "...", "to": "..." },
    "totalBookings": 100,
    "byStatus": {
      "COMPLETED": 80,
      "CANCELLED": 10,
      "PENDING": 10
    },
    "completed": 80,
    "cancelled": 10
  }
}
```

### POST /api/reports
Lưu báo cáo

**Body:**
```json
{
  "type": "SALES",
  "title": "Báo cáo doanh số tháng 1",
  "filters": {...},
  "data": {...},
  "generatedBy": "string (optional)"
}
```

---

## 9. Settings API

### GET /api/settings
Lấy tất cả cài đặt

**Query Parameters:**
- `category` (optional): Lọc theo category
- `key` (optional): Lấy setting theo key

**Response:** (grouped by category nếu không có filter)
```json
{
  "success": true,
  "data": {
    "general": [...],
    "business": [...],
    "notifications": [...]
  }
}
```

### POST /api/settings
Tạo hoặc cập nhật cài đặt (upsert)

**Body:**
```json
{
  "key": "app_name",
  "value": "CTSS",
  "type": "STRING | NUMBER | BOOLEAN | JSON",
  "category": "general",
  "description": "Tên ứng dụng",
  "updatedBy": "string (optional)"
}
```

### PUT /api/settings
Cập nhật nhiều cài đặt cùng lúc

**Body:**
```json
{
  "settings": [
    {
      "key": "app_name",
      "value": "CTSS",
      "type": "STRING",
      "category": "general"
    }
  ],
  "updatedBy": "string (optional)"
}
```

### GET /api/settings/[key]
Lấy cài đặt theo key

### PUT /api/settings/[key]
Cập nhật cài đặt theo key

**Body:**
```json
{
  "value": "new value",
  "type": "STRING (optional)",
  "category": "string (optional)",
  "description": "string (optional)",
  "updatedBy": "string (optional)"
}
```

### DELETE /api/settings/[key]
Xóa cài đặt

---

## 📝 Notes

1. **Pagination:** Tất cả GET endpoints hỗ trợ pagination với `page` và `limit`
2. **Search:** Nhiều endpoints hỗ trợ tìm kiếm với parameter `search`
3. **Filtering:** Sử dụng query parameters để lọc dữ liệu
4. **Soft Delete:** DELETE thường là soft delete (set isActive = false)
5. **Validation:** Tất cả inputs được validate trước khi xử lý
6. **Error Handling:** Consistent error responses với HTTP status codes

## 🔒 Security

- Tất cả API routes cần authentication (sẽ được implement sau)
- Input validation cho tất cả requests
- SQL injection protection thông qua Prisma ORM

---

*Last updated: 2024*

