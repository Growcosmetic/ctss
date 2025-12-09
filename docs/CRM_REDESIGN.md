# CRM Page Redesign - Documentation

## 📋 Tổng quan

Trang CRM đã được redesign với **layout 3 cột** theo hình ảnh tham khảo, cho phép:
- Xem danh sách khách hàng ở bên trái
- Xem và chỉnh sửa chi tiết khách hàng ở giữa (inline edit)
- Xem lịch sử hoạt động ở bên phải

---

## 🏗️ Cấu trúc Layout

### Layout 3 Cột

```
┌─────────────────────────────────────────────────────────────┐
│                         Header (72px)                        │
├──────────────┬──────────────────────────┬───────────────────┤
│              │                          │                   │
│  LEFT PANEL  │      CENTER PANEL        │   RIGHT PANEL     │
│  (30% - 320px)│      (40% - flex)        │   (30% - 320px)   │
│              │                          │                   │
│  Customer    │   Customer Detail        │   Activity        │
│  List        │   (Inline Edit)          │   History         │
│              │                          │                   │
└──────────────┴──────────────────────────┴───────────────────┘
```

---

## 📁 Các Component Mới

### 1. `components/crm/CustomerListPanel.tsx`
**Vị trí:** Left Panel (30%)

**Chức năng:**
- Hiển thị danh sách khách hàng với avatar
- Search bar để tìm kiếm
- Highlight khách hàng được chọn
- Click vào khách hàng → Hiển thị chi tiết ở center panel

**Props:**
```typescript
interface CustomerListPanelProps {
  customers: Customer[];
  selectedCustomerId: string | null;
  onSelectCustomer: (customer: Customer) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}
```

**Tính năng:**
- ✅ Search theo tên, SĐT, mã khách hàng
- ✅ Nút "Tìm nâng cao" (chưa implement)
- ✅ Nút "Xuất" (chưa implement)
- ✅ Avatar với initials nếu không có ảnh
- ✅ Highlight màu xanh khi được chọn

---

### 2. `components/crm/CustomerDetailPanel.tsx`
**Vị trí:** Center Panel (40%)

**Chức năng:**
- Hiển thị chi tiết khách hàng được chọn
- **Edit inline** - Không cần modal
- Profile card với stats
- Tabs: "Thông tin cá nhân", "Ghi chú", "Người thân"

**Props:**
```typescript
interface CustomerDetailPanelProps {
  customer: Customer | null;
  onUpdate: () => void;
  onDelete: (id: string) => void;
}
```

**Tính năng:**
- ✅ **View Mode**: Hiển thị thông tin read-only
- ✅ **Edit Mode**: Click "Sửa" → Form hiển thị inline
- ✅ **Save**: Click "Lưu" → Tự động cập nhật và quay về view mode
- ✅ **Cancel**: Click "Hủy" → Quay về view mode, không lưu
- ✅ **Delete**: Click "Xóa" → Xóa khách hàng

**Các trường có thể chỉnh sửa:**
- Họ tên (bắt buộc)
- Số điện thoại (bắt buộc)
- Email
- Ngày sinh (dropdown: ngày/tháng/năm)
- Giới tính (radio: Nam/Nữ)
- Địa chỉ
- Ghi chú

**Profile Card hiển thị:**
- Avatar với initials
- Khởi tạo lúc
- Ghé thăm lần cuối
- Hạng khách hàng
- Điểm thưởng
- Stats: Tổng đặt trước, đến trực tiếp, hủy, tổng chi tiêu

---

### 3. `components/crm/CustomerActivityPanel.tsx`
**Vị trí:** Right Panel (30%)

**Chức năng:**
- Hiển thị lịch sử hoạt động của khách hàng
- Tabs: "Lịch sử giao dịch", "Ảnh Khách Hàng"

**Props:**
```typescript
interface CustomerActivityPanelProps {
  customerId: string | null;
}
```

**Tính năng:**
- ✅ Các section có thể expand/collapse:
  - Lịch hẹn sắp tới
  - Đơn hàng đã thực hiện
  - Các lần trả tiền
  - Thẻ dịch vụ của khách
  - Dịch vụ & Sản phẩm yêu thích
  - Nhắc nhở chưa thực hiện
  - Hồ sơ ghi chú

**State:**
- `expandedSections`: Set<string> - Lưu các section đang mở
- Mặc định mở: "appointments", "orders"

---

## 🔄 Workflow

### 1. Xem danh sách khách hàng
```
User → Click vào khách hàng ở LEFT PANEL
     → Hiển thị chi tiết ở CENTER PANEL
     → Hiển thị lịch sử ở RIGHT PANEL
```

### 2. Chỉnh sửa khách hàng (Inline Edit)
```
User → Click "Sửa" ở CENTER PANEL header
     → Form hiển thị inline (không phải modal)
     → Điền/sửa thông tin
     → Click "Lưu" → Tự động cập nhật → Quay về view mode
     → HOẶC Click "Hủy" → Quay về view mode, không lưu
```

### 3. Thêm khách hàng mới
```
User → Click "Thêm khách hàng" (button ở đâu đó - cần thêm)
     → Modal CustomerFormModal hiển thị
     → Điền form → Lưu
     → Tự động refresh danh sách
```

### 4. Xóa khách hàng
```
User → Click "Xóa" ở CENTER PANEL header
     → Confirm dialog
     → Xóa → Tự động refresh danh sách
```

---

## 📝 Thay đổi trong `app/crm/page.tsx`

### State mới:
```typescript
const [listSearchTerm, setListSearchTerm] = useState(""); // Search trong left panel
```

### Functions mới:
```typescript
const handleCustomerUpdate = () => {
  // Refresh danh sách sau khi update
  fetchCustomers().then(() => {
    if (selectedCustomer) {
      const updated = customers.find((c) => c.id === selectedCustomer.id);
      if (updated) {
        setSelectedCustomer(updated);
      }
    }
  });
};

const handleSelectCustomer = (customer: Customer) => {
  setSelectedCustomer(customer);
};
```

### Layout mới:
```tsx
<div className="flex h-[calc(100vh-72px)] overflow-hidden">
  <CustomerListPanel ... />
  <CustomerDetailPanel ... />
  <CustomerActivityPanel ... />
</div>
```

### Layout cũ (đã ẩn):
- Header với stats cards
- Filters và search bar
- Table với tabs
- Pagination

**Lưu ý:** Layout cũ vẫn còn trong code nhưng đã được ẩn bằng `<div className="hidden">`. Có thể xóa sau khi xác nhận layout mới hoạt động tốt.

---

## 🎨 Styling

### Colors:
- **Selected customer**: `bg-blue-50 border-l-4 border-blue-500`
- **Profile card**: `bg-gradient-to-br from-blue-50 to-purple-50`
- **Edit mode**: Form fields với border và focus ring

### Sizes:
- **Left Panel**: `w-80` (320px)
- **Right Panel**: `w-80` (320px)
- **Center Panel**: `flex-1` (tự động điều chỉnh)
- **Height**: `h-[calc(100vh-72px)]` (trừ header)

---

## 🔌 API Integration

### CustomerDetailPanel sử dụng:
- `saveCustomer()` từ `features/crm/services/crmApi.ts`
- Endpoint: `POST /api/crm/customer`
- Tự động refresh sau khi save

### CustomerListPanel sử dụng:
- `customers` prop từ parent component
- Filter và search client-side

---

## 🐛 Bugs đã fix

1. **Missing useState import** trong `CustomerActivityPanel.tsx`
   - ✅ Fixed: Thêm `useState` vào import từ React

---

## 📋 TODO / Cần hoàn thiện

### High Priority:
- [ ] Thêm nút "Thêm khách hàng" vào header của left panel hoặc center panel
- [ ] Implement "Tìm nâng cao" trong left panel
- [ ] Implement "Xuất" (Export) trong left panel
- [ ] Load dữ liệu thực từ API cho Activity Panel (hiện tại chỉ mock)

### Medium Priority:
- [ ] Thêm validation cho form edit inline
- [ ] Thêm loading state khi save
- [ ] Thêm error handling tốt hơn
- [ ] Responsive design cho mobile/tablet

### Low Priority:
- [ ] Thêm animation khi chuyển giữa view/edit mode
- [ ] Thêm keyboard shortcuts (Esc để cancel, Ctrl+S để save)
- [ ] Thêm undo/redo cho edit

---

## 🔗 Related Files

### Components:
- `components/crm/CustomerListPanel.tsx` - Left panel
- `components/crm/CustomerDetailPanel.tsx` - Center panel
- `components/crm/CustomerActivityPanel.tsx` - Right panel
- `components/crm/CustomerFormModal.tsx` - Modal để thêm khách hàng mới

### Pages:
- `app/crm/page.tsx` - Main CRM page

### Services:
- `features/crm/services/crmApi.ts` - API calls

### Types:
- `features/crm/types/index.ts` - TypeScript types

---

## 📸 Screenshots / Reference

Layout được thiết kế dựa trên hình ảnh tham khảo với:
- Left: Danh sách khách hàng với search
- Center: Chi tiết khách hàng với edit inline
- Right: Lịch sử giao dịch và hoạt động

---

## 💡 Notes

- **Edit inline** là điểm khác biệt chính so với design cũ (dùng modal)
- Layout 3 cột giúp workflow nhanh hơn, không cần mở/đóng modal
- Tất cả panels có scroll độc lập
- State được quản lý ở parent component (`app/crm/page.tsx`)

---

**Last Updated:** 2025-01-XX
**Version:** 1.0.0

