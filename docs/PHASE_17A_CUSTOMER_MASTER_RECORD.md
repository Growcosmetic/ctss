# Phase 17A - Customer Master Record (CMR)

Hệ thống Customer Master Record (CMR) - "Hồ sơ bệnh án tóc" của từng khách hàng - Chí Tâm Hair Salon.

## 🎯 Mục tiêu

Tạo hệ thống CMR hoàn chỉnh để:
- Lưu hồ sơ khách hàng đầy đủ
- Track timeline dịch vụ từng lần
- Lưu ảnh trước/sau
- Lưu sản phẩm đã dùng (Phase 54)
- Tích hợp với AI Stylist Coach
- Tích hợp với Marketing cá nhân hóa
- Support follow-up và chăm sóc khách hàng

## 📋 Chức năng chính

### Customer Profile
- Thông tin cơ bản (tên, phone, birthday, gender)
- Avatar
- Risk level (LOW/MEDIUM/HIGH)
- Preferred stylist
- Total spent & total visits
- Notes

### Visit Timeline
- Lịch sử dịch vụ từng lần
- Stylist & Assistant
- Products used (với gram - Phase 54)
- Photos before/after
- Notes từ stylist
- Rating (1-5)
- Follow-up notes

## 🗂️ Files Structure

```
prisma/
└── schema.prisma              # Updated Customer model + New Visit model

app/
├── api/
│   ├── customers/
│   │   ├── create/
│   │   │   └── route.ts      # POST - Create customer
│   │   ├── get/
│   │   │   └── route.ts      # POST - Get customer
│   │   └── update/
│   │       └── route.ts      # POST - Update customer
│   └── visits/
│       ├── add/
│       │   └── route.ts      # POST - Add visit
│       └── getByCustomer/
│           └── route.ts      # POST - Get visits by customer
└── (dashboard)/
    └── customers/
        └── [id]/
            ├── page.tsx      # Customer Profile Page
            └── timeline.tsx  # Customer Timeline Component
```

## 📊 Prisma Models

### Customer (Updated)

```prisma
model Customer {
  id               String             @id @default(uuid())
  name             String
  phone            String             @unique
  birthday         DateTime?
  gender           String?
  avatar           String?            // ảnh đại diện
  notes            String?            // ghi chú tổng hợp
  riskLevel        String?            // LOW | MEDIUM | HIGH
  preferredStylist String?            // Stylist yêu thích
  totalSpent       Int                @default(0)
  totalVisits      Int                @default(0)
  journeyState     CustomerJourneyState @default(AWARENESS)
  createdAt        DateTime           @default(now())
  updatedAt        DateTime           @updatedAt

  visits Visit[]  // Timeline visits
  // ... other relations
}
```

### Visit (New)

```prisma
model Visit {
  id            String   @id @default(cuid())
  customerId    String
  date          DateTime @default(now())
  service       String   // ví dụ: Uốn nóng - Nhuộm màu - Phục hồi
  stylist       String?  // Tên stylist
  assistant     String?  // Tên assistant
  productsUsed  Json?    // danh sách sản phẩm + gram (Phase 54)
  photosBefore  String[] // ảnh before
  photosAfter   String[] // ảnh after
  notes         String?  // Ghi chú từ stylist
  rating        Int?     // điểm đánh giá (1-5)
  followUpNotes String?  // Ghi chú follow-up
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  customer Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
}
```

## 🚀 API Endpoints

### POST /api/customers/create

Tạo khách hàng mới.

**Request:**
```json
{
  "name": "Nguyễn Văn A",
  "phone": "0901234567",
  "birthday": "1990-01-01",
  "gender": "Nam",
  "avatar": "https://...",
  "notes": "...",
  "riskLevel": "LOW",
  "preferredStylist": "Chí Tâm"
}
```

### POST /api/customers/get

Lấy thông tin khách hàng.

**Request:**
```json
{
  "id": "customer_id"
}
// hoặc
{
  "phone": "0901234567"
}
```

**Response:**
```json
{
  "success": true,
  "customer": {
    "id": "...",
    "name": "...",
    "phone": "...",
    "totalSpent": 5000000,
    "totalVisits": 10,
    "visits": [...],
    "invoices": [...],
    "loyalty": {...}
  }
}
```

### POST /api/customers/update

Cập nhật thông tin khách hàng.

**Request:**
```json
{
  "id": "customer_id",
  "data": {
    "name": "...",
    "phone": "...",
    "riskLevel": "MEDIUM",
    // ... other fields
  }
}
```

### POST /api/visits/add

Thêm visit mới.

**Request:**
```json
{
  "customerId": "customer_id",
  "service": "Uốn nóng - Nhuộm màu",
  "stylist": "Chí Tâm",
  "assistant": "Nguyễn Văn B",
  "productsUsed": [
    { "name": "Plexis Hot Perm S1", "amount": 80 }
  ],
  "photosBefore": ["url1", "url2"],
  "photosAfter": ["url3"],
  "notes": "Tóc khỏe, vào nếp tốt",
  "rating": 5
}
```

### POST /api/visits/getByCustomer

Lấy timeline visits của khách hàng.

**Request:**
```json
{
  "customerId": "customer_id"
}
```

## 🎨 UI Pages

### /customers/[id]

Customer Profile Page:
- Hiển thị thông tin khách hàng
- Stats (total spent, total visits)
- Risk level badge
- Preferred stylist
- Edit mode để chỉnh sửa

### CustomerTimeline Component

Timeline Component:
- Hiển thị tất cả visits
- Before/After photos
- Products used
- Notes & rating
- Form để thêm visit mới

## ✅ Phase 17A Checklist

- ✅ Updated Customer model (avatar, riskLevel, preferredStylist, totalSpent, totalVisits)
- ✅ New Visit model
- ✅ API create/get/update customer
- ✅ API add/get visits
- ✅ UI Customer Profile Page
- ✅ UI Customer Timeline
- ✅ Integration ready (Stylist Coach, Phase 54, Marketing)

## 🔗 Tích hợp

### Stylist Coach
- AI biết lịch sử hóa chất từ `Visit.productsUsed`
- Risk level từ `Customer.riskLevel`
- Photos để phân tích

### Phase 54 - Product Tracking
- `Visit.productsUsed` lưu sản phẩm + gram
- Tự động update khi assistant ghi nhận

### CSKH Online
- Follow-up notes lưu vào `Visit.followUpNotes`
- Timeline để xem lịch sử

### Marketing (Phase 14)
- Risk level để phân segment
- Total visits/spent để đề xuất cá nhân hóa
- Preferred stylist để gửi message phù hợp

## 🎉 Kết quả

Sau Phase 17A, salon đã có:
- ✅ Hồ sơ khách hàng hoàn chỉnh (CMR)
- ✅ Timeline đầy đủ từng lần đến
- ✅ Lưu ảnh trước/sau
- ✅ Lưu tất cả sản phẩm đã dùng
- ✅ Lưu ghi chú stylist – lễ tân – online
- ✅ Chuẩn bị data cho AI phân tích hành vi

**Đây là nền tảng cốt lõi của CRM 360° – cực kỳ mạnh!**

