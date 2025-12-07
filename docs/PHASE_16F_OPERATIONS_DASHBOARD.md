# Phase 16F - Operations Dashboard

Hệ thống Operations Dashboard tổng hợp toàn bộ SOP từ Phase 16A-16E thành một dashboard trực quan - Chí Tâm Hair Salon.

## 🎯 Mục tiêu

Tạo Operations Dashboard để:
- Theo dõi tiến trình real-time của tất cả bộ phận
- Tự động cảnh báo lỗi
- Tự động highlight bước còn thiếu
- Tính KPI vận hành
- Hiển thị hoạt động theo thời gian thực
- Gom tất cả SOP 16A–16E vào 1 dashboard

## 📋 Chức năng chính

### Tab 1: Real-time Monitoring
Hiển thị:
- Khách mới vào → Lễ tân step 1/7
- Khách đang tư vấn → Stylist step 2/7
- Khách đang pha thuốc → Assistant step 3/7
- Khách đang uốn/nhuộm → Stylist step 5/7
- Khách thanh toán → Step 6
- Khách follow-up → Online Step 7

### Tab 2: KPI Vận hành
Theo dõi:
- Tỉ lệ làm đúng SOP của mỗi bộ phận
- Tỉ lệ hoàn thành checklist
- Tốc độ phản hồi inbox
- Thời gian chờ trung bình
- Thời gian làm dịch vụ trung bình
- Lỗi vận hành phổ biến trong ngày
- Hiệu suất stylist / phụ việc / lễ tân

### Tab 3: Alerts & Warnings
Thông báo khi:
- Lễ tân quên cập nhật trạng thái khách > 5 phút
- Stylist đi sai SOP (ví dụ không ghi phiếu)
- Pha chế nhập sai số gram
- CSKH Online quá 3 phút chưa trả lời
- Bỏ sót follow-up sau dịch vụ
- Khách chờ quá lâu

## 🗂️ Files Structure

```
prisma/
└── schema.prisma              # Added OperationLog model

app/
├── api/
│   └── operations/
│       ├── log/
│       │   └── route.ts      # POST - Ghi log tự động
│       ├── dashboard/
│       │   └── route.ts      # GET - Lấy dashboard data
│       └── compliance/
│           └── route.ts      # POST - AI kiểm tra compliance
└── (dashboard)/
    └── operations/
        └── page.tsx          # Operations Dashboard UI

core/
└── prompts/
    └── sopCompliancePrompt.ts # AI prompt cho compliance check
```

## 📊 Prisma Model

### OperationLog

```prisma
model OperationLog {
  id         String   @id @default(cuid())
  userId     String?  // nhân sự thực hiện (optional vì có thể là AI/system)
  role       String   // receptionist | stylist | assistant | online
  sopStep    Int      // bước số mấy trong SOP (1-7)
  action     String   // mô tả hành động
  customerId String?
  timestamp  DateTime @default(now())
  meta       Json?    // Thông tin bổ sung (bookingId, serviceId, etc.)
  
  user     User?      @relation(fields: [userId], references: [id])
  customer Customer?  @relation(fields: [customerId], references: [id])
}
```

## 🚀 API Endpoints

### POST /api/operations/log

Ghi log hoạt động.

**Request:**
```json
{
  "userId": "user_id",
  "role": "receptionist",
  "sopStep": 1,
  "action": "Chào khách & Nhận nhu cầu",
  "customerId": "customer_id",
  "meta": {
    "bookingId": "booking_id"
  }
}
```

### GET /api/operations/dashboard

Lấy dữ liệu dashboard.

**Query Params:**
- `date`: YYYY-MM-DD (optional, default: today)
- `role`: receptionist | stylist | assistant | online (optional)

**Response:**
```json
{
  "success": true,
  "logs": [...],
  "kpi": {
    "totalActions": 100,
    "receptionist": 25,
    "stylist": 40,
    "assistant": 20,
    "online": 15,
    "stepCounts": { 1: 10, 2: 15, ... },
    "byRoleAndStep": { ... }
  },
  "activeCustomers": 5,
  "date": { ... }
}
```

### POST /api/operations/compliance

AI kiểm tra tuân thủ SOP.

**Request:**
```json
{
  "role": "receptionist",
  "date": "2024-01-01"
}
```

**Response:**
```json
{
  "success": true,
  "compliance": {
    "passed": true,
    "issues": [],
    "warnings": [],
    "suggestions": [],
    "summary": "...",
    "complianceRate": 95
  },
  "stats": { ... }
}
```

## 🔧 Tích hợp

### Tự động ghi log khi:

1. **Lễ tân nhận khách**:
   ```typescript
   await fetch("/api/operations/log", {
     method: "POST",
     body: JSON.stringify({
       userId: user.id,
       role: "receptionist",
       sopStep: 1,
       action: "Chào khách & Nhận nhu cầu",
       customerId: customer.id,
     }),
   });
   ```

2. **Stylist bắt đầu tư vấn**:
   ```typescript
   await fetch("/api/operations/log", {
     method: "POST",
     body: JSON.stringify({
       userId: stylist.id,
       role: "stylist",
       sopStep: 2,
       action: "Khảo sát tóc (Hair Diagnosis)",
       customerId: customer.id,
     }),
   });
   ```

3. **Assistant nhận phiếu**:
   ```typescript
   await fetch("/api/operations/log", {
     method: "POST",
     body: JSON.stringify({
       userId: assistant.id,
       role: "assistant",
       sopStep: 1,
       action: "Tiếp nhận phiếu dịch vụ từ Stylist",
       customerId: customer.id,
       meta: { bookingId: booking.id },
     }),
   });
   ```

4. **AI phân tích hình tóc**:
   ```typescript
   await fetch("/api/operations/log", {
     method: "POST",
     body: JSON.stringify({
       role: "online",
       sopStep: 3,
       action: "Gửi ảnh cho AI (Mina / AI Stylist Coach)",
       customerId: customer.id,
       meta: { photoUrl: photo.url },
     }),
   });
   ```

5. **CSKH nhắc lịch**:
   ```typescript
   await fetch("/api/operations/log", {
     method: "POST",
     body: JSON.stringify({
       userId: csUser.id,
       role: "online",
       sopStep: 7,
       action: "Follow-up trước lịch 12h",
       customerId: customer.id,
       meta: { bookingId: booking.id },
     }),
   });
   ```

## ✅ Phase 16F Checklist

- ✅ Prisma Model OperationLog
- ✅ API ghi log tự động
- ✅ API lấy dashboard data (KPI, logs)
- ✅ UI Dashboard với 3 tabs
- ✅ Real-time monitoring
- ✅ KPI vận hành
- ✅ AI Compliance Checker
- ✅ Tích hợp với 16A-16E
- ✅ Documentation

## 🎉 Kết quả

Sau Phase 16F, salon đã có:
- ✅ Operations Dashboard hoàn chỉnh
- ✅ KPI theo từng bộ phận
- ✅ Real-time salon monitoring
- ✅ AI phân tích vận hành → cảnh báo
- ✅ Trung tâm SOP hoàn chỉnh
- ✅ Hệ thống salon chuẩn quốc tế

**Không salon nào ở Việt Nam có hệ thống vận hành AI chuyên nghiệp như Chí Tâm Hair Salon!**

## 📊 Mục tiêu KPIs

- ⚡ **Real-time tracking**: 100% hoạt động được ghi log
- 📈 **Compliance rate**: > 90% tuân thủ SOP
- 🔍 **AI alerts**: Tự động phát hiện lỗi trong 5 phút
- 📊 **Dashboard update**: Real-time (mỗi 30 giây)

