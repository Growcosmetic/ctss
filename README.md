# CTSS - Chí Tâm Salon System

Hệ thống quản lý salon chuyên nghiệp được xây dựng với Next.js 14, TypeScript, Prisma và PostgreSQL.

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **ORM**: Prisma
- **Database**: PostgreSQL
- **State Management**: Zustand
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 📁 Cấu trúc Project

```
ctss/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes (RESTful)
│   │   ├── bookings/      # Booking endpoints
│   │   ├── customers/     # Customer/CRM endpoints
│   │   ├── inventory/     # Inventory endpoints
│   │   ├── pos/           # POS/Transaction endpoints
│   │   ├── reports/       # Reports endpoints
│   │   ├── services/      # Services endpoints
│   │   ├── settings/      # Settings endpoints
│   │   └── staff/         # Staff endpoints
│   ├── dashboard/         # Dashboard module
│   ├── booking/           # Booking module
│   ├── crm/               # CRM module
│   ├── services/          # Services module
│   ├── inventory/         # Inventory module
│   ├── staff/             # Staff module
│   ├── pos/               # POS module
│   ├── reports/           # Reports module
│   └── settings/          # Settings module
├── components/
│   ├── layout/            # Layout components
│   │   ├── MainLayout.tsx # Main layout wrapper
│   │   ├── Sidebar.tsx    # Sidebar (240px)
│   │   └── Header.tsx     # Header (72px)
│   └── ui/                # Design System components
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Card.tsx
│       ├── Table.tsx
│       ├── Modal.tsx
│       ├── Drawer.tsx
│       ├── Tabs.tsx
│       └── Calendar.tsx
├── lib/                   # Utilities
│   ├── prisma.ts         # Prisma client
│   ├── utils.ts          # Helper functions
│   └── api-response.ts   # API response helpers
├── prisma/
│   └── schema.prisma     # Database schema (33 tables)
├── store/                # Zustand stores
│   ├── useAuthStore.ts  # Authentication store
│   └── useUIStore.ts    # UI state store
└── public/              # Static assets
```

## 🗄️ Database Schema

Database bao gồm 33 bảng được tổ chức theo các module:

### User & Authentication
- `User` - Người dùng hệ thống
- `UserPermission` - Phân quyền người dùng

### Staff Management
- `Staff` - Nhân viên
- `StaffShift` - Ca làm việc

### Customer Management (CRM)
- `Customer` - Khách hàng
- `LoyaltyHistory` - Lịch sử tích điểm

### Services
- `ServiceCategory` - Danh mục dịch vụ
- `Service` - Dịch vụ
- `StaffService` - Dịch vụ theo nhân viên

### Booking & Appointments
- `Booking` - Lịch hẹn
- `BookingItem` - Chi tiết lịch hẹn

### Inventory Management
- `ProductCategory` - Danh mục sản phẩm
- `Product` - Sản phẩm
- `InventoryLog` - Nhật ký kho

### POS & Transactions
- `Transaction` - Giao dịch
- `TransactionItem` - Chi tiết giao dịch
- `Payment` - Thanh toán

### Reports & Analytics
- `Report` - Báo cáo

### Settings
- `Setting` - Cài đặt hệ thống

### Notifications & Logs
- `Notification` - Thông báo
- `AuditLog` - Nhật ký kiểm toán

## 🛠️ Setup & Installation

### 1. Clone repository

```bash
git clone <repository-url>
cd ctss
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Cập nhật các giá trị trong `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/ctss?schema=public"
NEXT_PUBLIC_APP_URL=http://localhost:3000
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

### 4. Setup PostgreSQL Database

Tạo database PostgreSQL:

```sql
CREATE DATABASE ctss;
```

### 5. Run Prisma migrations

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Hoặc tạo migration
npm run db:migrate
```

### 6. Run development server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trong trình duyệt.

## 📚 API Routes

### Customers
- `GET /api/customers` - Lấy danh sách khách hàng
- `POST /api/customers` - Tạo khách hàng mới
- `GET /api/customers/[id]` - Lấy chi tiết khách hàng
- `PUT /api/customers/[id]` - Cập nhật khách hàng
- `DELETE /api/customers/[id]` - Xóa khách hàng

### Bookings
- `GET /api/bookings` - Lấy danh sách lịch hẹn
- `POST /api/bookings` - Tạo lịch hẹn mới
- `GET /api/bookings/[id]` - Lấy chi tiết lịch hẹn
- `PUT /api/bookings/[id]` - Cập nhật lịch hẹn
- `DELETE /api/bookings/[id]` - Hủy lịch hẹn

### Services
- `GET /api/services` - Lấy danh sách dịch vụ
- `POST /api/services` - Tạo dịch vụ mới
- `GET /api/services/[id]` - Lấy chi tiết dịch vụ
- `PUT /api/services/[id]` - Cập nhật dịch vụ
- `DELETE /api/services/[id]` - Xóa dịch vụ

### Staff
- `GET /api/staff` - Lấy danh sách nhân viên
- `POST /api/staff` - Tạo nhân viên mới
- `GET /api/staff/[id]` - Lấy chi tiết nhân viên
- `PUT /api/staff/[id]` - Cập nhật nhân viên
- `DELETE /api/staff/[id]` - Xóa nhân viên

### Inventory
- `GET /api/inventory` - Lấy danh sách sản phẩm
- `POST /api/inventory` - Tạo sản phẩm mới
- `GET /api/inventory/[id]` - Lấy chi tiết sản phẩm
- `PUT /api/inventory/[id]` - Cập nhật sản phẩm
- `DELETE /api/inventory/[id]` - Xóa sản phẩm

### POS
- `GET /api/pos` - Lấy danh sách giao dịch
- `POST /api/pos` - Tạo giao dịch mới
- `GET /api/pos/[id]` - Lấy chi tiết giao dịch

### Reports
- `GET /api/reports?type=SALES` - Tạo báo cáo doanh số
- `GET /api/reports?type=REVENUE` - Tạo báo cáo doanh thu
- `GET /api/reports?type=STAFF_PERFORMANCE` - Báo cáo hiệu suất nhân viên
- `GET /api/reports?type=CUSTOMER_ANALYTICS` - Phân tích khách hàng
- `GET /api/reports?type=INVENTORY` - Báo cáo kho
- `GET /api/reports?type=BOOKING` - Báo cáo lịch hẹn
- `POST /api/reports` - Lưu báo cáo

### Settings
- `GET /api/settings` - Lấy tất cả cài đặt
- `GET /api/settings?category=general` - Lấy cài đặt theo category
- `GET /api/settings?key=app_name` - Lấy cài đặt theo key
- `POST /api/settings` - Tạo/cập nhật cài đặt
- `PUT /api/settings` - Cập nhật nhiều cài đặt
- `GET /api/settings/[key]` - Lấy chi tiết cài đặt
- `PUT /api/settings/[key]` - Cập nhật cài đặt
- `DELETE /api/settings/[key]` - Xóa cài đặt

## 🎨 Design System

### Components

Tất cả components trong `components/ui/` đều tuân theo design system nhất quán:

- **Button**: Primary, Secondary, Outline, Ghost, Danger variants
- **Input**: Text input với label, error, helper text
- **Card**: Container với title, description, footer
- **Table**: Table với header, body, row, cell components
- **Modal**: Modal dialog với overlay
- **Drawer**: Side drawer từ trái/phải
- **Tabs**: Tab navigation component
- **Calendar**: Date picker component

### Layout

- **Sidebar**: 240px width, fixed position
- **Header**: 72px height, fixed position
- **Main Content**: Auto margin để tránh sidebar và header

## 📝 Scripts

```bash
# Development
npm run dev          # Chạy development server

# Build
npm run build        # Build production
npm run start        # Chạy production server

# Database
npm run db:generate  # Generate Prisma Client
npm run db:push      # Push schema to database
npm run db:migrate   # Run migrations
npm run db:studio    # Mở Prisma Studio

# Linting
npm run lint         # Chạy ESLint
```

## 🔒 Best Practices

1. **Type Safety**: Sử dụng TypeScript cho tất cả files
2. **Code Organization**: Tổ chức code theo module
3. **API Responses**: Sử dụng `successResponse` và `errorResponse` helpers
4. **Error Handling**: Xử lý lỗi đầy đủ trong API routes
5. **Database**: Sử dụng Prisma ORM cho type-safe database queries
6. **State Management**: Sử dụng Zustand cho global state
7. **Styling**: Sử dụng Tailwind CSS với utility classes
8. **Components**: Tái sử dụng components từ Design System

## 📄 License

MIT

## 👥 Contributors

- Chí Tâm Salon Team

---

Được phát triển với ❤️ bởi CTSS Team

