# All Modules Page Implementation - CTSS

## 📋 Plan (Kế hoạch thực thi)

### Bước 1: Tạo Shared Data Source
- ✅ Tạo `lib/menuItems.ts` để export MENU_ITEMS, GROUP_ORDER, GROUP_ICONS
- ✅ Refactor Sidebar.tsx để import từ shared file
- ✅ Đảm bảo single source of truth cho menu data

### Bước 2: Tạo Route và Page
- ✅ Tạo `app/modules/page.tsx` với route `/modules`
- ✅ Sử dụng MainLayout và useAuth để đảm bảo authentication
- ✅ Hiển thị loading state khi đang kiểm tra auth

### Bước 3: Implement Search Functionality
- ✅ Search bar với icon và clear button
- ✅ Filter theo tên module, group, hoặc path
- ✅ Real-time search với useMemo để optimize performance

### Bước 4: Implement Filter Functionality
- ✅ Filter buttons cho từng group
- ✅ "Tất cả" button để reset filter
- ✅ Hiển thị số lượng modules trong mỗi group
- ✅ Active state cho selected filter

### Bước 5: Implement Module Cards Grid
- ✅ Responsive grid: 1 col mobile, 2 cols tablet, 3-4 cols desktop
- ✅ Module card với icon, label, group, path
- ✅ Hover effects và transitions
- ✅ Click để navigate đến module path

### Bước 6: Implement Favorite Feature (Optional)
- ✅ Star button trên mỗi card
- ✅ Toggle favorite với localStorage persistence
- ✅ Visual feedback khi favorite/unfavorite

### Bước 7: Role-based Filtering
- ✅ Filter modules theo user roles
- ✅ Chỉ hiển thị modules user có quyền truy cập
- ✅ Ẩn modules không có quyền

### Bước 8: UX Improvements
- ✅ Results count display
- ✅ Empty state khi không tìm thấy
- ✅ Loading states
- ✅ Responsive design

---

## 📁 Files Changed

### 1. `lib/menuItems.ts` (NEW)
**File mới - Shared data source:**
- Export `MenuItemData` interface
- Export `MENU_ITEMS` array
- Export `GROUP_ORDER` array
- Export `GROUP_ICONS` mapping

### 2. `app/modules/page.tsx` (NEW)
**File mới - All Modules page:**
- Route: `/modules`
- Search functionality
- Group filter functionality
- Module cards grid
- Favorite feature
- Role-based filtering

### 3. `components/layout/Sidebar.tsx` (MODIFIED)
**File đã sửa - Import từ shared file:**
- Import MENU_ITEMS, GROUP_ORDER, GROUP_ICONS từ `lib/menuItems.ts`
- Xóa duplicate definitions
- Giữ nguyên functionality

---

## 🔧 Patch (Code Changes)

### 1. Tạo Shared Data Source (`lib/menuItems.ts`)

```typescript
// Export interface
export interface MenuItemData {
  key: string;
  label: string;
  path: string;
  group: string;
  icon: any;
  roles: CTSSRole[];
  children?: MenuItemData[];
}

// Export MENU_ITEMS array (25+ items)
export const MENU_ITEMS: MenuItemData[] = [
  { key: "dashboard-main", label: "Main Dashboard", path: "/dashboard", group: "Dashboard", ... },
  // ... all items
];

// Export GROUP_ORDER
export const GROUP_ORDER: string[] = [
  "Dashboard", "Đặt lịch", "Khách hàng", ...
];

// Export GROUP_ICONS
export const GROUP_ICONS: Record<string, any> = {
  Dashboard: LayoutDashboard,
  // ... all groups
};
```

### 2. Tạo Modules Page (`app/modules/page.tsx`)

```typescript
"use client";

export default function ModulesPage() {
  const { user, hasAnyRole, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Filter modules by user roles
  const visibleModules = useMemo(() => {
    if (!user) return [];
    return MENU_ITEMS.filter((item) => hasAnyRole(item.roles));
  }, [user, hasAnyRole]);

  // Filter by search and group
  const filteredModules = useMemo(() => {
    let filtered = visibleModules;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.label.toLowerCase().includes(query) ||
          item.group.toLowerCase().includes(query) ||
          item.path.toLowerCase().includes(query)
      );
    }
    if (selectedGroup) {
      filtered = filtered.filter((item) => item.group === selectedGroup);
    }
    return filtered;
  }, [visibleModules, searchQuery, selectedGroup]);

  // Toggle favorite with localStorage
  const toggleFavorite = (key: string, e: React.MouseEvent) => {
    // ... implementation
  };

  return (
    <MainLayout>
      {/* Search Bar */}
      {/* Group Filters */}
      {/* Modules Grid */}
    </MainLayout>
  );
}
```

### 3. Update Sidebar (`components/layout/Sidebar.tsx`)

```typescript
// Before: Local definitions
const MENU_ITEMS: MenuItemData[] = [...];
const GROUP_ORDER: string[] = [...];
const GROUP_ICONS: Record<string, any> = {...};

// After: Import from shared file
import { MENU_ITEMS, GROUP_ORDER, GROUP_ICONS, MenuItemData } from "@/lib/menuItems";
```

---

## ✅ Manual Test Checklist

### 🔍 Test 1: Search Functionality

- [ ] **1.1** Kiểm tra search bar hiển thị đúng
  - [ ] Search icon ở bên trái
  - [ ] Placeholder text rõ ràng
  - [ ] Clear button (X) xuất hiện khi có text

- [ ] **1.2** Kiểm tra search theo tên module
  - [ ] Gõ "Dashboard" → hiển thị các modules có "Dashboard" trong tên
  - [ ] Gõ "CRM" → hiển thị "CRM Dashboard"
  - [ ] Gõ "Reports" → hiển thị "Reports" và "Financial"

- [ ] **1.3** Kiểm tra search theo group
  - [ ] Gõ "Khách hàng" → hiển thị tất cả modules trong group "Khách hàng"
  - [ ] Gõ "Hệ thống" → hiển thị tất cả modules trong group "Hệ thống"

- [ ] **1.4** Kiểm tra search theo path
  - [ ] Gõ "/dashboard" → hiển thị modules có path chứa "/dashboard"
  - [ ] Gõ "/reports" → hiển thị modules có path chứa "/reports"

- [ ] **1.5** Kiểm tra clear search
  - [ ] Click X button → search query được clear
  - [ ] Sau khi clear → hiển thị tất cả modules

- [ ] **1.6** Kiểm tra case-insensitive search
  - [ ] Gõ "dashboard" (lowercase) → tìm thấy "Dashboard"
  - [ ] Gõ "CRM" (uppercase) → tìm thấy "CRM Dashboard"

---

### 🎯 Test 2: Group Filter Functionality

- [ ] **2.1** Kiểm tra filter buttons hiển thị đúng
  - [ ] "Tất cả" button hiển thị số lượng tổng
  - [ ] Mỗi group có button với icon và số lượng
  - [ ] Buttons được sắp xếp theo GROUP_ORDER

- [ ] **2.2** Kiểm tra filter theo group
  - [ ] Click "Dashboard" → chỉ hiển thị modules trong group "Dashboard"
  - [ ] Click "Khách hàng" → chỉ hiển thị modules trong group "Khách hàng"
  - [ ] Click "Hệ thống" → chỉ hiển thị modules trong group "Hệ thống"

- [ ] **2.3** Kiểm tra active state
  - [ ] Selected filter có background blue và text white
  - [ ] Non-selected filters có background gray
  - [ ] Hover effect hoạt động đúng

- [ ] **2.4** Kiểm tra reset filter
  - [ ] Click "Tất cả" → hiển thị tất cả modules
  - [ ] Click lại group đang selected → deselect và hiển thị tất cả

- [ ] **2.5** Kiểm tra filter kết hợp với search
  - [ ] Chọn filter "Dashboard" + search "Main" → chỉ hiển thị "Main Dashboard"
  - [ ] Chọn filter "Khách hàng" + search "CRM" → chỉ hiển thị "CRM Dashboard"

---

### 🎨 Test 3: Module Cards Display

- [ ] **3.1** Kiểm tra card layout
  - [ ] Mỗi card có icon, label, group, path
  - [ ] Icon hiển thị trong box màu xanh nhạt
  - [ ] Label là font-semibold
  - [ ] Path hiển thị bằng font-mono

- [ ] **3.2** Kiểm tra hover effects
  - [ ] Hover trên card → shadow và border color thay đổi
  - [ ] Icon background chuyển sang màu xanh đậm hơn
  - [ ] Label color chuyển sang blue
  - [ ] Transitions mượt mà

- [ ] **3.3** Kiểm tra click navigation
  - [ ] Click card → navigate đến path tương ứng
  - [ ] Click "Main Dashboard" → navigate đến "/dashboard"
  - [ ] Click "CRM Dashboard" → navigate đến "/crm"
  - [ ] Click "Settings" → navigate đến "/settings"

- [ ] **3.4** Kiểm tra favorite button
  - [ ] Star icon hiển thị ở góc trên phải
  - [ ] Click star → toggle favorite (fill/unfill)
  - [ ] Favorite được lưu trong localStorage
  - [ ] Refresh page → favorites vẫn được giữ

---

### 📱 Test 4: Responsive Design

- [ ] **4.1** Test Desktop (≥1024px)
  - [ ] Grid hiển thị 4 cột (xl:grid-cols-4)
  - [ ] Cards có kích thước phù hợp
  - [ ] Search bar và filters hiển thị đầy đủ

- [ ] **4.2** Test Tablet (768px - 1023px)
  - [ ] Grid hiển thị 3 cột (lg:grid-cols-3)
  - [ ] Cards vẫn dễ đọc và click
  - [ ] Filters có thể wrap xuống dòng

- [ ] **4.3** Test Mobile (<768px)
  - [ ] Grid hiển thị 2 cột (md:grid-cols-2)
  - [ ] Cards có kích thước phù hợp với màn hình nhỏ
  - [ ] Search bar full width
  - [ ] Filter buttons có thể scroll ngang hoặc wrap

- [ ] **4.4** Test Very Small Mobile (<480px)
  - [ ] Grid hiển thị 1 cột (grid-cols-1)
  - [ ] Cards vẫn dễ sử dụng
  - [ ] Text không bị overflow

---

### 🔐 Test 5: Role-based Filtering

- [ ] **5.1** Test với ADMIN role
  - [ ] Đăng nhập với ADMIN
  - [ ] Kiểm tra thấy tất cả modules (25+ modules)
  - [ ] Kiểm tra thấy "CEO Control Tower", "Partner HQ", "Settings"

- [ ] **5.2** Test với MANAGER role
  - [ ] Đăng nhập với MANAGER
  - [ ] Kiểm tra KHÔNG thấy "CEO Control Tower", "Partner HQ", "Settings"
  - [ ] Kiểm tra thấy các modules khác như ADMIN

- [ ] **5.3** Test với STYLIST role
  - [ ] Đăng nhập với STYLIST
  - [ ] Kiểm tra chỉ thấy modules phù hợp:
    - [ ] Dashboard (Main Dashboard)
    - [ ] Đặt lịch
    - [ ] Khách hàng (CRM Dashboard)
    - [ ] Dịch vụ (Services)
    - [ ] Nhân viên (Staff)
    - [ ] Analytics (Hair Health)
    - [ ] AI (Mina AI)
  - [ ] Kiểm tra KHÔNG thấy các modules quản lý

- [ ] **5.4** Test với RECEPTIONIST role
  - [ ] Đăng nhập với RECEPTIONIST
  - [ ] Kiểm tra thấy các modules phù hợp với role
  - [ ] Kiểm tra KHÔNG thấy các modules không phù hợp

- [ ] **5.5** Test với ASSISTANT role
  - [ ] Đăng nhập với ASSISTANT
  - [ ] Kiểm tra thấy các modules phù hợp với role

---

### 🔄 Test 6: Integration với Sidebar

- [ ] **6.1** Kiểm tra Sidebar vẫn hoạt động đúng
  - [ ] Sidebar hiển thị đúng menu items
  - [ ] Navigation trong sidebar hoạt động
  - [ ] Accordion expand/collapse hoạt động

- [ ] **6.2** Kiểm tra data consistency
  - [ ] Modules trong page giống với sidebar
  - [ ] Groups giống nhau
  - [ ] Icons giống nhau
  - [ ] Paths giống nhau

- [ ] **6.3** Kiểm tra không ảnh hưởng Sidebar
  - [ ] Sidebar không bị lỗi sau khi tạo modules page
  - [ ] Sidebar vẫn filter đúng theo roles
  - [ ] Sidebar vẫn sort đúng theo GROUP_ORDER

---

### ⚡ Test 7: Performance và UX

- [ ] **7.1** Kiểm tra loading states
  - [ ] Hiển thị loading khi đang check auth
  - [ ] Loading spinner và text rõ ràng
  - [ ] Không có flicker khi load

- [ ] **7.2** Kiểm tra empty states
  - [ ] Khi không tìm thấy modules → hiển thị empty state
  - [ ] Empty state có message rõ ràng
  - [ ] Có gợi ý thay đổi search/filter

- [ ] **7.3** Kiểm tra results count
  - [ ] Hiển thị "Hiển thị X / Y modules"
  - [ ] Count cập nhật khi search/filter
  - [ ] Count chính xác

- [ ] **7.4** Kiểm tra performance
  - [ ] Search không lag khi gõ nhanh
  - [ ] Filter thay đổi ngay lập tức
  - [ ] Grid render mượt mà
  - [ ] Không có re-render không cần thiết

---

### 🎯 Test 8: Edge Cases

- [ ] **8.1** Kiểm tra empty search
  - [ ] Search rỗng → hiển thị tất cả modules
  - [ ] Clear search → hiển thị tất cả modules

- [ ] **8.2** Kiểm tra search không tìm thấy
  - [ ] Gõ "xyz123" → hiển thị empty state
  - [ ] Empty state có message phù hợp

- [ ] **8.3** Kiểm tra filter không có modules
  - [ ] Chọn filter cho group không có modules (nếu có)
  - [ ] Hiển thị empty state

- [ ] **8.4** Kiểm tra localStorage favorites
  - [ ] Favorite một số modules
  - [ ] Refresh page → favorites vẫn được giữ
  - [ ] Clear localStorage → favorites bị reset

- [ ] **8.5** Kiểm tra user không đăng nhập
  - [ ] Truy cập `/modules` khi chưa đăng nhập
  - [ ] Redirect đến `/login`

---

## 🎯 Kết quả mong muốn

✅ **Trang All Modules hoàn chỉnh:**
- Route `/modules` hoạt động đúng
- Search theo tên, group, path
- Filter theo group với buttons
- Module cards grid responsive
- Favorite feature với localStorage
- Role-based filtering chính xác
- UX tốt với loading và empty states

✅ **Single Source of Truth:**
- MENU_ITEMS được share giữa Sidebar và Modules page
- Không có duplicate data
- Dễ maintain và update

✅ **Không ảnh hưởng Sidebar:**
- Sidebar vẫn hoạt động bình thường
- Data consistency được đảm bảo
- Không có breaking changes

---

## 📝 Notes

- **Route**: `/modules`
- **Data Source**: `lib/menuItems.ts` (shared với Sidebar)
- **Favorite Storage**: localStorage với key `module-favorites`
- **Responsive Breakpoints**:
  - Mobile: 1 col (< 768px)
  - Tablet: 2 cols (768px - 1023px)
  - Desktop: 3 cols (1024px - 1279px)
  - Large Desktop: 4 cols (≥ 1280px)

---

## 🚀 Ready for Testing

Code đã sẵn sàng. Bạn có thể:
1. Truy cập `/modules` để xem trang All Modules
2. Test search và filter functionality
3. Test favorite feature
4. Test với các roles khác nhau
5. Test responsive trên các devices

