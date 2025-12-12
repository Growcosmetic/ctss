# 🧪 HƯỚNG DẪN TEST TẤT CẢ TÍNH NĂNG

## 🚀 BẮT ĐẦU

**Server đang chạy tại:** `http://localhost:3001`

---

## 1️⃣ ĐĂNG NHẬP

1. Truy cập: `http://localhost:3001/login`
2. Đăng nhập với:
   - **Admin:** `admin` / `admin123`
   - **Manager:** `manager` / `manager123`

---

## 2️⃣ DASHBOARD

**Route:** `http://localhost:3001/dashboard`

**Kiểm tra:**
- ✅ Tổng quan doanh thu, khách hàng, nhân viên
- ✅ Biểu đồ thống kê
- ✅ Staff Performance Table (nếu là Admin/Manager)
- ✅ Recent Activities

---

## 3️⃣ ĐẶT LỊCH

**Route:** `http://localhost:3001/booking`

**Test:**
1. Xem lịch hẹn theo ngày/tuần/tháng
2. Tạo lịch hẹn mới
3. Filter theo stylist, dịch vụ
4. Cập nhật trạng thái booking

---

## 4️⃣ CRM (QUẢN LÝ KHÁCH HÀNG)

**Route:** `http://localhost:3001/crm`

### Test Danh sách khách hàng:
1. ✅ Xem danh sách khách hàng
2. ✅ Search khách hàng (tên, SĐT)
3. ✅ Filter theo nhóm, trạng thái, tags
4. ✅ Click "Thêm mới" → Tạo khách hàng mới
5. ✅ Click vào một khách hàng → Xem chi tiết
6. ✅ Click "Nhập từ tệp excel" → Test import Excel
7. ✅ Click "Quản lý nhóm" → Tạo/sửa nhóm
8. ✅ Click "Thống kê khách hàng" → Xem biểu đồ

### Test Sub-pages:
- `http://localhost:3001/crm/automation` - Tự động hóa CRM
- `http://localhost:3001/crm/dashboard` - Dashboard CRM
- `http://localhost:3001/crm/segmentation` - Phân khúc khách hàng

---

## 5️⃣ DỊCH VỤ

**Route:** `http://localhost:3001/services`

**Test:**
1. ✅ Xem danh sách dịch vụ
2. ✅ Tạo dịch vụ mới
3. ✅ Sửa dịch vụ
4. ✅ Filter theo category
5. ✅ Search dịch vụ

---

## 6️⃣ KHO HÀNG (INVENTORY)

**Route:** `http://localhost:3001/inventory`

### Test Tổng thể kho:
1. ✅ Xem tổng quan tồn kho
2. ✅ Xem cảnh báo tồn kho thấp
3. ✅ Xem giá trị tồn kho

### Test Danh sách sản phẩm:
1. ✅ Chuyển giữa Grid/List view
2. ✅ Search sản phẩm
3. ✅ Filter theo category (sidebar)
4. ✅ Filter theo status, location, brand
5. ✅ Click "Tạo sản phẩm mới" → Tạo sản phẩm
6. ✅ Click vào sản phẩm → Xem/sửa
7. ✅ Click "Nhập từ Excel" → Test import
8. ✅ Click "Xuất ra Excel" → Test export
9. ✅ Click "Tạo dữ liệu mẫu" → Seed data

### Test Quản lý nhà cung cấp:
1. ✅ Xem danh sách nhà cung cấp
2. ✅ Tạo nhà cung cấp mới
3. ✅ Sửa nhà cung cấp
4. ✅ Import/Export Excel

### Test Quản lý kho hàng:

#### Danh sách tồn kho:
1. ✅ Xem danh sách tồn kho
2. ✅ Click vào menu "..." của một sản phẩm:
   - Lịch sử (History)
   - Cân bằng (Balance)
   - Sửa giá (Edit Price)
   - Sửa mức tồn kho (Edit Stock Levels)

#### Phiếu nhập kho:
1. ✅ Click tab "Phiếu nhập kho"
2. ✅ Click "Tạo phiếu nhập" → Test tạo phiếu:
   - Chọn nhà cung cấp
   - Chọn phân loại nhập
   - Thêm sản phẩm
   - Nhập giá, số lượng
   - Test giảm giá từng sản phẩm (% và số tiền)
   - Test giảm giá toàn bộ (% và số tiền)
   - Xem tổng giá trị nhập (tự động tính)
   - Lưu nháp / Hoàn thành
3. ✅ Xem danh sách phiếu nhập:
   - Filter: Mã phiếu, Nhà cung cấp, Tình trạng, Phân loại, Date range
   - Search
   - Export Excel
   - Xem/Sửa/Xóa (chỉ DRAFT)

#### Phiếu xuất kho:
1. ✅ Click tab "Phiếu xuất kho"
2. ✅ Click "Tạo phiếu xuất" → Test tạo phiếu:
   - Chọn người nhận
   - Chọn phân loại xuất (12 loại)
   - Thêm sản phẩm
   - Nhập số lượng (với +/- buttons)
   - Nhập giá xuất
   - Lưu nháp / Hoàn thành
3. ✅ Xem danh sách phiếu xuất:
   - Filter: Mã phiếu, Tình trạng, Phân loại, Date range
   - Search
   - Export Excel
   - Xem/Sửa/Xóa (chỉ DRAFT)
4. ✅ Click "Xuất sang kho nội bộ" → Test di chuyển kho:
   - Chọn kho đích
   - Thêm sản phẩm
   - Chọn phân loại, tình trạng
   - Nhập vào kho

---

## 7️⃣ QUẢN LÝ NHÂN VIÊN

**Route:** `http://localhost:3001/staff-management`

**Test:**
1. ✅ Xem danh sách nhân viên
2. ✅ Search nhân viên (tên, SĐT, mã NV)
3. ✅ Filter theo trạng thái, vai trò
4. ✅ Click "Thêm nhân viên" → Test tạo:
   - Nhập thông tin cơ bản (tên, SĐT, mật khẩu, vai trò)
   - Nhập thông tin nhân viên (mã NV tự động sinh, vị trí, lương, hoa hồng)
   - Chọn dịch vụ có thể làm
   - Tạo mới
5. ✅ Click "Xem" (icon Eye) → Xem chi tiết nhân viên
6. ✅ Click "Sửa" (icon Edit) → Sửa thông tin nhân viên
7. ✅ Click "Xóa" (icon Trash) → Vô hiệu hóa nhân viên
8. ✅ Test pagination

---

## 8️⃣ POS

**Route:** `http://localhost:3001/pos`

**Test:**
1. ✅ Xem giao diện POS
2. ✅ Thêm sản phẩm/dịch vụ vào giỏ
3. ✅ Tính tiền
4. ✅ Tạo hóa đơn

---

## 9️⃣ BÁO CÁO

**Route:** `http://localhost:3001/reports`

**Test:**
- `http://localhost:3001/reports/daily` - Báo cáo ngày
- `http://localhost:3001/reports/monthly` - Báo cáo tháng

---

## 🔟 MINA AI

**Route:** `http://localhost:3001/mina`

**Test:**
1. ✅ Chat với AI
2. ✅ Hỏi về dịch vụ, sản phẩm
3. ✅ Tư vấn khách hàng

---

## 1️⃣1️⃣ CÀI ĐẶT

**Route:** `http://localhost:3001/settings`

**Test:**
1. ✅ Xem cài đặt hệ thống
2. ✅ Quản lý người dùng (nếu có)

---

## 1️⃣2️⃣ CUSTOMER APP

**Base:** `http://localhost:3001/customer-app`

### Test các trang:
1. ✅ `/customer-app/home` - Trang chủ
2. ✅ `/customer-app/book` - Đặt lịch
3. ✅ `/customer-app/bookings` - Lịch hẹn của tôi
4. ✅ `/customer-app/profile` - Hồ sơ
5. ✅ `/customer-app/promotions` - Khuyến mãi
6. ✅ `/customer-app/loyalty` - Điểm tích lũy
7. ✅ `/customer-app/recommendations` - Gợi ý
8. ✅ `/customer-app/notifications` - Thông báo

---

## 🎯 TEST FLOW HOÀN CHỈNH

### Flow 1: Quản lý sản phẩm và nhập kho
1. Login với Admin
2. Vào **Kho hàng** → **Danh sách sản phẩm**
3. Click **"Tạo sản phẩm mới"** → Tạo 2-3 sản phẩm
4. Vào **Quản lý kho hàng** → **Phiếu nhập kho**
5. Click **"Tạo phiếu nhập"**:
   - Chọn nhà cung cấp
   - Thêm sản phẩm vừa tạo
   - Nhập giá, số lượng
   - Test giảm giá
   - Hoàn thành
6. Kiểm tra tồn kho đã tăng chưa

### Flow 2: Quản lý nhân viên
1. Vào **Quản lý nhân viên**
2. Click **"Thêm nhân viên"**:
   - Tên: "Nguyễn Văn A"
   - SĐT: "0901234567"
   - Mật khẩu: "123456"
   - Vai trò: Stylist
   - Lương: 10000000
   - Hoa hồng: 10%
   - Chọn dịch vụ
   - Tạo mới
3. Kiểm tra nhân viên xuất hiện trong danh sách
4. Click **"Xem"** → Xem chi tiết
5. Click **"Sửa"** → Sửa lương thành 12000000
6. Kiểm tra đã cập nhật

### Flow 3: Quản lý khách hàng
1. Vào **CRM**
2. Click **"Thêm mới"** → Tạo khách hàng:
   - Tên: "Trần Thị B"
   - SĐT: "0907654321"
   - Ghi chú: "Khách VIP"
3. Click vào khách hàng → Xem chi tiết
4. Click **"Quản lý nhóm"** → Tạo nhóm "VIP"
5. Gán khách hàng vào nhóm VIP
6. Click **"Thống kê khách hàng"** → Xem biểu đồ

### Flow 4: Phiếu xuất kho
1. Vào **Kho hàng** → **Quản lý kho hàng** → **Phiếu xuất kho**
2. Click **"Tạo phiếu xuất"**:
   - Chọn phân loại: "Xuất tiêu hao"
   - Chọn người nhận
   - Thêm sản phẩm (chọn sản phẩm đã có tồn kho)
   - Nhập số lượng
   - Hoàn thành
3. Kiểm tra tồn kho đã giảm chưa

### Flow 5: Di chuyển kho
1. Vào **Kho hàng** → **Quản lý kho hàng** → **Phiếu xuất kho**
2. Click **"Xuất sang kho nội bộ"**:
   - Chọn kho đích (nếu có nhiều chi nhánh)
   - Thêm sản phẩm
   - Chọn phân loại, tình trạng
   - Nhập vào kho
3. Kiểm tra phiếu chuyển kho đã tạo

---

## ✅ CHECKLIST TEST

### Core Features
- [ ] Đăng nhập thành công
- [ ] Dashboard hiển thị đúng
- [ ] Đặt lịch hoạt động
- [ ] CRM hiển thị danh sách khách hàng
- [ ] Dịch vụ hiển thị danh sách
- [ ] Kho hàng hiển thị đúng
- [ ] Quản lý nhân viên hoạt động
- [ ] POS hoạt động
- [ ] Báo cáo hiển thị
- [ ] Mina AI hoạt động

### Inventory
- [ ] Tạo sản phẩm mới
- [ ] Import/Export Excel
- [ ] Tạo phiếu nhập kho
- [ ] Giảm giá hoạt động đúng
- [ ] Tạo phiếu xuất kho
- [ ] Di chuyển kho
- [ ] Filter, Search hoạt động

### Staff Management
- [ ] Tạo nhân viên mới
- [ ] Xem chi tiết nhân viên
- [ ] Sửa nhân viên
- [ ] Vô hiệu hóa nhân viên
- [ ] Filter, Search hoạt động

### CRM
- [ ] Tạo khách hàng mới
- [ ] Quản lý nhóm
- [ ] Import Excel
- [ ] Thống kê hiển thị

---

## 🐛 NẾU GẶP LỖI

1. **Lỗi Database:** Kiểm tra PostgreSQL đang chạy và DATABASE_URL đúng
2. **Lỗi Build:** Chạy `npm run build` để xem lỗi chi tiết
3. **Lỗi Runtime:** Xem console trong browser (F12)
4. **Lỗi API:** Xem Network tab trong DevTools

---

**🎉 Chúc bạn test thành công!**
