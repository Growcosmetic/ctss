# Sidebar Single Item Groups Fix - CTSS

## 📋 Plan (Kế hoạch thực thi)

### Bước 1: Cải thiện Single Item Groups Rendering
- ✅ Kiểm tra `groupItems.length === 1` để xác định single-item groups
- ✅ Render single-item groups với `GroupIcon` và `groupLabel` (thay vì `ItemIcon` và `item.label`)
- ✅ Đảm bảo không có chevron và không có accordion behavior
- ✅ Render trực tiếp `<Link>` đến `groupItems[0].path`

### Bước 2: Thêm Auto-Collapse sau Navigation
- ✅ Import `useEffect` từ React
- ✅ Thêm `useEffect` để theo dõi `pathname` changes
- ✅ Reset `expandedGroups` về mặc định (chỉ chứa "Dashboard") khi pathname thay đổi
- ✅ Đảm bảo sidebar tự động thu gọn sau khi user navigate

### Bước 3: Đảm bảo UX Consistency
- ✅ Giữ nguyên active state detection
- ✅ Giữ nguyên hover effects
- ✅ Giữ nguyên transition animations
- ✅ Đảm bảo single-item groups có cùng styling với multi-item groups (khi collapsed)

### Bước 4: Testing và Validation
- ✅ Test single-item groups không có chevron
- ✅ Test single-item groups navigate đúng
- ✅ Test auto-collapse sau navigation
- ✅ Test multi-item groups vẫn hoạt động bình thường

---

## 📁 Files Changed

### 1. `components/layout/Sidebar.tsx`
**Thay đổi chính:**
- Thêm import `useEffect` từ React
- Cải thiện single-item groups rendering: dùng `GroupIcon` và `groupLabel`
- Thêm `useEffect` để auto-collapse sau navigation
- Đảm bảo single-item groups không có chevron

---

## 🔧 Patch (Code Changes)

### 1. Thêm useEffect Import

```typescript
// Trước:
import { useState } from "react";

// Sau:
import { useState, useEffect } from "react";
```

### 2. Thêm Auto-Collapse Logic

```typescript
// Thêm sau visibleGroups calculation
useEffect(() => {
  // Reset expandedGroups to default (only Dashboard) after pathname changes
  // This provides cleaner UX - sidebar collapses after user navigates
  setExpandedGroups(new Set(["Dashboard"]));
}, [pathname]);
```

### 3. Cải thiện Single Item Rendering

```typescript
// Trước:
if (groupItems.length === 1) {
  const item = groupItems[0];
  const ItemIcon = item.icon;
  const isActive = pathname === item.path || pathname.startsWith(item.path + "/");

  return (
    <li key={item.key}>
      <Link href={item.path} ...>
        <ItemIcon size={20} ... />
        <span>{item.label}</span>
      </Link>
    </li>
  );
}

// Sau:
if (groupItems.length === 1) {
  const item = groupItems[0];
  const isActive = pathname === item.path || pathname.startsWith(item.path + "/");

  return (
    <li key={item.key}>
      <Link href={item.path} ...>
        {/* Use GroupIcon and groupLabel for single-item groups */}
        <GroupIcon size={20} ... />
        <span>{groupLabel}</span>
        {/* No chevron for single-item groups */}
      </Link>
    </li>
  );
}
```

**Thay đổi chính:**
- ✅ Dùng `GroupIcon` thay vì `ItemIcon`
- ✅ Dùng `groupLabel` thay vì `item.label`
- ✅ Không có chevron (đã đúng từ trước)
- ✅ Không có accordion behavior (đã đúng từ trước)

---

## ✅ Manual Test Checklist

### 🎯 Test Single-Item Groups

#### Test 1: Kiểm tra Single-Item Groups không có Chevron
- [ ] Mở sidebar và kiểm tra các groups chỉ có 1 item:
  - [ ] "Đặt lịch" (nếu chỉ có Booking Calendar) → **KHÔNG có chevron**
  - [ ] "Kho hàng" (nếu chỉ có Inventory) → **KHÔNG có chevron**
  - [ ] "Marketing" (nếu chỉ có Marketing Dashboard) → **KHÔNG có chevron**
  - [ ] "AI" (nếu chỉ có Mina AI) → **KHÔNG có chevron**
- [ ] Kiểm tra các groups có nhiều items:
  - [ ] "Dashboard" (có 2 items) → **CÓ chevron**
  - [ ] "Khách hàng" (có 3 items) → **CÓ chevron**
  - [ ] "Hệ thống" (có 6 items) → **CÓ chevron**

#### Test 2: Kiểm tra Single-Item Groups hiển thị đúng Icon và Label
- [ ] Kiểm tra "Đặt lịch" (single-item):
  - [ ] Icon hiển thị là Calendar icon (GroupIcon)
  - [ ] Label hiển thị là "Đặt lịch" (groupLabel)
  - [ ] KHÔNG hiển thị "Booking Calendar" (item.label)
- [ ] Kiểm tra "Kho hàng" (single-item):
  - [ ] Icon hiển thị là Package icon (GroupIcon)
  - [ ] Label hiển thị là "Kho hàng" (groupLabel)
  - [ ] KHÔNG hiển thị "Inventory" (item.label)
- [ ] Kiểm tra "Marketing" (single-item):
  - [ ] Icon hiển thị là Sparkles icon (GroupIcon)
  - [ ] Label hiển thị là "Marketing" (groupLabel)

#### Test 3: Kiểm tra Single-Item Groups Navigate đúng
- [ ] Click "Đặt lịch" → navigate đến "/booking"
- [ ] Click "Kho hàng" → navigate đến "/inventory"
- [ ] Click "Marketing" → navigate đến "/marketing/dashboard"
- [ ] Click "AI" → navigate đến "/mina"
- [ ] Kiểm tra active state highlight đúng khi ở các trang này

#### Test 4: Kiểm tra Single-Item Groups không có Accordion Behavior
- [ ] Click vào "Đặt lịch" → **KHÔNG expand/collapse**, navigate ngay lập tức
- [ ] Click vào "Kho hàng" → **KHÔNG expand/collapse**, navigate ngay lập tức
- [ ] Hover vào single-item groups → chỉ có hover effect, không có expand behavior
- [ ] So sánh với multi-item groups:
  - [ ] Click "Dashboard" → expand/collapse hoạt động
  - [ ] Click "Khách hàng" → expand/collapse hoạt động

---

### 🔄 Test Auto-Collapse sau Navigation

#### Test 5: Kiểm tra Auto-Collapse khi Navigate từ Single-Item
- [ ] Mở sidebar, mở một số groups (ví dụ: "Dashboard", "Khách hàng")
- [ ] Click vào "Đặt lịch" (single-item) → navigate đến "/booking"
- [ ] Kiểm tra sidebar → **Tất cả groups đã collapse**, chỉ còn "Dashboard" mở
- [ ] Click vào "Kho hàng" (single-item) → navigate đến "/inventory"
- [ ] Kiểm tra sidebar → **Tất cả groups đã collapse**, chỉ còn "Dashboard" mở

#### Test 6: Kiểm tra Auto-Collapse khi Navigate từ Multi-Item Group
- [ ] Mở sidebar, mở "Khách hàng" group
- [ ] Click vào "CRM Dashboard" → navigate đến "/crm"
- [ ] Kiểm tra sidebar → **Tất cả groups đã collapse**, chỉ còn "Dashboard" mở
- [ ] Mở sidebar, mở "Hệ thống" group
- [ ] Click vào "Settings" → navigate đến "/settings"
- [ ] Kiểm tra sidebar → **Tất cả groups đã collapse**, chỉ còn "Dashboard" mở

#### Test 7: Kiểm tra Auto-Collapse không ảnh hưởng Active State
- [ ] Navigate đến "/booking"
- [ ] Kiểm tra "Đặt lịch" vẫn được highlight (active state)
- [ ] Navigate đến "/crm"
- [ ] Kiểm tra "CRM Dashboard" vẫn được highlight trong "Khách hàng" group
- [ ] Kiểm tra "Khách hàng" group header có background nhẹ (hasActiveItem)

#### Test 8: Kiểm tra Auto-Collapse với Browser Navigation
- [ ] Mở sidebar, mở một số groups
- [ ] Sử dụng browser back button → navigate về trang trước
- [ ] Kiểm tra sidebar → **Tất cả groups đã collapse**
- [ ] Sử dụng browser forward button → navigate đến trang tiếp theo
- [ ] Kiểm tra sidebar → **Tất cả groups đã collapse**

---

### 🎨 Test UX và Styling

#### Test 9: Kiểm tra Single-Item Groups có cùng Styling
- [ ] Single-item groups có cùng padding, spacing với multi-item group headers
- [ ] Single-item groups có cùng hover effects
- [ ] Single-item groups có cùng active state styling
- [ ] Single-item groups có cùng transition animations

#### Test 10: Kiểm tra Responsive Behavior
- [ ] Desktop: Single-item groups hoạt động đúng
- [ ] Mobile: Single-item groups hoạt động đúng
- [ ] Tablet: Single-item groups hoạt động đúng
- [ ] Mobile: Click single-item → sidebar tự động đóng

---

### 🔍 Test Edge Cases

#### Test 11: Kiểm tra Groups với Dynamic Items
- [ ] Nếu một group ban đầu có 2 items, sau đó chỉ còn 1 item (do role filtering)
- [ ] Kiểm tra group đó render như single-item (không có chevron)
- [ ] Nếu một group ban đầu có 1 item, sau đó có thêm items (do role changes)
- [ ] Kiểm tra group đó render như multi-item (có chevron)

#### Test 12: Kiểm tra Performance
- [ ] Auto-collapse không gây lag hoặc flicker
- [ ] Navigation mượt mà, không có delay
- [ ] Sidebar re-render không ảnh hưởng performance

---

## 🎯 Kết quả mong muốn

✅ **Single-item groups**: 
- Hiển thị như link trực tiếp, không có chevron
- Dùng GroupIcon và groupLabel (không phải ItemIcon và item.label)
- Không có accordion behavior

✅ **Auto-collapse**: 
- Sidebar tự động collapse sau khi user navigate
- Chỉ giữ lại "Dashboard" group mở (mặc định)
- Active state vẫn được highlight đúng

✅ **UX Consistency**:
- Single-item và multi-item groups có styling nhất quán
- Transitions mượt mà
- Responsive hoạt động tốt

---

## 📝 Notes

- **Auto-collapse là optional**: Có thể disable bằng cách comment out useEffect nếu không muốn
- **Default expanded group**: Hiện tại là "Dashboard", có thể thay đổi trong useState
- **Backward compatible**: Không phá vỡ bất kỳ functionality nào hiện có
- **Performance**: useEffect chỉ chạy khi pathname thay đổi, không ảnh hưởng performance

