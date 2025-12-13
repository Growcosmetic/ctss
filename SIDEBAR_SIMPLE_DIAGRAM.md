# Sơ đồ Sidebar - Phiên bản Đơn giản

## 🎯 Mục đích chính

**Vấn đề cũ**: Khi bấm vào mục cha (group), các mục ở cuối danh sách bị ẩn mất.

**Giải pháp**: 
- Container có chiều cao cố định với scroll bar
- Mỗi group expand/collapse độc lập
- Luôn có thể scroll đến mục cuối

---

## 📦 Cấu trúc Dữ liệu

### Trước đây (Cũ):
```
menuGroups = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    items: [
      { href: "/dashboard", label: "Main Dashboard" },
      { href: "/control-tower", label: "CEO Control Tower" }
    ]
  },
  ...
]
```

### Bây giờ (Mới):
```
MENU_ITEMS = [
  { key: "dashboard-main", label: "Main Dashboard", path: "/dashboard", group: "Dashboard" },
  { key: "dashboard-ceo", label: "CEO Control Tower", path: "/control-tower", group: "Dashboard" },
  { key: "booking-calendar", label: "Booking Calendar", path: "/booking", group: "Đặt lịch" },
  ...
]

↓ Group lại theo "group"

groupedItems = {
  "Dashboard": [item1, item2],
  "Đặt lịch": [item3],
  "Khách hàng": [item4, item5, item6],
  ...
}
```

**Lợi ích**: 
- ✅ Dữ liệu tập trung ở một nơi
- ✅ Dễ thêm/sửa/xóa menu items
- ✅ Tự động group theo trường `group`

---

## 🏗️ Cấu trúc Component

```
Sidebar Component
│
├─ Header (Logo + Toggle Button)
│   └─ Chiều cao: 72px (cố định)
│
└─ Menu Container (Scrollable)
    └─ Chiều cao: calc(100vh - 72px) (cố định)
        │
        └─ Danh sách Groups
            │
            ├─ Group 1: Dashboard ▼
            │   ├─ Main Dashboard
            │   └─ CEO Control Tower
            │
            ├─ Group 2: Đặt lịch (single item, không có accordion)
            │
            ├─ Group 3: Khách hàng ▼
            │   ├─ CRM Dashboard
            │   ├─ Membership
            │   └─ Personalization
            │
            ├─ ...
            │
            ├─ Group N: Hệ thống ▼
            │   ├─ Operations
            │   ├─ Training
            │   ├─ SOP
            │   ├─ Workflow
            │   ├─ Partner HQ
            │   └─ Settings
            │
            └─ Group N+1: AI
```

---

## 🔄 Luồng Hoạt động

### 1. Khởi tạo
```
User đăng nhập
    ↓
Lấy thông tin user.role
    ↓
Filter MENU_ITEMS theo roles
    ↓
Group lại theo trường "group"
    ↓
Render Sidebar
```

### 2. Khi click vào Group
```
User click "Khách hàng"
    ↓
toggleGroup("Khách hàng")
    ↓
Kiểm tra: expandedGroups có "Khách hàng" không?
    │
    ├─ Có → Xóa khỏi Set (Collapse)
    │   └─ Ẩn submenu: max-h-0, opacity-0
    │
    └─ Không → Thêm vào Set (Expand)
        └─ Hiện submenu: max-h-[500px], opacity-100
```

### 3. Scroll
```
Menu Container có height cố định
    ↓
Nếu nội dung > height → Scroll bar xuất hiện
    ↓
User scroll xuống
    ↓
Luôn có thể đến mục cuối cùng
    ↓
Kể cả khi nhiều groups đang mở
```

---

## 🎨 Visual Flow

### Trạng thái Collapsed
```
┌─────────────────────────┐
│ Dashboard ▶             │  ← Chưa mở
├─────────────────────────┤
│ Đặt lịch                │  ← Single item
├─────────────────────────┤
│ Khách hàng ▶            │  ← Chưa mở
├─────────────────────────┤
│ ...                     │
├─────────────────────────┤
│ Hệ thống ▶              │  ← Chưa mở
└─────────────────────────┘
```

### Trạng thái Expanded
```
┌─────────────────────────┐
│ Dashboard ▼             │  ← Đã mở
│   ├─ Main Dashboard     │
│   └─ CEO Control Tower  │
├─────────────────────────┤
│ Đặt lịch                │
├─────────────────────────┤
│ Khách hàng ▼            │  ← Đã mở
│   ├─ CRM Dashboard      │
│   ├─ Membership         │
│   └─ Personalization    │
├─────────────────────────┤
│ ...                     │
├─────────────────────────┤
│ Hệ thống ▶              │  ← Chưa mở
└─────────────────────────┘
     ↕ Scroll Bar (nếu cần)
```

---

## 🔑 Key Points

### 1. Container Height
```css
/* Cố định chiều cao để scroll luôn hoạt động */
height: calc(100vh - 72px)
```

**Tại sao quan trọng?**
- Nếu không có height cố định, container sẽ mở rộng theo nội dung
- Khi expand groups, container cao hơn màn hình → không scroll được
- Với height cố định → luôn có scroll bar khi cần

### 2. Accordion Independent
```typescript
expandedGroups = Set(["Dashboard", "Khách hàng"])
```

**Mỗi group độc lập:**
- Mở "Dashboard" → chỉ ảnh hưởng "Dashboard"
- Mở "Khách hàng" → chỉ ảnh hưởng "Khách hàng"
- Các group khác không thay đổi

### 3. Scroll Bar
```css
overflow-y: auto  /* Tự động hiện khi cần */
scrollbar-width: thin  /* Mỏng, đẹp */
```

**Luôn có thể scroll đến:**
- ✅ "Báo cáo" (ở giữa)
- ✅ "Marketing" (ở giữa)
- ✅ "Analytics" (ở giữa)
- ✅ "Hệ thống" (ở cuối)
- ✅ "AI" (ở cuối)

---

## 📝 Checklist Hiểu rõ

- [ ] **Data Structure**: Hiểu MENU_ITEMS là array duy nhất
- [ ] **Grouping**: Hiểu cách group lại theo trường "group"
- [ ] **Filtering**: Hiểu cách filter theo roles
- [ ] **Container**: Hiểu tại sao cần height cố định
- [ ] **Accordion**: Hiểu cách expand/collapse hoạt động
- [ ] **Scroll**: Hiểu tại sao scroll bar luôn hoạt động
- [ ] **Independent**: Hiểu mỗi group độc lập với nhau

---

## 🎯 So sánh Trước/Sau

### ❌ Trước đây:
```
Container không có height cố định
    ↓
Khi expand group → container cao hơn
    ↓
Các mục ở cuối bị đẩy ra ngoài viewport
    ↓
Không scroll được → Mất mục
```

### ✅ Bây giờ:
```
Container có height cố định
    ↓
Khi expand group → nội dung trong container
    ↓
Nếu > height → scroll bar xuất hiện
    ↓
Luôn scroll được → Không mất mục
```

---

## 💡 Tips

1. **Thêm menu item mới**: Chỉ cần thêm vào `MENU_ITEMS` array
2. **Thay đổi group**: Sửa trường `group` trong item
3. **Thay đổi icon**: Sửa trong `GROUP_ICONS` mapping
4. **Thay đổi roles**: Sửa trường `roles` trong item

---

## 🚀 Next Steps (Nếu muốn cải thiện)

1. **Thêm search**: Tìm kiếm trong menu items
2. **Thêm favorites**: Đánh dấu menu items yêu thích
3. **Thêm recent**: Hiển thị các trang đã truy cập gần đây
4. **Thêm badges**: Hiển thị số lượng thông báo trên menu items

