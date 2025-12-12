# 📋 TỔNG HỢP TẤT CẢ TÍNH NĂNG HỆ THỐNG CTSS

## 🌐 TRUY CẬP HỆ THỐNG

- **Local:** `http://localhost:3001`
- **VPS:** `http://72.61.119.247` hoặc `https://ctss.huynhchitam.com` (nếu đã setup domain)

---

## 🔐 ĐĂNG NHẬP

**Route:** `/login`

**Tài khoản mặc định:**
- Admin: `admin` / `admin123`
- Manager: `manager` / `manager123`
- Stylist: `stylist` / `stylist123`

---

## 📱 MENU CHÍNH (Theo Role)

### 👤 ADMIN & MANAGER

#### 1. 📊 Dashboard
**Route:** `/dashboard`
- Tổng quan doanh thu, khách hàng, nhân viên
- Biểu đồ thống kê
- Staff Performance Table
- Recent Activities

#### 2. 📅 Đặt lịch
**Route:** `/booking`
- Xem lịch hẹn theo ngày/tuần/tháng
- Tạo lịch hẹn mới
- Filter theo stylist, dịch vụ
- Cập nhật trạng thái booking

#### 3. 👥 CRM (Quản lý khách hàng)
**Route:** `/crm`
- **Danh sách khách hàng:**
  - Search, filter (nhóm, trạng thái, tag)
  - Import/Export Excel
  - Thêm/sửa/xóa khách hàng
  - Xem chi tiết khách hàng
- **Quản lý nhóm:** Tạo, sửa, xóa nhóm khách hàng
- **Tags tự động:** Phân loại khách hàng tự động
- **Thống kê:** Biểu đồ và báo cáo khách hàng
- **Sub-pages:**
  - `/crm/automation` - Tự động hóa CRM
  - `/crm/dashboard` - Dashboard CRM
  - `/crm/reminders` - Nhắc nhở
  - `/crm/segmentation` - Phân khúc khách hàng

#### 4. ✂️ Dịch vụ
**Route:** `/services`
- Danh sách dịch vụ
- Tạo/sửa/xóa dịch vụ
- Phân loại dịch vụ
- Quản lý giá, thời gian
- **Sub-page:** `/services/cost` - Phân tích chi phí dịch vụ

#### 5. 📦 Kho hàng (Inventory)
**Route:** `/inventory`
- **Tổng thể kho:**
  - Tổng quan tồn kho
  - Cảnh báo tồn kho thấp
  - Giá trị tồn kho
- **Danh sách sản phẩm:**
  - Grid/List view
  - Search, filter (category, status, location, brand)
  - Pagination
  - Tạo/sửa sản phẩm
  - Import/Export Excel
- **Quản lý nhà cung cấp:**
  - CRUD nhà cung cấp
  - Import/Export Excel
  - Liên kết với sản phẩm
- **Quản lý kho hàng:**
  - **Danh sách tồn kho:**
    - Xem tồn kho theo sản phẩm
    - Stock Action Menu (History, Balance, Edit Price, Edit Stock Levels)
    - Filter, search, pagination
  - **Phiếu nhập kho:**
    - Tạo/sửa/xóa phiếu nhập
    - 3 loại nhập: Nhập mua từ NCC, Nhập hàng trả lại, Nhập đóng gói
    - Giảm giá từng sản phẩm và toàn bộ
    - Filter, search, export Excel
  - **Phiếu xuất kho:**
    - Tạo/sửa/xóa phiếu xuất
    - 12 phân loại xuất: Tiêu hao, Đào tạo, Bán học viên, Trả hàng NCC, v.v.
    - Filter, search, export Excel
    - Nút "Xuất sang kho nội bộ" (Di chuyển kho)
  - **Di chuyển kho:**
    - Chuyển sản phẩm giữa các chi nhánh
    - Chọn kho đích, quản lý sản phẩm
  - **Chép từ chi nhánh:** Copy dữ liệu từ chi nhánh khác
  - **Tạo dữ liệu mẫu:** Seed data cho testing

#### 6. 👨‍💼 Quản lý nhân viên
**Route:** `/staff-management`
- Danh sách nhân viên
- Tạo nhân viên mới (tự động sinh mã NV)
- Sửa thông tin nhân viên
- Xem chi tiết nhân viên
- Vô hiệu hóa nhân viên
- Filter (trạng thái, vai trò)
- Search (tên, SĐT, mã NV)
- Pagination

#### 7. 🛒 POS (Point of Sale)
**Route:** `/pos`
- Thanh toán tại quầy
- Tạo hóa đơn
- Quản lý giỏ hàng
- Tính tiền, in hóa đơn

#### 8. 📈 Báo cáo
**Route:** `/reports`
- Báo cáo tổng hợp
- **Sub-pages:**
  - `/reports/daily` - Báo cáo ngày
  - `/reports/monthly` - Báo cáo tháng

#### 9. 🤖 Mina AI
**Route:** `/mina`
- AI Assistant
- Chat với AI
- Hỗ trợ tư vấn

#### 10. ⚙️ Cài đặt
**Route:** `/settings`
- Cấu hình hệ thống
- Quản lý người dùng
- Cài đặt chung

---

### 👨‍💼 STYLIST & ASSISTANT

#### 1. 📊 Dashboard
**Route:** `/dashboard`
- Xem dashboard cá nhân
- Lịch làm việc hôm nay

#### 2. 📅 Đặt lịch
**Route:** `/booking`
- Xem lịch hẹn của mình
- Cập nhật trạng thái dịch vụ

#### 3. 👥 CRM
**Route:** `/crm`
- Xem danh sách khách hàng
- Tìm kiếm khách hàng
- Xem chi tiết khách hàng

#### 4. ✂️ Dịch vụ
**Route:** `/services`
- Xem danh sách dịch vụ
- Tìm kiếm dịch vụ

#### 5. 👨‍💼 Nhân viên (Lịch làm việc)
**Route:** `/staff`
- Xem lịch hẹn hôm nay
- Thông tin khách hàng nhanh
- Checklist dịch vụ
- Bắt đầu/Hoàn thành dịch vụ
- Thông báo

#### 6. 🤖 Mina AI
**Route:** `/mina`
- AI Assistant
- Chat với AI

---

### 👤 RECEPTIONIST

#### 1. 📊 Dashboard
#### 2. 📅 Đặt lịch
#### 3. 👥 CRM
#### 4. ✂️ Dịch vụ
#### 5. 📦 Kho hàng
#### 6. 🛒 POS
#### 7. 🤖 Mina AI

---

## 📱 CUSTOMER APP (Ứng dụng khách hàng)

**Base Route:** `/customer-app`

### 1. 🏠 Trang chủ
**Route:** `/customer-app/home`
- Thông tin salon
- Dịch vụ nổi bật
- Khuyến mãi

### 2. 📅 Đặt lịch
**Route:** `/customer-app/book`
- Chọn dịch vụ
- Chọn stylist
- Chọn ngày giờ
- Xác nhận booking

### 3. 📋 Lịch hẹn của tôi
**Route:** `/customer-app/bookings`
- Xem danh sách booking
- Hủy booking
- Xem chi tiết

### 4. 👤 Hồ sơ
**Route:** `/customer-app/profile`
- Thông tin cá nhân
- Lịch sử dịch vụ
- Điểm tích lũy

### 5. 🎁 Khuyến mãi
**Route:** `/customer-app/promotions`
- Xem khuyến mãi hiện có
- Mã giảm giá

### 6. ⭐ Điểm tích lũy
**Route:** `/customer-app/loyalty`
- Xem điểm tích lũy
- Lịch sử tích điểm
- Đổi quà

### 7. 💡 Gợi ý
**Route:** `/customer-app/recommendations`
- Dịch vụ gợi ý
- Sản phẩm gợi ý

### 8. 🔔 Thông báo
**Route:** `/customer-app/notifications`
- Thông báo từ salon
- Nhắc nhở lịch hẹn

---

## 🎯 TÍNH NĂNG CHI TIẾT

### 📦 KHO HÀNG (Inventory)

#### Tổng thể kho
- Tổng quan tồn kho
- Cảnh báo tồn kho thấp
- Giá trị tồn kho (theo giá vốn/bán)

#### Danh sách sản phẩm
- **View:** Grid/List toggle
- **Search:** Tên, SKU
- **Filter:**
  - Category (sidebar)
  - Status (in_stock, out_of_stock, low_stock, negative)
  - Location (Zone, Rack, Shelf, Bin)
  - Brand
- **Pagination:** 20 items/page
- **Actions:**
  - Tạo sản phẩm mới
  - Sửa sản phẩm
  - Xem chi tiết
  - Import/Export Excel
  - Chép từ chi nhánh
  - Tạo dữ liệu mẫu

#### Quản lý nhà cung cấp
- CRUD nhà cung cấp
- Import/Export Excel
- Liên kết với sản phẩm

#### Quản lý kho hàng

##### Danh sách tồn kho
- Xem tồn kho theo sản phẩm
- **Stock Action Menu:**
  - Lịch sử (History)
  - Cân bằng (Balance)
  - Sửa giá (Edit Price)
  - Sửa mức tồn kho (Edit Stock Levels)
  - Các lô hàng (đang phát triển)

##### Phiếu nhập kho
- **Tạo phiếu nhập:**
  - Mã phiếu (tự động sinh)
  - Nhà cung cấp
  - Phân loại nhập (3 loại)
  - Ngày nhập
  - Danh sách sản phẩm:
    - Giá, số lượng
    - Giảm giá từng sản phẩm (% hoặc số tiền)
  - Giảm giá toàn bộ (% hoặc số tiền)
  - Tổng giá trị nhập (tự động tính)
  - Lưu nháp / Hoàn thành
- **Danh sách phiếu nhập:**
  - Filter: Mã phiếu, Nhà cung cấp, Tình trạng, Phân loại, Date range
  - Search
  - Export Excel
  - Pagination
  - Xem/Sửa/Xóa (chỉ DRAFT)

##### Phiếu xuất kho
- **Tạo phiếu xuất:**
  - Mã phiếu (tự động sinh)
  - Người nhận
  - Phân loại xuất (12 loại):
    - Xuất tiêu hao
    - Xuất đào tạo
    - Xuất bán học viên
    - Xuất trả hàng NCC
    - Xuất huỷ vì hỏng hóc
    - Xuất cho/tặng
    - Xuất đóng gói
    - Xuất hàng SVC
    - Xuất khác
    - Bán hàng
    - Sử dụng
    - Bán nhân viên
  - Danh sách sản phẩm:
    - Số lượng (với +/- buttons)
    - Giá xuất
    - Tổng tiền
  - Lưu nháp / Hoàn thành
- **Danh sách phiếu xuất:**
  - Filter: Mã phiếu, Tình trạng, Phân loại, Date range
  - Search
  - Export Excel
  - Pagination
  - Xem/Sửa/Xóa (chỉ DRAFT)
  - Nút "Xuất sang kho nội bộ"

##### Di chuyển kho
- **Tạo phiếu chuyển kho:**
  - Chọn kho đích
  - Danh sách sản phẩm chuyển:
    - Phân loại (Công cụ/Hóa chất/Khác)
    - Tình trạng (Mới/Đã qua sử dụng)
    - Giá nhập
    - Số lượng
  - Ghi chú
  - Nhập vào kho

---

### 👥 CRM (Customer Relationship Management)

#### Danh sách khách hàng
- **View:** Table với columns:
  - Tên, SĐT, Nhóm, Tags, Tổng chi tiêu, Lần đến, Trạng thái
- **Search:** Tên, SĐT
- **Filter:**
  - Nhóm khách hàng
  - Trạng thái (Active, Inactive, Risk)
  - Tags
- **Actions:**
  - Thêm khách hàng mới
  - Sửa khách hàng
  - Xem chi tiết
  - Import/Export Excel
  - Quản lý nhóm
  - Thống kê khách hàng

#### Chi tiết khách hàng
- Thông tin cơ bản
- Lịch sử dịch vụ
- Timeline
- Tags
- Nhóm
- Ghi chú

#### Quản lý nhóm
- Tạo/sửa/xóa nhóm
- Gán khách hàng vào nhóm

#### Tags tự động
- Phân loại khách hàng tự động
- Quản lý tags

#### Thống kê
- Biểu đồ khách hàng
- Báo cáo chi tiết

---

### 👨‍💼 QUẢN LÝ NHÂN VIÊN

#### Danh sách nhân viên
- **Columns:**
  - Mã NV, Tên, SĐT, Vai trò, Vị trí, Lương, Trạng thái
- **Search:** Tên, SĐT, mã NV
- **Filter:**
  - Trạng thái (Đang hoạt động / Đã vô hiệu hóa)
  - Vai trò (Stylist, Phụ tá, Lễ tân)
- **Pagination:** 20 items/page
- **Actions:**
  - Xem chi tiết
  - Sửa nhân viên
  - Vô hiệu hóa nhân viên

#### Tạo nhân viên mới
- **Thông tin cơ bản:**
  - Tên nhân viên *
  - Số điện thoại *
  - Mật khẩu *
  - Vai trò * (STYLIST, ASSISTANT, RECEPTIONIST)
  - Chi nhánh
- **Thông tin nhân viên:**
  - Mã nhân viên (tự động sinh nếu để trống: NV0001, NV0002...)
  - Vị trí
  - Ngày vào làm
  - Lương cơ bản (₫)
  - Tỷ lệ hoa hồng (%)
  - Chuyên môn
- **Dịch vụ có thể làm:**
  - Chọn nhiều dịch vụ từ danh sách

#### Sửa nhân viên
- Sửa vị trí, lương, hoa hồng, chuyên môn
- Không thể sửa SĐT, mật khẩu, vai trò

#### Xem chi tiết
- Thông tin cơ bản
- Thông tin lương
- Chuyên môn
- Dịch vụ có thể làm
- Trạng thái

---

## 🔧 API ENDPOINTS CHÍNH

### Authentication
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user hiện tại

### Staff Management
- `GET /api/staff` - Danh sách nhân viên
- `POST /api/staff` - Tạo nhân viên mới
- `GET /api/staff/[id]` - Chi tiết nhân viên
- `PUT /api/staff/[id]` - Cập nhật nhân viên
- `DELETE /api/staff/[id]` - Vô hiệu hóa nhân viên
- `GET /api/branches/[id]/staff` - Nhân viên theo chi nhánh

### Inventory
- `GET /api/inventory/product/list` - Danh sách sản phẩm
- `POST /api/inventory/product` - Tạo sản phẩm
- `GET /api/inventory/receipts` - Danh sách phiếu nhập
- `POST /api/inventory/receipts` - Tạo phiếu nhập
- `GET /api/inventory/issues` - Danh sách phiếu xuất
- `POST /api/inventory/issues` - Tạo phiếu xuất
- `POST /api/inventory/transfer` - Di chuyển kho

### CRM
- `GET /api/customers` - Danh sách khách hàng
- `POST /api/customers` - Tạo khách hàng
- `GET /api/crm/groups` - Danh sách nhóm
- `POST /api/crm/customers/import` - Import Excel

### Services
- `GET /api/services` - Danh sách dịch vụ
- `POST /api/services` - Tạo dịch vụ

### Booking
- `GET /api/bookings` - Danh sách booking
- `POST /api/bookings` - Tạo booking

---

## 🎨 UI/UX FEATURES

### Responsive Design
- Mobile-friendly
- Tablet support
- Desktop optimized

### Components
- Modal dialogs
- Forms với validation
- Tables với pagination
- Search & Filter
- Dropdowns
- Date pickers
- File upload (Excel)

### Icons
- Lucide React icons
- Consistent iconography

---

## 🔒 BẢO MẬT

### Authentication
- Token-based authentication
- Role-based access control (RBAC)
- Password hashing (bcryptjs)

### Authorization
- ADMIN: Full access
- MANAGER: Branch-level access
- RECEPTIONIST: Limited access
- STYLIST/ASSISTANT: Personal access

---

## 📊 DATABASE MODELS

### Core Models
- `User` - Người dùng/Nhân viên
- `Staff` - Thông tin nhân viên (mới thêm)
- `Customer` - Khách hàng
- `Branch` - Chi nhánh
- `Service` - Dịch vụ
- `Product` - Sản phẩm
- `Booking` - Lịch hẹn
- `Invoice` - Hóa đơn

### Inventory Models
- `ProductStock` - Tồn kho sản phẩm
- `StockTransaction` - Giao dịch kho
- `StockReceipt` - Phiếu nhập kho
- `StockReceiptItem` - Chi tiết phiếu nhập
- `StockIssue` - Phiếu xuất kho
- `StockIssueItem` - Chi tiết phiếu xuất
- `StockTransfer` - Chuyển kho
- `Supplier` - Nhà cung cấp
- `Location` - Vị trí trong kho

### CRM Models
- `CustomerGroup` - Nhóm khách hàng
- `CustomerTag` - Tags khách hàng
- `CustomerTouchpoint` - Điểm chạm khách hàng

---

## 🚀 DEPLOYMENT

### Local Development
```bash
npm run dev
# Server: http://localhost:3001
```

### Production Build
```bash
npm run build
npm start
```

### VPS Deployment
- **IP:** 72.61.119.247
- **Domain:** ctss.huynhchitam.com (nếu đã setup)
- **PM2:** `pm2 restart ctss`

---

## ✅ CHECKLIST KIỂM TRA TÍNH NĂNG

### Core Features
- [x] Đăng nhập/Đăng xuất
- [x] Dashboard
- [x] Đặt lịch
- [x] CRM
- [x] Dịch vụ
- [x] Kho hàng
- [x] Quản lý nhân viên
- [x] POS
- [x] Báo cáo
- [x] Mina AI

### Inventory Features
- [x] Tổng thể kho
- [x] Danh sách sản phẩm (Grid/List)
- [x] Tạo/sửa sản phẩm
- [x] Import/Export Excel
- [x] Quản lý nhà cung cấp
- [x] Phiếu nhập kho (với giảm giá)
- [x] Phiếu xuất kho (12 phân loại)
- [x] Di chuyển kho
- [x] Filter, Search, Pagination

### Staff Management
- [x] Danh sách nhân viên
- [x] Tạo nhân viên mới
- [x] Sửa nhân viên
- [x] Xem chi tiết
- [x] Vô hiệu hóa nhân viên
- [x] Filter, Search, Pagination

### CRM Features
- [x] Danh sách khách hàng
- [x] Tạo/sửa khách hàng
- [x] Quản lý nhóm
- [x] Tags tự động
- [x] Import/Export Excel
- [x] Thống kê

---

## 📝 GHI CHÚ

1. **Build Warnings:** Một số API routes có warning về dynamic server usage (dùng cookies, request.url) - đây là bình thường và không ảnh hưởng runtime.

2. **Database:** Đảm bảo PostgreSQL đang chạy và DATABASE_URL đúng trong `.env`

3. **Environment Variables:**
   - `DATABASE_URL` - PostgreSQL connection string
   - `NEXT_PUBLIC_APP_URL` - App URL
   - `OPENAI_API_KEY` - (nếu dùng AI features)

4. **Testing:** Có thể dùng "Tạo dữ liệu mẫu" trong Inventory để test nhanh.

---

**🎉 Hệ thống đã sẵn sàng để sử dụng!**
