# UI Improvements Final Implementation - CTSS

## 📋 Plan (Kế hoạch thực thi)

### ✅ Phase 1: Dashboard & Quick Actions (Đã hoàn thành một phần)
1. ✅ Thêm "Báo cáo hôm nay" vào Quick Actions
2. ✅ Thay thế Module Grid bằng link đến All Modules page
3. ⏳ Cải thiện KPICards với loading states tốt hơn

### Phase 2: Booking Calendar Improvements
1. **Thêm Buffer Time Validation**
   - Buffer time 15 phút giữa các bookings
   - Kiểm tra trùng giờ khi tạo booking mới
   - Hiển thị cảnh báo khi quá tải hoặc trùng lịch

2. **Cải thiện UI**
   - Đảm bảo filter hoạt động tốt
   - Cải thiện chuyển đổi ngày/tuần

### Phase 3: POS Improvements
1. **Refactor Layout 2 Cột**
   - Left column: Cart (đơn hàng hiện tại)
   - Right column: Products/Services catalog
   - Action buttons ở bottom: Thanh toán, In hóa đơn, Hủy

### Phase 4: CRM Improvements
1. **Cải thiện Layout 3 Cột**
   - Layout đã có nhưng cần cải thiện spacing và responsive

2. **Cải thiện Filter và Search**
   - Filter theo membership status
   - Advanced filter với nhiều tiêu chí
   - Search real-time improvement

### Phase 5: UI Consistency & Accessibility
1. **Color Palette**
   - Định nghĩa trong Tailwind config
   - Sử dụng nhất quán

2. **Accessibility**
   - Thêm aria-labels
   - Keyboard navigation
   - Screen reader support

---

## 📁 Files Changed

### Phase 1: Dashboard ✅
- ✅ `features/dashboard/components/QuickActionsBar.tsx` - Thêm 6 actions với role filtering
- ✅ `app/dashboard/page.tsx` - Thay thế Module Grid bằng link đến All Modules
- ⏳ `components/dashboard/KPICards.tsx` - Cải thiện loading states

### Phase 2: Booking Calendar
- `components/booking/CreateBookingModal.tsx` - Thêm buffer time validation
- `components/booking/BookingForm.tsx` - Cải thiện validation

### Phase 3: POS
- `app/pos/page.tsx` - Refactor layout 2 cột rõ ràng hơn

### Phase 4: CRM
- `app/crm/page.tsx` - Cải thiện layout và spacing
- `components/crm/CustomerListPanel.tsx` - Cải thiện filter

### Phase 5: UI Consistency
- `tailwind.config.ts` - Thêm color palette
- Các components - Thêm accessibility attributes

---

## 🔧 Patch (Code Changes)

### 1. Dashboard: Quick Actions (Đã implement)

**File: `features/dashboard/components/QuickActionsBar.tsx`**
```typescript
// Thêm action "Báo cáo hôm nay"
{
  label: "Báo cáo hôm nay",
  icon: <BarChart3 className="w-5 h-5" />,
  onClick: () => {
    const today = new Date().toISOString().split("T")[0];
    router.push(`/reports?date=${today}`);
  },
  color: "bg-indigo-600 hover:bg-indigo-700",
  roles: ["ADMIN", "MANAGER"],
}

// Filter actions by role
const visibleActions = actions.filter((action) => {
  if (!user) return false;
  return action.roles.includes(user.role as any);
});
```

**File: `app/dashboard/page.tsx`**
```typescript
// Thay thế Module Grid
{/* Link to All Modules - Thay thế Module Grid */}
<div className="bg-white rounded-xl border border-gray-200 p-6">
  <div className="flex items-center justify-between">
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Tất cả các Module</h2>
      <p className="text-gray-600 text-sm">
        Khám phá tất cả các tính năng của hệ thống CTSS với tìm kiếm và bộ lọc
      </p>
    </div>
    <button onClick={() => router.push("/modules")}>
      Xem tất cả →
    </button>
  </div>
</div>
```

### 2. Booking Calendar: Buffer Time Validation

**File: `components/booking/CreateBookingModal.tsx`**
```typescript
// Thêm buffer time constant
const BUFFER_TIME_MINUTES = 15;

// Thêm validation function
const checkTimeConflict = (
  startTime: string,
  endTime: string,
  date: string,
  stylistId: string,
  existingBookings: any[]
) => {
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);
  const startTotal = startHour * 60 + startMin;
  const endTotal = endHour * 60 + endMin;
  
  // Check conflicts với buffer time
  const conflicts = existingBookings.filter((booking) => {
    if (booking.date !== date || booking.stylistId !== stylistId) return false;
    
    const [bStartHour, bStartMin] = booking.start.split(":").map(Number);
    const [bEndHour, bEndMin] = booking.end.split(":").map(Number);
    const bStartTotal = bStartHour * 60 + bStartMin;
    const bEndTotal = bEndHour * 60 + bEndMin;
    
    // Check overlap với buffer
    return (
      (startTotal < bEndTotal + BUFFER_TIME_MINUTES && endTotal > bStartTotal - BUFFER_TIME_MINUTES)
    );
  });
  
  return conflicts;
};
```

### 3. POS: Layout 2 Cột

**File: `app/pos/page.tsx`**
```typescript
// Refactor layout
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
  {/* Left: Cart */}
  <div className="lg:col-span-1 flex flex-col">
    <Card className="flex-1 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Đơn hàng</h2>
      {/* Cart items */}
    </Card>
  </div>
  
  {/* Right: Catalog */}
  <div className="lg:col-span-1 flex flex-col">
    <Card className="flex-1 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Danh mục</h2>
      {/* Products/Services */}
    </Card>
  </div>
</div>

{/* Action Buttons - Fixed bottom */}
<div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
  <div className="max-w-7xl mx-auto flex gap-4">
    <button className="flex-1 bg-red-600 text-white py-3 rounded-lg">
      Hủy
    </button>
    <button className="flex-1 bg-gray-600 text-white py-3 rounded-lg">
      In hóa đơn
    </button>
    <button className="flex-1 bg-green-600 text-white py-3 rounded-lg">
      Thanh toán
    </button>
  </div>
</div>
```

### 4. CRM: Cải thiện Filter

**File: `components/crm/CustomerListPanel.tsx`**
```typescript
// Thêm membership filter
const [membershipFilter, setMembershipFilter] = useState<string>("all");

// Filter logic
const filteredCustomers = useMemo(() => {
  let filtered = customers;
  
  // Search filter
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(term) ||
        c.phone.includes(term) ||
        c.customerCode?.toLowerCase().includes(term)
    );
  }
  
  // Membership filter
  if (membershipFilter !== "all") {
    filtered = filtered.filter((c) => {
      // Logic filter theo membership
      return true; // Implement logic
    });
  }
  
  return filtered;
}, [customers, searchTerm, membershipFilter]);
```

---

## ✅ Manual Test Checklist

### Dashboard & Quick Actions
- [ ] Quick Actions có 6 actions (Tạo lịch, POS, Tìm KH, Mina AI, Walk-in, Báo cáo)
- [ ] Actions được filter theo role đúng
- [ ] Click "Báo cáo hôm nay" → navigate đến `/reports?date=today`
- [ ] Link "Xem tất cả" → navigate đến `/modules`
- [ ] KPI cards hiển thị dữ liệu thật
- [ ] Loading states hiển thị đúng

### Booking Calendar
- [ ] Buffer time 15 phút được áp dụng
- [ ] Cảnh báo trùng lịch hiển thị khi có conflict
- [ ] Cảnh báo quá tải hiển thị khi stylist quá tải
- [ ] Filter theo nhân viên hoạt động
- [ ] Filter theo dịch vụ hoạt động
- [ ] Chuyển đổi ngày/tuần mượt mà

### POS
- [ ] Layout 2 cột hiển thị đúng trên desktop
- [ ] Left: Cart với items
- [ ] Right: Products/Services catalog
- [ ] Action buttons ở bottom (Thanh toán, In, Hủy)
- [ ] Responsive: Stack trên mobile
- [ ] Thanh toán hoạt động đúng

### CRM
- [ ] Layout 3 cột tách rõ
- [ ] Left: Customer list với filter
- [ ] Middle: Customer details
- [ ] Right: Transaction history
- [ ] Filter theo membership hoạt động
- [ ] Search real-time hoạt động tốt
- [ ] Responsive trên mobile

### UI Consistency
- [ ] Icons nhất quán (Lucide)
- [ ] Colors nhất quán
- [ ] Responsive trên tất cả devices
- [ ] Accessibility attributes đầy đủ

---

## 🎯 Kết quả mong muốn

✅ **Dashboard**: Quick Actions với 6 actions, link đến All Modules
✅ **Booking Calendar**: Buffer time, validation, cảnh báo
✅ **POS**: Layout 2 cột rõ ràng, action buttons
✅ **CRM**: Layout 3 cột, filter/search tốt
✅ **UI Consistency**: Icons, colors, accessibility nhất quán

