# UI Improvements Plan - CTSS

## 📋 Plan (Kế hoạch thực thi)

### Phase 1: Dashboard & Quick Actions
1. **Tích hợp dữ liệu thật từ backend**
   - Kiểm tra API endpoints hiện có cho dashboard stats
   - Cập nhật KPICards để hiển thị dữ liệu thật
   - Xử lý loading, error và empty states

2. **Thay thế Module Grid bằng Quick Actions**
   - Cải thiện QuickActionsBar với 4-6 actions quan trọng
   - Thêm "Xem báo cáo hôm nay" action
   - Ẩn hoặc thay thế DashboardModuleGrid section

### Phase 2: Booking Calendar Improvements
1. **Cải thiện UI và UX**
   - Đảm bảo filter theo nhân viên và dịch vụ hoạt động tốt
   - Cải thiện chuyển đổi giữa ngày/tuần

2. **Thêm Buffer Time và Validation**
   - Thêm buffer time khi tạo booking mới
   - Kiểm tra trùng giờ trước khi tạo
   - Hiển thị cảnh báo khi quá tải hoặc trùng lịch

### Phase 3: POS / Thu ngân Improvements
1. **Cải thiện Layout 2 Cột**
   - Left column: Đơn hàng hiện tại (cart)
   - Right column: Danh mục dịch vụ/sản phẩm
   - Responsive: Stack trên mobile

2. **Cải thiện Action Buttons**
   - Thanh toán button rõ ràng
   - In hóa đơn button
   - Hủy button với confirmation

### Phase 4: CRM / Khách hàng Improvements
1. **Tách rõ Layout 3 Cột**
   - Left: Danh sách khách hàng với filter
   - Middle: Thông tin chi tiết khách hàng
   - Right: Lịch sử giao dịch

2. **Cải thiện Filter và Search**
   - Filter theo tên, số điện thoại, membership status
   - Advanced filter với nhiều tiêu chí
   - Search real-time

### Phase 5: All Modules Page (Đã hoàn thành)
- ✅ Trang `/modules` đã được tạo
- ✅ Search và filter đã implement
- ✅ Role-based filtering đã có

### Phase 6: UI Consistency & Accessibility
1. **Icon và Color Palette**
   - Sử dụng Lucide icons nhất quán
   - Định nghĩa color palette trong Tailwind config
   - Đảm bảo màu sắc nhất quán

2. **Responsive Design**
   - Kiểm tra và cải thiện responsive trên tất cả pages
   - Mobile-first approach

3. **Accessibility**
   - Thêm aria-labels cho các buttons và interactive elements
   - Đảm bảo keyboard navigation
   - Screen reader support

---

## 📁 Files Changed (Dự kiến)

### Phase 1: Dashboard
- `app/dashboard/page.tsx` - Cập nhật để ẩn Module Grid
- `features/dashboard/components/QuickActionsBar.tsx` - Cải thiện với 6 actions
- `components/dashboard/KPICards.tsx` - Tích hợp dữ liệu thật
- `features/dashboard/hooks/useDashboard.ts` - Cập nhật để fetch dữ liệu đầy đủ

### Phase 2: Booking Calendar
- `components/booking/BookingForm.tsx` - Thêm buffer time và validation
- `components/booking/CreateBookingModal.tsx` - Cải thiện validation
- `components/booking/BookingCalendar.tsx` - Cải thiện UI và filter

### Phase 3: POS
- `app/pos/page.tsx` - Refactor layout 2 cột
- `features/pos/components/CheckoutModal.tsx` - Cải thiện action buttons

### Phase 4: CRM
- `app/crm/page.tsx` - Refactor layout 3 cột
- `components/crm/CustomerListPanel.tsx` - Cải thiện filter và search
- `components/crm/CustomerDetailPanel.tsx` - Cải thiện hiển thị

### Phase 6: UI Consistency
- `tailwind.config.ts` - Thêm color palette
- Tất cả components - Thêm aria-labels và accessibility

---

## 🔧 Implementation Order

1. **Dashboard Quick Actions** (Ưu tiên cao - dễ implement)
2. **POS Layout** (Ưu tiên cao - cải thiện UX rõ ràng)
3. **CRM Layout** (Ưu tiên trung bình)
4. **Booking Calendar Validation** (Ưu tiên trung bình)
5. **UI Consistency** (Ưu tiên thấp - làm song song)

---

## ✅ Manual Test Checklist (Sẽ được tạo chi tiết cho từng phase)

### Dashboard
- [ ] KPI cards hiển thị dữ liệu thật
- [ ] Quick Actions có 6 actions quan trọng
- [ ] Module Grid được ẩn hoặc thay thế
- [ ] Loading và error states hoạt động đúng

### Booking Calendar
- [ ] Filter theo nhân viên hoạt động
- [ ] Filter theo dịch vụ hoạt động
- [ ] Buffer time được áp dụng khi tạo booking
- [ ] Cảnh báo trùng lịch hiển thị đúng

### POS
- [ ] Layout 2 cột hiển thị đúng
- [ ] Action buttons rõ ràng và hoạt động
- [ ] Responsive trên mobile

### CRM
- [ ] Layout 3 cột tách rõ
- [ ] Filter và search hoạt động tốt
- [ ] Responsive trên mobile

### UI Consistency
- [ ] Icons nhất quán
- [ ] Colors nhất quán
- [ ] Accessibility attributes đầy đủ

