# PHASE 27 - FRANCHISE & PARTNER MODULE

## Tổng quan

Phase 27 biến CTSS thành một **PLATFORM B2B** cho ngành salon, cho phép quản lý nhiều salon đối tác, franchise, và thu phí license hàng tháng.

---

## 27A - Partner Structure & Data Isolation

### Models

#### Partner
- Thông tin salon đối tác
- License & plan (BASIC | PRO | ENTERPRISE)
- Data isolation hoàn toàn

#### Data Isolation
Mỗi partner có:
- Branches riêng
- Staff riêng
- Customers riêng
- Inventory riêng
- KPI riêng
- Marketing riêng

**KHÔNG thể nhìn thấy data của nhau.**

---

## 27B - Multi-Partner Authentication & Roles

### Roles

1. **Partner Owner**
   - Quyền cao nhất của partner
   - Xem toàn bộ salon của họ

2. **Manager**
   - Quản lý chi nhánh partner

3. **Stylist**
   - Xem: booking, khách, lịch, SOP

4. **Pha chế**
   - Xem: kho, pha chế

Tất cả đều bị giới hạn trong partner của họ.

---

## 27C - Partner-level Branch System

Partner có thể có nhiều chi nhánh (1-10+), tương tự Phase 26 nhưng thu nhỏ theo từng franchise.

---

## 27D - License Management

### Gói License

1. **BASIC - 1,500,000 VNĐ/tháng**
   - Booking
   - CRM
   - Inventory
   - SOP cơ bản

2. **PRO - 3,500,000 VNĐ/tháng**
   - AI Stylist Coach
   - Treatment Engine
   - Marketing Engine
   - QC Engine

3. **ENTERPRISE - 6,000,000 VNĐ/tháng**
   - Multi-branch
   - Inventory Intelligence
   - AI Forecasting
   - HQ support

### Tính năng
- Tự động nhắc thanh toán
- Khóa tính năng khi hết hạn
- Mở lại khi nhận thanh toán

---

## 27E - AI Partner Performance Tracking

AI phân tích từng partner:
- Doanh thu
- Lợi nhuận
- Tỷ lệ khách quay lại
- Tỷ lệ upsale
- Hao hụt
- Kỹ thuật
- CSKH
- Marketing performance

### API Endpoints

- `POST /api/partner/performance/analyze` - Phân tích hiệu suất partner

---

## 27F - Partner Quality & SOP Enforcement

HQ có thể:
- Push SOP xuống partner
- Áp dụng chuẩn kỹ thuật
- Tự động QC qua AI
- Chấm điểm partner theo tuần/tháng

### API Endpoints

- `POST /api/partner/sop/enforce` - Áp dụng SOP cho partner
- `POST /api/partner/quality/score` - Chấm điểm chất lượng partner

---

## 27G - HQ Command Center

### Tính năng

1. **Tình trạng toàn hệ thống**
   - Số partner
   - Số chi nhánh
   - Doanh thu
   - Lỗi kỹ thuật
   - Tồn kho
   - Cảnh báo AI

2. **Partner Ranking**
   - Partner hoạt động tốt
   - Partner cần hỗ trợ
   - Partner generate revenue tốt

3. **Tự động gửi notification**
   - Báo lỗi
   - Nhắc SOP
   - Gửi training
   - Gửi bản cập nhật hệ thống

4. **HQ Control Overrides**
   - Chỉnh bảng giá
   - Update SOP
   - Update AI model
   - Update quy trình

### API Endpoints

- `GET /api/partner/hq/dashboard` - HQ Dashboard
- `POST /api/partner/notification/create` - Tạo notification cho partner
- `POST /api/partner/create` - Tạo partner mới
- `GET /api/partner/list` - Danh sách partners
- `POST /api/partner/license/create` - Tạo license
- `GET /api/partner/license/check-expiry` - Kiểm tra license hết hạn

---

## Database Models

### Partner
```prisma
model Partner {
  id              String
  salonName       String
  ownerName       String?
  phone           String?
  email           String?
  plan            String   // BASIC | PRO | ENTERPRISE
  licenseStatus   String   // ACTIVE | EXPIRED | SUSPENDED | TRIAL
  licenseStartDate DateTime
  licenseEndDate   DateTime?
  isActive        Boolean
  ...
}
```

### License
```prisma
model License {
  id              String
  partnerId       String
  plan            String
  price           Float
  period          Int
  startDate       DateTime
  endDate         DateTime
  status          String   // ACTIVE | EXPIRED | SUSPENDED
  paymentStatus   String   // PENDING | PAID | OVERDUE
  ...
}
```

### PartnerPerformance
```prisma
model PartnerPerformance {
  id              String
  partnerId       String
  periodStart     DateTime
  periodEnd       DateTime
  revenue         Float
  profit          Float
  aiAnalysis      String?
  strengths       String[]
  weaknesses      String[]
  recommendations String[]
  ...
}
```

### PartnerQualityScore
```prisma
model PartnerQualityScore {
  id              String
  partnerId       String
  overallScore    Float
  sopCompliance   Float?
  errorCount      Int
  criticalErrors  Int
  ...
}
```

### SOPEnforcement
```prisma
model SOPEnforcement {
  id              String
  partnerId       String?
  sopId           String?
  enforcementLevel String  // REQUIRED | RECOMMENDED | OPTIONAL
  status          String
  ...
}
```

### HQNotification
```prisma
model HQNotification {
  id              String
  partnerId       String?
  type            String
  priority        String
  title           String
  message         String
  status          String
  ...
}
```

---

## Data Isolation Strategy

Tất cả các models quan trọng đã được thêm `partnerId`:
- `Branch` - branchId + partnerId
- `User` - partnerId (staff thuộc partner)
- `Customer` - qua branch → partner
- `Booking` - qua branch → partner
- `Invoice` - qua branch → partner
- `ProductStock` - qua branch → partner

**Queries luôn filter theo partnerId để đảm bảo data isolation.**

---

## Benefits

1. **Mở rộng nhanh**: Nhân bản mô hình salon
2. **Thu phí license**: 50-200 triệu VNĐ/tháng từ module này
3. **Kiểm soát chất lượng**: Đồng nhất SOP trên toàn hệ thống
4. **HQ Command Center**: Quản lý toàn bộ từ 1 màn hình
5. **Platform B2B**: Biến CTSS thành SaaS cho ngành salon

---

## Next Steps

1. Thêm UI cho HQ Dashboard
2. Thêm UI cho Partner Dashboard
3. Implement payment gateway cho license
4. Thêm email/SMS notifications
5. Thêm audit logs cho HQ actions

---

**Phase 27 hoàn thành 100%** ✅

CTSS đã trở thành một **FRANCHISE PLATFORM** hoàn chỉnh.

