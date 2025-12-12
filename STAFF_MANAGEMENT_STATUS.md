# 📊 Tình Trạng Trang Quản Lý Nhân Viên

## ✅ Đã Có

### 1. API Endpoints
- ✅ `GET /api/staff` - Lấy danh sách nhân viên (có search, filter, pagination)
- ✅ `GET /api/staff/[id]` - Lấy chi tiết nhân viên
- ✅ `PUT /api/staff/[id]` - Cập nhật nhân viên
- ✅ `DELETE /api/staff/[id]` - Vô hiệu hóa nhân viên (set isActive = false)
- ✅ `GET /api/branches/[id]/staff` - Lấy nhân viên theo chi nhánh

### 2. Trang Hiện Tại
- ✅ `/app/staff/page.tsx` - Trang cho STYLIST/ASSISTANT xem lịch làm việc của họ
- ✅ Sidebar có menu "Nhân viên" cho ADMIN/MANAGER

### 3. Schema
- ✅ Model `User` với role: STYLIST, ASSISTANT, RECEPTIONIST
- ✅ Model `StaffSalaryProfile` - Hồ sơ lương
- ✅ Model `StaffDailyRecord` - Chấm công
- ✅ Model `BranchStaffAssignment` - Phân công nhân viên vào chi nhánh

---

## ❌ Chưa Có / Cần Cải Thiện

### 1. Trang Quản Lý Nhân Viên cho ADMIN/MANAGER
- ❌ Chưa có trang quản lý nhân viên (CRUD)
- ❌ Trang `/staff` hiện tại redirect ADMIN/MANAGER về dashboard
- ❌ Cần tạo trang mới: `/app/(dashboard)/staff-management/page.tsx`

### 2. API POST để Tạo Nhân Viên
- ❌ Chưa có `POST /api/staff` để tạo nhân viên mới
- ❌ Cần tạo API này

### 3. Components
- ❌ Chưa có `StaffList` component
- ❌ Chưa có `StaffFormModal` component (tạo/sửa)
- ❌ Chưa có `StaffDetailModal` component (xem chi tiết)
- ❌ Chưa có filter, search, pagination UI

### 4. Schema Issue
- ⚠️ API đang dùng `prisma.staff.findMany()` nhưng schema không có model `Staff`
- ⚠️ Có thể cần tạo model `Staff` hoặc sửa API để dùng `prisma.user.findMany()` với filter role

---

## 🎯 Kế Hoạch Cải Thiện

### Phase 1: Sửa Schema/API
1. Kiểm tra và sửa API `/api/staff` để dùng đúng model
2. Tạo `POST /api/staff` để tạo nhân viên mới

### Phase 2: Tạo Components
1. `StaffList` - Danh sách nhân viên với table
2. `StaffFormModal` - Form tạo/sửa nhân viên
3. `StaffDetailModal` - Xem chi tiết nhân viên
4. Filter/Search/Pagination UI

### Phase 3: Tạo Trang Quản Lý
1. Tạo `/app/(dashboard)/staff-management/page.tsx`
2. Tích hợp các components
3. Thêm routing trong Sidebar

---

## 📝 Ghi Chú

- Trang `/staff` hiện tại dành cho STYLIST/ASSISTANT xem lịch làm việc
- Cần tạo trang mới `/staff-management` cho ADMIN/MANAGER quản lý nhân viên
- Hoặc có thể sửa `/staff` để có 2 mode: view mode (cho staff) và management mode (cho admin)
