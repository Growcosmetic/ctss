# UI Improvements Complete Implementation - CTSS

## 📋 Plan (Kế hoạch thực thi tổng thể)

### Phase 1: Dashboard & Quick Actions ✅
1. **Tích hợp dữ liệu thật từ backend**
   - API đã có sẵn tại `/api/dashboard/stats`
   - Cập nhật KPICards để hiển thị đầy đủ dữ liệu
   - Thêm loading và error states

2. **Thay thế Module Grid bằng Quick Actions**
   - Cải thiện QuickActionsBar với 6 actions
   - Thêm "Xem báo cáo hôm nay"
   - Ẩn DashboardModuleGrid section

### Phase 2: Booking Calendar Improvements
1. **Cải thiện UI**
   - Đảm bảo filter hoạt động tốt
   - Cải thiện chuyển đổi ngày/tuần

2. **Buffer Time và Validation**
   - Thêm buffer time (15 phút) khi tạo booking
   - Kiểm tra trùng giờ
   - Cảnh báo quá tải

### Phase 3: POS Improvements
1. **Layout 2 Cột**
   - Left: Cart (đơn hàng)
   - Right: Products/Services catalog
   - Action buttons rõ ràng

### Phase 4: CRM Improvements
1. **Layout 3 Cột**
   - Left: Customer list với filter
   - Middle: Customer details
   - Right: Transaction history

2. **Filter và Search**
   - Filter theo tên, phone, membership
   - Advanced filter

### Phase 5: All Modules Page ✅
- Đã hoàn thành trong lần implement trước

### Phase 6: UI Consistency & Accessibility
1. **Color Palette và Icons**
   - Định nghĩa trong Tailwind config
   - Sử dụng Lucide icons nhất quán

2. **Accessibility**
   - Thêm aria-labels
   - Keyboard navigation
   - Screen reader support

---

## 📁 Files Changed (Dự kiến)

### Phase 1: Dashboard
- `app/dashboard/page.tsx` - Ẩn Module Grid, cải thiện Quick Actions
- `features/dashboard/components/QuickActionsBar.tsx` - Thêm 6 actions
- `components/dashboard/KPICards.tsx` - Cải thiện hiển thị dữ liệu

### Phase 2: Booking Calendar
- `components/booking/CreateBookingModal.tsx` - Thêm buffer time validation
- `components/booking/BookingForm.tsx` - Cải thiện validation

### Phase 3: POS
- `app/pos/page.tsx` - Refactor layout 2 cột

### Phase 4: CRM
- `app/crm/page.tsx` - Refactor layout 3 cột
- `components/crm/CustomerListPanel.tsx` - Cải thiện filter

### Phase 6: UI Consistency
- `tailwind.config.ts` - Thêm color palette
- Các components - Thêm accessibility

---

## 🔧 Patch (Code Changes)

### 1. Dashboard: Cải thiện Quick Actions và Ẩn Module Grid

**File: `app/dashboard/page.tsx`**
```typescript
// Thay đổi: Ẩn Module Grid section
{/* Module Grid - Cards các module */}
{/* REMOVED: DashboardModuleGrid section */}

// Thêm link đến All Modules page trong Quick Actions
```

**File: `features/dashboard/components/QuickActionsBar.tsx`**
```typescript
// Thêm action "Xem báo cáo hôm nay"
{
  label: "Xem báo cáo hôm nay",
  icon: <BarChart3 className="w-5 h-5" />,
  onClick: () => router.push("/reports?date=today"),
  color: "bg-indigo-600 hover:bg-indigo-700",
}
```

### 2. Booking Calendar: Buffer Time và Validation

**File: `components/booking/CreateBookingModal.tsx`**
```typescript
// Thêm buffer time validation
const BUFFER_TIME_MINUTES = 15;

const checkTimeConflict = (startTime: string, endTime: string, date: string, stylistId: string) => {
  // Check if time overlaps with existing bookings
  // Include buffer time
  // Return conflict info
};
```

### 3. POS: Layout 2 Cột

**File: `app/pos/page.tsx`**
```typescript
// Refactor layout
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* Left: Cart */}
  <div className="lg:col-span-1">
    {/* Cart items */}
  </div>
  
  {/* Right: Products/Services */}
  <div className="lg:col-span-1">
    {/* Catalog */}
  </div>
</div>

{/* Action Buttons */}
<div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
  {/* Thanh toán, In hóa đơn, Hủy */}
</div>
```

### 4. CRM: Layout 3 Cột

**File: `app/crm/page.tsx`**
```typescript
// Refactor layout
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* Left: Customer List */}
  <div className="lg:col-span-1">
    <CustomerListPanel />
  </div>
  
  {/* Middle: Customer Details */}
  <div className="lg:col-span-1">
    <CustomerDetailPanel />
  </div>
  
  {/* Right: Transaction History */}
  <div className="lg:col-span-1">
    <CustomerActivityPanel />
  </div>
</div>
```

---

## ✅ Manual Test Checklist

### Dashboard & Quick Actions
- [ ] KPI cards hiển thị dữ liệu thật từ API
- [ ] Quick Actions có 6 actions (Tạo lịch, POS, Tìm KH, Mina AI, Walk-in, Báo cáo)
- [ ] Module Grid được ẩn
- [ ] Click Quick Actions navigate đúng
- [ ] Loading states hiển thị đúng
- [ ] Error states hiển thị đúng

### Booking Calendar
- [ ] Filter theo nhân viên hoạt động
- [ ] Filter theo dịch vụ hoạt động
- [ ] Buffer time được áp dụng (15 phút)
- [ ] Cảnh báo trùng lịch hiển thị
- [ ] Cảnh báo quá tải hiển thị
- [ ] Chuyển đổi ngày/tuần mượt mà

### POS
- [ ] Layout 2 cột hiển thị đúng
- [ ] Left: Cart với items
- [ ] Right: Products/Services catalog
- [ ] Action buttons rõ ràng (Thanh toán, In, Hủy)
- [ ] Responsive: Stack trên mobile
- [ ] Thanh toán hoạt động đúng

### CRM
- [ ] Layout 3 cột tách rõ
- [ ] Left: Customer list với filter
- [ ] Middle: Customer details
- [ ] Right: Transaction history
- [ ] Filter theo tên hoạt động
- [ ] Filter theo phone hoạt động
- [ ] Filter theo membership hoạt động
- [ ] Search real-time hoạt động

### UI Consistency
- [ ] Icons nhất quán (Lucide)
- [ ] Colors nhất quán
- [ ] Responsive trên desktop
- [ ] Responsive trên tablet
- [ ] Responsive trên mobile
- [ ] Accessibility attributes đầy đủ

---

## 🎯 Kết quả mong muốn

✅ **Dashboard**: Dữ liệu thật, Quick Actions thay thế Module Grid
✅ **Booking Calendar**: Buffer time, validation, cảnh báo
✅ **POS**: Layout 2 cột, action buttons rõ ràng
✅ **CRM**: Layout 3 cột, filter/search tốt
✅ **UI Consistency**: Icons, colors, accessibility nhất quán

