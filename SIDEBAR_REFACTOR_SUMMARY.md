# Sidebar Refactor Summary

## Plan (Kế hoạch thực thi)

1. **Tạo data structure mới cho menu items**
   - Định nghĩa interface `MenuItemData` với format: `{ key, label, path, group, icon, roles, children? }`
   - Chuyển đổi từ `menuGroups` sang `MENU_ITEMS` array duy nhất
   - Tạo mapping `GROUP_ICONS` cho các icon của từng group

2. **Refactor Sidebar với container có height cố định**
   - Thay đổi sidebar từ `h-full` sang `flex flex-col` để có layout flexbox
   - Header có `flex-shrink-0` để không bị co lại
   - Menu container có `height: calc(100vh - 72px)` và `maxHeight: calc(100vh - 72px)`
   - Thêm `overflow-y-auto` với scrollbar styling

3. **Implement accordion với collapse/expand riêng**
   - Mỗi group có state expand/collapse độc lập
   - Sử dụng `ChevronDown` với rotation animation
   - Collapsible content sử dụng `max-h-[500px]` với transition
   - Mỗi group chỉ ảnh hưởng đến chính nó, không làm mất các mục khác

4. **Đảm bảo scroll bar hoạt động đúng**
   - Thêm CSS class `scrollbar-thin` với styling cho cả Firefox và Webkit browsers
   - Container có height cố định để scroll bar luôn hiển thị khi cần
   - Tất cả các mục menu có thể scroll được, kể cả khi nhiều groups được mở

5. **Cải thiện UX**
   - Giữ nguyên logic filter theo roles
   - Giữ nguyên active state và hover effects
   - Smooth transitions cho accordion expand/collapse

## Files Changed

1. **components/layout/Sidebar.tsx**
   - Refactor toàn bộ component với data structure mới
   - Thêm accordion với collapse/expand
   - Container có height cố định và scroll bar

2. **app/globals.css**
   - Thêm utility class `scrollbar-thin` cho scrollbar styling
   - Hỗ trợ cả Firefox (`scrollbar-width`, `scrollbar-color`) và Webkit (`::-webkit-scrollbar`)

## Patch (Code Changes)

### components/layout/Sidebar.tsx

**Thay đổi chính:**

1. **Data Structure mới:**
```typescript
interface MenuItemData {
  key: string;
  label: string;
  path: string;
  group: string;
  icon: any;
  roles: CTSSRole[];
  children?: MenuItemData[];
}

const MENU_ITEMS: MenuItemData[] = [...]
const GROUP_ICONS: Record<string, any> = {...}
```

2. **Sidebar Layout:**
```tsx
<aside className="... flex flex-col">
  <div className="h-header ... flex-shrink-0">...</div>
  <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin" 
       style={{ height: "calc(100vh - 72px)", maxHeight: "calc(100vh - 72px)" }}>
    ...
  </nav>
</aside>
```

3. **Accordion Implementation:**
```tsx
<div className={cn(
  "overflow-hidden transition-all duration-200 ease-in-out",
  isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
)}>
  <ul className="ml-4 mt-1 space-y-1 pb-1">
    {groupItems.map((item) => ...)}
  </ul>
</div>
```

### app/globals.css

**Thêm scrollbar styling:**
```css
.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}
```

## Manual Test Checklist

### ✅ Test cơ bản
- [ ] Sidebar hiển thị đúng với logo và toggle button
- [ ] Các menu items hiển thị đúng theo role của user
- [ ] Active state hoạt động đúng khi navigate

### ✅ Test Accordion
- [ ] Click vào group "Dashboard" → expand/collapse hoạt động
- [ ] Click vào group "Khách hàng" → expand/collapse hoạt động
- [ ] Click vào group "Hệ thống" → expand/collapse hoạt động
- [ ] Mở nhiều groups cùng lúc → tất cả đều hiển thị đúng
- [ ] Đóng một group → các groups khác vẫn giữ nguyên trạng thái

### ✅ Test Scroll Bar
- [ ] Khi có nhiều menu items → scroll bar xuất hiện
- [ ] Scroll bar có thể cuộn xuống đến mục cuối cùng
- [ ] Mở nhiều groups → vẫn có thể scroll đến "Hệ thống", "AI" ở cuối
- [ ] Scroll bar styling đẹp trên Chrome/Safari (webkit)
- [ ] Scroll bar styling đẹp trên Firefox

### ✅ Test Responsive
- [ ] Desktop: Sidebar hoạt động đúng với toggle
- [ ] Mobile: Sidebar có overlay và đóng khi click outside
- [ ] Mobile: Menu button hiển thị đúng

### ✅ Test Edge Cases
- [ ] User với role ADMIN → thấy tất cả menu items
- [ ] User với role STYLIST → chỉ thấy menu items phù hợp
- [ ] Mở tất cả groups → vẫn có thể scroll và thấy tất cả mục
- [ ] Đóng tất cả groups → chỉ thấy group headers, vẫn có thể scroll
- [ ] Navigate đến một page → active state highlight đúng

### ✅ Test Performance
- [ ] Expand/collapse animation mượt mà
- [ ] Scroll mượt mà không lag
- [ ] Không có re-render không cần thiết

## Kết quả mong đợi

✅ **Đã khắc phục:** Menu Sidebar không còn làm ẩn mất các mục ở cuối danh sách khi bấm vào mục cha

✅ **Cải thiện:**
- Container có height cố định với scroll bar vertical
- Accordion hoạt động độc lập cho từng group
- Tất cả mục menu luôn có thể truy cập được thông qua scroll
- Code structure rõ ràng hơn với data source duy nhất

✅ **Tương thích:**
- Giữ nguyên logic filter theo roles
- Giữ nguyên styling và UX hiện tại
- Responsive trên mobile và desktop

