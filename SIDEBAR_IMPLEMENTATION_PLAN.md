# Sidebar Implementation Plan - CTSS

## 📋 Plan (Kế hoạch thực thi)

### Bước 1: Tạo nguồn dữ liệu MENU_ITEMS thống nhất
- ✅ Định nghĩa interface `MenuItemData` với đầy đủ các trường: `key`, `label`, `path`, `group`, `icon`, `roles`, `children?`
- ✅ Chuyển đổi tất cả menu items từ cấu trúc cũ sang `MENU_ITEMS` array
- ✅ Tạo `GROUP_ICONS` mapping cho icons của từng group
- ✅ Tạo `GROUP_ORDER` array để sắp xếp groups theo thứ tự nghiệp vụ

### Bước 2: Xây dựng state quản lý
- ✅ `expandedGroups: Set<string>` - mặc định chứa "Dashboard"
- ✅ `isMobileOpen: boolean` - điều khiển sidebar mobile
- ✅ `sidebarOpen: boolean` - sử dụng Zustand store hiện có

### Bước 3: Xử lý dữ liệu trước khi render
- ✅ Filter `MENU_ITEMS` theo quyền người dùng (`hasAnyRole(item.roles)`)
- ✅ Group theo trường `group` và sắp xếp theo `GROUP_ORDER` (không phải alphabet)
- ✅ Xử lý edge cases: groups không có trong ORDER sẽ sort alphabet

### Bước 4: Render Sidebar với layout cố định
- ✅ `<aside>` có width 240px, height 100vh, flex-col layout
- ✅ Header (logo + toggle) cao 72px, flex-shrink-0
- ✅ Menu container có `height: calc(100vh - 72px)` với `overflow-y: auto`
- ✅ Scrollbar styling với class `scrollbar-thin`

### Bước 5: Implement Accordion với logic thông minh
- ✅ Nhóm có 1 item → render trực tiếp `<Link>` không có accordion
- ✅ Nhóm có nhiều items → render accordion với header button
- ✅ Collapsible content với CSS transition (`max-height`, `opacity`)
- ✅ Mỗi group expand/collapse độc lập, không ảnh hưởng nhau

### Bước 6: Tối ưu UX và Responsive
- ✅ Active state detection chính xác (`pathname === item.path || pathname.startsWith(item.path + "/")`)
- ✅ Hover effects mượt mà với transition
- ✅ Mobile: sidebar slide từ trái với overlay
- ✅ Desktop: sidebar toggle với animation
- ✅ Accessibility: aria-labels, aria-expanded, aria-current

---

## 📁 Files Changed

### 1. `components/layout/Sidebar.tsx`
**Thay đổi chính:**
- Refactor toàn bộ component với data structure mới
- Thêm `GROUP_ORDER` để sắp xếp groups theo nghiệp vụ
- Cải thiện active state detection
- Tối ưu UX với transitions và hover effects
- Thêm accessibility attributes

### 2. `app/globals.css`
**Đã có sẵn từ lần refactor trước:**
- Utility class `scrollbar-thin` cho scrollbar styling
- Hỗ trợ Firefox và Webkit browsers

---

## 🔧 Patch (Code Changes)

### 1. Thêm GROUP_ORDER

```typescript
// Thêm sau GROUP_ICONS
const GROUP_ORDER: string[] = [
  "Dashboard",
  "Đặt lịch",
  "Khách hàng",
  "Dịch vụ",
  "Kho hàng",
  "Nhân viên",
  "Bán hàng",
  "Báo cáo",
  "Marketing",
  "Analytics",
  "Hệ thống",
  "AI",
];
```

### 2. Sắp xếp groups theo GROUP_ORDER

```typescript
// Thay thế: Object.keys(groupedItems).sort()
const visibleGroups = Object.keys(groupedItems).sort((a, b) => {
  const indexA = GROUP_ORDER.indexOf(a);
  const indexB = GROUP_ORDER.indexOf(b);
  
  if (indexA !== -1 && indexB !== -1) {
    return indexA - indexB;
  }
  if (indexA !== -1) return -1;
  if (indexB !== -1) return 1;
  return a.localeCompare(b);
});
```

### 3. Cải thiện Active State Detection

```typescript
// Trước: pathname.startsWith(item.path)
// Sau: 
const isActive = pathname === item.path || pathname.startsWith(item.path + "/");
```

### 4. Tối ưu Single Item Rendering

```typescript
// Loại bỏ inline styles, sử dụng Tailwind classes
className={cn(
  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
  isActive
    ? "text-gray-800 font-semibold bg-white/20"
    : "text-gray-700 hover:text-gray-900 hover:bg-white/10"
)}
```

### 5. Cải thiện Accordion với Active Detection

```typescript
// Detect nếu group có item đang active
const hasActiveItem = groupItems.some(
  (item) => pathname === item.path || pathname.startsWith(item.path + "/")
);

// Highlight group header nếu có active item
className={cn(
  "w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200",
  "text-gray-700 hover:text-gray-900 hover:bg-white/10",
  hasActiveItem && "bg-white/5"
)}
```

### 6. Thêm Accessibility Attributes

```typescript
// Sidebar
<aside role="navigation" aria-label="Main navigation">

// Accordion button
<button
  aria-expanded={isExpanded}
  aria-controls={`menu-group-${groupLabel}`}
>

// Collapsible content
<div id={`menu-group-${groupLabel}`}>

// Active link
<Link aria-current={isActive ? "page" : undefined}>
```

---

## ✅ Manual Test Checklist

### 🔐 Test Role-based Filtering

#### Test với ADMIN role:
- [ ] Đăng nhập với tài khoản ADMIN
- [ ] Kiểm tra thấy tất cả menu items:
  - [ ] Dashboard (Main Dashboard, CEO Control Tower)
  - [ ] Đặt lịch
  - [ ] Khách hàng (CRM, Membership, Personalization)
  - [ ] Dịch vụ (Services, Pricing)
  - [ ] Kho hàng
  - [ ] Nhân viên (Staff Management)
  - [ ] Bán hàng (POS, Sales Dashboard)
  - [ ] Báo cáo (Reports, Financial)
  - [ ] Marketing
  - [ ] Analytics (Quality, Voice, Hair Health)
  - [ ] Hệ thống (Operations, Training, SOP, Workflow, Partner HQ, Settings)
  - [ ] AI (Mina AI)

#### Test với MANAGER role:
- [ ] Đăng nhập với tài khoản MANAGER
- [ ] Kiểm tra KHÔNG thấy:
  - [ ] CEO Control Tower (chỉ ADMIN)
  - [ ] Partner HQ (chỉ ADMIN)
  - [ ] Settings (chỉ ADMIN)
- [ ] Kiểm tra thấy các mục khác như ADMIN (trừ các mục trên)

#### Test với STYLIST role:
- [ ] Đăng nhập với tài khoản STYLIST
- [ ] Kiểm tra chỉ thấy:
  - [ ] Dashboard (Main Dashboard)
  - [ ] Đặt lịch
  - [ ] Khách hàng (CRM Dashboard)
  - [ ] Dịch vụ (Services)
  - [ ] Nhân viên (Staff)
  - [ ] Analytics (Hair Health)
  - [ ] AI (Mina AI)
- [ ] Kiểm tra KHÔNG thấy các mục quản lý

#### Test với RECEPTIONIST role:
- [ ] Đăng nhập với tài khoản RECEPTIONIST
- [ ] Kiểm tra thấy các mục phù hợp với role

---

### 🎯 Test Accordion Expand/Collapse

#### Test mở/đóng từng group:
- [ ] Click "Dashboard" → expand, thấy 2 items
- [ ] Click lại "Dashboard" → collapse, ẩn items
- [ ] Click "Khách hàng" → expand, thấy 3 items
- [ ] Click "Hệ thống" → expand, thấy 6 items
- [ ] Mở nhiều groups cùng lúc → tất cả đều hiển thị đúng

#### Test độc lập giữa các groups:
- [ ] Mở "Dashboard" và "Khách hàng"
- [ ] Đóng "Dashboard" → "Khách hàng" vẫn mở
- [ ] Đóng "Khách hàng" → "Dashboard" vẫn đóng
- [ ] Mở tất cả groups → tất cả đều hiển thị

#### Test single item groups:
- [ ] Kiểm tra "Đặt lịch" → không có chevron, render trực tiếp link
- [ ] Kiểm tra "Kho hàng" → không có chevron nếu chỉ có 1 item
- [ ] Click vào single item → navigate đúng, không có accordion behavior

---

### 📜 Test Scroll Bar

#### Test scroll khi có nhiều items:
- [ ] Mở tất cả groups → scroll bar xuất hiện
- [ ] Scroll xuống → có thể đến mục cuối cùng ("AI")
- [ ] Scroll lên → có thể quay lại mục đầu tiên ("Dashboard")
- [ ] Scroll bar styling đẹp, mỏng (thin)

#### Test scroll khi expand groups:
- [ ] Ban đầu chỉ thấy một số groups ở trên
- [ ] Mở "Hệ thống" (ở cuối) → có thể scroll xuống để thấy
- [ ] Mở nhiều groups → vẫn có thể scroll đến tất cả mục
- [ ] Đóng một số groups → scroll bar vẫn hoạt động đúng

#### Test scroll bar trên các browsers:
- [ ] Chrome/Safari (Webkit) → scrollbar mỏng, đẹp
- [ ] Firefox → scrollbar mỏng, đẹp
- [ ] Edge → scrollbar mỏng, đẹp

---

### 🎨 Test Active State

#### Test active state detection:
- [ ] Navigate đến "/dashboard" → "Main Dashboard" được highlight
- [ ] Navigate đến "/crm" → "CRM Dashboard" được highlight
- [ ] Navigate đến "/reports/financial" → "Financial" được highlight
- [ ] Navigate đến "/settings" → "Settings" được highlight

#### Test active state với groups:
- [ ] Navigate đến "/dashboard" → "Dashboard" group header có background nhẹ
- [ ] Navigate đến "/crm" → "Khách hàng" group header có background nhẹ
- [ ] Navigate đến "/operations" → "Hệ thống" group header có background nhẹ

#### Test active state styling:
- [ ] Active item có `bg-white/20` và `font-semibold`
- [ ] Active item icon có màu đậm hơn
- [ ] Hover trên active item → vẫn giữ active state
- [ ] Hover trên non-active item → có hover effect

---

### 📱 Test Responsive

#### Test Desktop (≥1024px):
- [ ] Sidebar hiển thị cố định bên trái
- [ ] Click toggle button → sidebar thu gọn/mở rộng
- [ ] Khi sidebar thu gọn → main content mở rộng
- [ ] Khi sidebar mở → main content thu lại
- [ ] Animation mượt mà khi toggle

#### Test Mobile (<1024px):
- [ ] Sidebar ẩn mặc định
- [ ] Click menu button (☰) → sidebar slide từ trái
- [ ] Overlay xuất hiện khi sidebar mở
- [ ] Click overlay → sidebar đóng
- [ ] Click menu item → sidebar tự động đóng
- [ ] Animation slide mượt mà

#### Test Tablet (768px - 1023px):
- [ ] Sidebar hoạt động như mobile
- [ ] Layout responsive đúng

---

### 🔗 Test Routes và Navigation

#### Test tất cả routes:
- [ ] Click "Main Dashboard" → navigate đến "/dashboard"
- [ ] Click "CEO Control Tower" → navigate đến "/control-tower"
- [ ] Click "Booking Calendar" → navigate đến "/booking"
- [ ] Click "CRM Dashboard" → navigate đến "/crm"
- [ ] Click "Membership" → navigate đến "/membership"
- [ ] Click "Services" → navigate đến "/services"
- [ ] Click "Inventory" → navigate đến "/inventory"
- [ ] Click "POS" → navigate đến "/pos"
- [ ] Click "Reports" → navigate đến "/reports"
- [ ] Click "Marketing Dashboard" → navigate đến "/marketing/dashboard"
- [ ] Click "Quality" → navigate đến "/quality"
- [ ] Click "Operations" → navigate đến "/operations"
- [ ] Click "Settings" → navigate đến "/settings"
- [ ] Click "Mina AI" → navigate đến "/mina"

#### Test nested routes:
- [ ] Navigate đến "/reports/financial" → "Financial" được highlight
- [ ] Navigate đến "/marketing/dashboard" → "Marketing Dashboard" được highlight
- [ ] Navigate đến "/training/dashboard" → "Training" được highlight
- [ ] Navigate đến "/partner/hq" → "Partner HQ" được highlight

---

### ⚡ Test Performance và UX

#### Test animations:
- [ ] Expand/collapse groups → animation mượt mà (200ms)
- [ ] Hover effects → transition mượt mà
- [ ] Active state changes → không có flicker
- [ ] Sidebar toggle → animation mượt mà (300ms)

#### Test interactions:
- [ ] Click group header → toggle ngay lập tức
- [ ] Click menu item → navigate ngay lập tức
- [ ] Hover trên items → feedback ngay lập tức
- [ ] Scroll → mượt mà, không lag

#### Test edge cases:
- [ ] User không có role → không thấy menu items
- [ ] User có nhiều roles → thấy tất cả items phù hợp
- [ ] Groups không có trong GROUP_ORDER → sort alphabet
- [ ] Empty groups → không render
- [ ] Very long group names → không bị overflow

---

### ♿ Test Accessibility

#### Test keyboard navigation:
- [ ] Tab qua các menu items → focus rõ ràng
- [ ] Enter trên group header → expand/collapse
- [ ] Enter trên menu item → navigate
- [ ] Escape → đóng sidebar (mobile)

#### Test screen readers:
- [ ] Sidebar có `role="navigation"` và `aria-label`
- [ ] Accordion buttons có `aria-expanded` và `aria-controls`
- [ ] Active links có `aria-current="page"`
- [ ] Tất cả buttons có accessible labels

---

## 🎯 Kết quả mong muốn

✅ **Cấu trúc sidebar rõ ràng**: Groups được sắp xếp theo thứ tự nghiệp vụ (GROUP_ORDER)

✅ **Dễ cuộn**: Container có height cố định với scroll bar, luôn có thể scroll đến mục cuối

✅ **Mỗi nhóm độc lập**: Expand/collapse không ảnh hưởng nhau

✅ **Không mất mục**: Kể cả khi mở nhiều groups, vẫn có thể scroll đến tất cả mục

✅ **Dễ maintain**: Chỉ cần chỉnh `MENU_ITEMS` và `roles` để thêm/sửa/xóa menu items

✅ **Role-based**: Filtering theo quyền người dùng hoạt động chính xác

✅ **Responsive**: Hoạt động tốt trên desktop, tablet và mobile

✅ **Accessible**: Hỗ trợ keyboard navigation và screen readers

---

## 📝 Notes

- **Không phá vỡ routes**: Tất cả routes cũ vẫn hoạt động bình thường
- **Không phá vỡ quyền**: Logic filter theo roles giữ nguyên
- **Backward compatible**: Có thể rollback về code cũ nếu cần
- **Performance**: Không có re-render không cần thiết, animations mượt mà

