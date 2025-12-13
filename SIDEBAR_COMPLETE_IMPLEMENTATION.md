# Sidebar Complete Implementation - CTSS

## 📋 Plan (Kế hoạch thực thi)

### Bước 1: Định nghĩa Data Structures
- ✅ Tạo `MenuItemData` interface với các trường: `key`, `label`, `path`, `group`, `icon`, `roles`, `children?`
- ✅ Tạo `MENU_ITEMS: MenuItemData[]` chứa tất cả menu items
- ✅ Tạo `GROUP_ORDER: string[]` để sắp xếp groups theo nghiệp vụ
- ✅ Tạo `GROUP_ICONS: Record<string, IconComponent>` để map icons cho từng group

### Bước 2: Xây dựng State Management
- ✅ `expandedGroups: Set<string>` với mặc định `new Set(["Dashboard"])`
- ✅ `isMobileOpen: boolean` cho mobile sidebar
- ✅ Sử dụng Zustand store `sidebarOpen` cho desktop toggle

### Bước 3: Xử lý Dữ liệu trước khi Render
- ✅ Filter `MENU_ITEMS` theo quyền người dùng (`hasAnyRole(item.roles)`)
- ✅ Group items theo trường `group`
- ✅ Sort groups theo `GROUP_ORDER` (không phải alphabet)

### Bước 4: Render Logic
- ✅ Single-item groups (`length === 1`): Render `<Link>` trực tiếp với `GroupIcon` và `groupLabel`, không có chevron
- ✅ Multi-item groups (`length > 1`): Render accordion với header button có chevron, toggle `expandedGroups`
- ✅ Collapsible content với CSS transition (`max-height`, `opacity`)

### Bước 5: Auto-Collapse sau Navigation (Optional)
- ✅ Thêm `useEffect` để theo dõi `pathname` changes
- ✅ Reset `expandedGroups` về mặc định sau khi navigate

### Bước 6: UX và Accessibility
- ✅ Active state detection chính xác
- ✅ Hover effects và transitions
- ✅ Scroll container với height cố định
- ✅ Responsive (desktop, tablet, mobile)
- ✅ Accessibility attributes (aria-expanded, aria-current, role)

---

## 📁 Files Changed

### 1. `components/layout/Sidebar.tsx`
**File chính được refactor hoàn toàn:**
- Định nghĩa data structures (MENU_ITEMS, GROUP_ORDER, GROUP_ICONS)
- State management (expandedGroups, isMobileOpen, sidebarOpen)
- Data processing (filter, group, sort)
- Render logic (single-item vs multi-item)
- Auto-collapse logic
- UX improvements

### 2. `app/globals.css`
**Đã có sẵn từ lần refactor trước:**
- Utility class `scrollbar-thin` cho scrollbar styling
- Hỗ trợ Firefox và Webkit browsers

---

## 🔧 Patch (Code Changes)

### 1. Imports và Interfaces

```typescript
// Thêm useEffect
import { useState, useEffect } from "react";

// Interface MenuItemData
interface MenuItemData {
  key: string;
  label: string;
  path: string;
  group: string;
  icon: any;
  roles: CTSSRole[];
  children?: MenuItemData[];
}
```

### 2. Data Structures

```typescript
// MENU_ITEMS - Nguồn dữ liệu duy nhất
const MENU_ITEMS: MenuItemData[] = [
  {
    key: "dashboard-main",
    label: "Main Dashboard",
    path: "/dashboard",
    group: "Dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "MANAGER", "RECEPTIONIST", "STYLIST", "ASSISTANT"],
  },
  {
    key: "dashboard-ceo",
    label: "CEO Control Tower",
    path: "/control-tower",
    group: "Dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN"],
  },
  // ... tất cả các items khác
];

// GROUP_ICONS - Mapping icons cho groups
const GROUP_ICONS: Record<string, any> = {
  Dashboard: LayoutDashboard,
  "Đặt lịch": Calendar,
  "Khách hàng": Users,
  "Dịch vụ": Scissors,
  "Kho hàng": Package,
  "Nhân viên": UserCircle,
  "Bán hàng": ShoppingCart,
  "Báo cáo": BarChart3,
  Marketing: Sparkles,
  Analytics: BarChart3,
  "Hệ thống": Settings,
  AI: Sparkles,
};

// GROUP_ORDER - Thứ tự sắp xếp groups theo nghiệp vụ
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

### 3. State Management

```typescript
export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(["Dashboard"])
  );
  const { user, hasAnyRole } = useAuth();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  // ...
}
```

### 4. Data Processing

```typescript
// Filter và group menu items
const groupedItems = MENU_ITEMS.reduce((acc, item) => {
  if (!user || !hasAnyRole(item.roles)) return acc;
  
  if (!acc[item.group]) {
    acc[item.group] = [];
  }
  acc[item.group].push(item);
  return acc;
}, {} as Record<string, MenuItemData[]>);

// Sort groups theo GROUP_ORDER
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

### 5. Auto-Collapse Logic

```typescript
// Auto-collapse groups after navigation (optional)
useEffect(() => {
  // Reset expandedGroups to default (only Dashboard) after pathname changes
  setExpandedGroups(new Set(["Dashboard"]));
}, [pathname]);
```

### 6. Render Single-Item Groups

```typescript
// Single item - render as direct link with group icon and label (no accordion, no chevron)
if (groupItems.length === 1) {
  const item = groupItems[0];
  const isActive = pathname === item.path || pathname.startsWith(item.path + "/");

  return (
    <li key={item.key}>
      <Link
        href={item.path}
        onClick={() => setIsMobileOpen(false)}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
          isActive
            ? "text-gray-800 font-semibold bg-white/20"
            : "text-gray-700 hover:text-gray-900 hover:bg-white/10"
        )}
        aria-current={isActive ? "page" : undefined}
      >
        {/* Use GroupIcon and groupLabel for single-item groups */}
        <GroupIcon size={20} className={cn("transition-colors", isActive && "text-gray-900")} />
        <span className="font-medium">{groupLabel}</span>
        {/* No chevron for single-item groups */}
      </Link>
    </li>
  );
}
```

### 7. Render Multi-Item Groups (Accordion)

```typescript
// Multiple items - render as accordion group
const hasActiveItem = groupItems.some(
  (item) => pathname === item.path || pathname.startsWith(item.path + "/")
);

return (
  <li key={groupLabel} className="mb-1">
    <button
      onClick={() => toggleGroup(groupLabel)}
      className={cn(
        "w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200",
        "text-gray-700 hover:text-gray-900 hover:bg-white/10",
        hasActiveItem && "bg-white/5"
      )}
      aria-expanded={isExpanded}
      aria-controls={`menu-group-${groupLabel}`}
    >
      <div className="flex items-center gap-3">
        <GroupIcon size={20} className={cn(hasActiveItem && "text-gray-900")} />
        <span className="font-medium">{groupLabel}</span>
      </div>
      <ChevronDown
        size={16}
        className={cn(
          "transition-transform duration-200 flex-shrink-0",
          isExpanded ? "rotate-180" : "rotate-0"
        )}
      />
    </button>
    
    {/* Collapsible content */}
    <div
      id={`menu-group-${groupLabel}`}
      className={cn(
        "overflow-hidden transition-all duration-200 ease-in-out",
        isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
      )}
    >
      <ul className="ml-4 mt-1 space-y-1 pb-1">
        {groupItems.map((item) => {
          const ItemIcon = item.icon;
          const isActive = pathname === item.path || pathname.startsWith(item.path + "/");

          return (
            <li key={item.key}>
              <Link
                href={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm",
                  isActive
                    ? "text-gray-800 font-semibold bg-white/20"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/10"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <ItemIcon 
                  size={16} 
                  className={cn("transition-colors", isActive && "text-gray-900")} 
                />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  </li>
);
```

### 8. Container với Scroll

```typescript
<nav 
  className="overflow-y-auto py-4 scrollbar-thin flex-shrink"
  style={{ 
    height: "calc(100vh - 72px)",
    minHeight: 0
  }}
>
  {/* Menu items */}
</nav>
```

---

## ✅ Manual Test Checklist

### 🎯 Test 1: Single-Item Groups

#### 1.1 Kiểm tra Single-Item Groups không có Chevron
- [ ] Mở sidebar và kiểm tra các groups chỉ có 1 item:
  - [ ] "Đặt lịch" → **KHÔNG có chevron** (nếu chỉ có Booking Calendar)
  - [ ] "Kho hàng" → **KHÔNG có chevron** (nếu chỉ có Inventory)
  - [ ] "Marketing" → **KHÔNG có chevron** (nếu chỉ có Marketing Dashboard)
  - [ ] "AI" → **KHÔNG có chevron** (nếu chỉ có Mina AI)
- [ ] Kiểm tra các groups có nhiều items:
  - [ ] "Dashboard" (2 items) → **CÓ chevron**
  - [ ] "Khách hàng" (3 items) → **CÓ chevron**
  - [ ] "Hệ thống" (6 items) → **CÓ chevron**

#### 1.2 Kiểm tra Single-Item Groups hiển thị đúng
- [ ] "Đặt lịch" hiển thị:
  - [ ] Icon: Calendar (GroupIcon)
  - [ ] Label: "Đặt lịch" (groupLabel)
  - [ ] KHÔNG hiển thị "Booking Calendar" (item.label)
- [ ] "Kho hàng" hiển thị:
  - [ ] Icon: Package (GroupIcon)
  - [ ] Label: "Kho hàng" (groupLabel)
  - [ ] KHÔNG hiển thị "Inventory" (item.label)

#### 1.3 Kiểm tra Single-Item Groups Navigate
- [ ] Click "Đặt lịch" → navigate đến "/booking"
- [ ] Click "Kho hàng" → navigate đến "/inventory"
- [ ] Click "Marketing" → navigate đến "/marketing/dashboard"
- [ ] Click "AI" → navigate đến "/mina"
- [ ] Active state highlight đúng khi ở các trang này

#### 1.4 Kiểm tra Single-Item Groups không có Accordion Behavior
- [ ] Click "Đặt lịch" → **KHÔNG expand/collapse**, navigate ngay
- [ ] Click "Kho hàng" → **KHÔNG expand/collapse**, navigate ngay
- [ ] Hover → chỉ có hover effect, không expand

---

### 🔄 Test 2: Multi-Item Groups (Accordion)

#### 2.1 Kiểm tra Accordion Expand/Collapse
- [ ] Click "Dashboard" → expand, thấy 2 items
- [ ] Click lại "Dashboard" → collapse, ẩn items
- [ ] Click "Khách hàng" → expand, thấy 3 items
- [ ] Click "Hệ thống" → expand, thấy 6 items
- [ ] Mở nhiều groups cùng lúc → tất cả đều hiển thị đúng

#### 2.2 Kiểm tra Accordion Độc lập
- [ ] Mở "Dashboard" và "Khách hàng"
- [ ] Đóng "Dashboard" → "Khách hàng" vẫn mở
- [ ] Đóng "Khách hàng" → "Dashboard" vẫn đóng
- [ ] Mở tất cả groups → tất cả đều hiển thị

#### 2.3 Kiểm tra Accordion với Active Item
- [ ] Navigate đến "/crm"
- [ ] "Khách hàng" group header có background nhẹ (hasActiveItem)
- [ ] "CRM Dashboard" item được highlight
- [ ] Click "Khách hàng" header → expand/collapse hoạt động

---

### 📜 Test 3: Scroll Bar

#### 3.1 Kiểm tra Scroll khi có nhiều Items
- [ ] Mở tất cả groups → scroll bar xuất hiện
- [ ] Scroll xuống → có thể đến mục cuối cùng ("AI")
- [ ] Scroll lên → có thể quay lại mục đầu tiên ("Dashboard")
- [ ] Scroll bar styling đẹp, mỏng (thin)

#### 3.2 Kiểm tra Scroll khi Expand Groups
- [ ] Ban đầu chỉ thấy một số groups ở trên
- [ ] Mở "Hệ thống" (ở cuối) → có thể scroll xuống để thấy
- [ ] Mở nhiều groups → vẫn có thể scroll đến tất cả mục
- [ ] Đóng một số groups → scroll bar vẫn hoạt động đúng

#### 3.3 Kiểm tra Scroll Bar trên các Browsers
- [ ] Chrome/Safari (Webkit) → scrollbar mỏng, đẹp
- [ ] Firefox → scrollbar mỏng, đẹp
- [ ] Edge → scrollbar mỏng, đẹp

---

### 🔐 Test 4: Role-based Filtering

#### 4.1 Test với ADMIN role
- [ ] Đăng nhập với ADMIN
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

#### 4.2 Test với MANAGER role
- [ ] Đăng nhập với MANAGER
- [ ] Kiểm tra KHÔNG thấy:
  - [ ] CEO Control Tower (chỉ ADMIN)
  - [ ] Partner HQ (chỉ ADMIN)
  - [ ] Settings (chỉ ADMIN)
- [ ] Kiểm tra thấy các mục khác như ADMIN

#### 4.3 Test với STYLIST role
- [ ] Đăng nhập với STYLIST
- [ ] Kiểm tra chỉ thấy:
  - [ ] Dashboard (Main Dashboard)
  - [ ] Đặt lịch
  - [ ] Khách hàng (CRM Dashboard)
  - [ ] Dịch vụ (Services)
  - [ ] Nhân viên (Staff)
  - [ ] Analytics (Hair Health)
  - [ ] AI (Mina AI)
- [ ] Kiểm tra KHÔNG thấy các mục quản lý

#### 4.4 Test với RECEPTIONIST role
- [ ] Đăng nhập với RECEPTIONIST
- [ ] Kiểm tra thấy các mục phù hợp với role
- [ ] Kiểm tra KHÔNG thấy các mục không phù hợp

---

### 🔄 Test 5: Auto-Collapse sau Navigation

#### 5.1 Kiểm tra Auto-Collapse khi Navigate từ Single-Item
- [ ] Mở sidebar, mở một số groups ("Dashboard", "Khách hàng")
- [ ] Click "Đặt lịch" (single-item) → navigate đến "/booking"
- [ ] Kiểm tra sidebar → **Tất cả groups đã collapse**, chỉ còn "Dashboard" mở
- [ ] Click "Kho hàng" (single-item) → navigate đến "/inventory"
- [ ] Kiểm tra sidebar → **Tất cả groups đã collapse**, chỉ còn "Dashboard" mở

#### 5.2 Kiểm tra Auto-Collapse khi Navigate từ Multi-Item Group
- [ ] Mở sidebar, mở "Khách hàng" group
- [ ] Click "CRM Dashboard" → navigate đến "/crm"
- [ ] Kiểm tra sidebar → **Tất cả groups đã collapse**, chỉ còn "Dashboard" mở
- [ ] Mở sidebar, mở "Hệ thống" group
- [ ] Click "Settings" → navigate đến "/settings"
- [ ] Kiểm tra sidebar → **Tất cả groups đã collapse**, chỉ còn "Dashboard" mở

#### 5.3 Kiểm tra Auto-Collapse không ảnh hưởng Active State
- [ ] Navigate đến "/booking"
- [ ] Kiểm tra "Đặt lịch" vẫn được highlight (active state)
- [ ] Navigate đến "/crm"
- [ ] Kiểm tra "CRM Dashboard" vẫn được highlight
- [ ] Kiểm tra "Khách hàng" group header có background nhẹ

#### 5.4 Kiểm tra Auto-Collapse với Browser Navigation
- [ ] Mở sidebar, mở một số groups
- [ ] Sử dụng browser back button → navigate về trang trước
- [ ] Kiểm tra sidebar → **Tất cả groups đã collapse**
- [ ] Sử dụng browser forward button → navigate đến trang tiếp theo
- [ ] Kiểm tra sidebar → **Tất cả groups đã collapse**

---

### 📱 Test 6: Responsive

#### 6.1 Test Desktop (≥1024px)
- [ ] Sidebar hiển thị cố định bên trái
- [ ] Click toggle button → sidebar thu gọn/mở rộng
- [ ] Khi sidebar thu gọn → main content mở rộng
- [ ] Khi sidebar mở → main content thu lại
- [ ] Animation mượt mà khi toggle

#### 6.2 Test Mobile (<1024px)
- [ ] Sidebar ẩn mặc định
- [ ] Click menu button (☰) → sidebar slide từ trái
- [ ] Overlay xuất hiện khi sidebar mở
- [ ] Click overlay → sidebar đóng
- [ ] Click menu item → sidebar tự động đóng
- [ ] Animation slide mượt mà

#### 6.3 Test Tablet (768px - 1023px)
- [ ] Sidebar hoạt động như mobile
- [ ] Layout responsive đúng

---

### 🎨 Test 7: Active State và UX

#### 7.1 Kiểm tra Active State Detection
- [ ] Navigate đến "/dashboard" → "Main Dashboard" được highlight
- [ ] Navigate đến "/crm" → "CRM Dashboard" được highlight
- [ ] Navigate đến "/reports/financial" → "Financial" được highlight
- [ ] Navigate đến "/settings" → "Settings" được highlight

#### 7.2 Kiểm tra Active State với Groups
- [ ] Navigate đến "/dashboard" → "Dashboard" group header có background nhẹ
- [ ] Navigate đến "/crm" → "Khách hàng" group header có background nhẹ
- [ ] Navigate đến "/operations" → "Hệ thống" group header có background nhẹ

#### 7.3 Kiểm tra Hover Effects
- [ ] Hover trên single-item → có hover effect
- [ ] Hover trên multi-item header → có hover effect
- [ ] Hover trên item trong accordion → có hover effect
- [ ] Transitions mượt mà (200ms)

---

### 🔍 Test 8: Edge Cases

#### 8.1 Kiểm tra Groups với Dynamic Items
- [ ] Nếu một group ban đầu có 2 items, sau đó chỉ còn 1 item (do role filtering)
- [ ] Kiểm tra group đó render như single-item (không có chevron)
- [ ] Nếu một group ban đầu có 1 item, sau đó có thêm items
- [ ] Kiểm tra group đó render như multi-item (có chevron)

#### 8.2 Kiểm tra Empty Groups
- [ ] User không có quyền xem bất kỳ item nào trong group
- [ ] Group đó không được render

#### 8.3 Kiểm tra Performance
- [ ] Auto-collapse không gây lag hoặc flicker
- [ ] Navigation mượt mà, không có delay
- [ ] Sidebar re-render không ảnh hưởng performance
- [ ] Expand/collapse animations mượt mà

---

### ♿ Test 9: Accessibility

#### 9.1 Kiểm tra Keyboard Navigation
- [ ] Tab qua các menu items → focus rõ ràng
- [ ] Enter trên group header → expand/collapse
- [ ] Enter trên menu item → navigate
- [ ] Escape → đóng sidebar (mobile)

#### 9.2 Kiểm tra Screen Readers
- [ ] Sidebar có `role="navigation"` và `aria-label`
- [ ] Accordion buttons có `aria-expanded` và `aria-controls`
- [ ] Active links có `aria-current="page"`
- [ ] Tất cả buttons có accessible labels

---

## 🎯 Kết quả mong muốn

✅ **Single-item groups**: 
- Render như link trực tiếp, không có chevron
- Dùng GroupIcon và groupLabel
- Không có accordion behavior

✅ **Multi-item groups**: 
- Render accordion với chevron
- Expand/collapse độc lập
- Active state detection chính xác

✅ **GROUP_ORDER**: 
- Groups được sắp xếp theo thứ tự nghiệp vụ
- Không phải alphabet

✅ **Role-based filtering**: 
- Chỉ hiển thị items user có quyền
- Filtering chính xác theo roles

✅ **Auto-collapse**: 
- Sidebar tự động collapse sau navigation
- Chỉ giữ "Dashboard" mở (mặc định)

✅ **Scroll**: 
- Container có height cố định
- Scroll bar luôn hoạt động khi cần

✅ **Responsive**: 
- Desktop, tablet, mobile đều hoạt động tốt

✅ **Accessibility**: 
- Keyboard navigation
- Screen reader support

---

## 📝 Notes

- **Auto-collapse là optional**: Có thể disable bằng cách comment out useEffect
- **Default expanded group**: "Dashboard", có thể thay đổi trong useState
- **Backward compatible**: Không phá vỡ bất kỳ functionality nào hiện có
- **Performance**: useEffect chỉ chạy khi pathname thay đổi
- **Maintainability**: Chỉ cần chỉnh MENU_ITEMS để thêm/sửa/xóa menu items

