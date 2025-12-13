# UI Consistency Implementation Plan - Phase 5

## 📋 Plan (Kế hoạch thực thi)

### 1. Thiết lập Design Tokens
- Tạo `lib/ui/tokens.ts` với colors, spacing, typography, shadows, radius
- Cập nhật `tailwind.config.ts` để sử dụng tokens
- Cập nhật `app/globals.css` với CSS variables (nếu cần)

### 2. Chuẩn hóa nền tảng layout components
- Tạo `components/ui/PageHeader.tsx`
- Tạo `components/ui/Section.tsx`
- Tạo `components/ui/StatCard.tsx`
- Tạo `components/ui/EmptyState.tsx`

### 3. Chuẩn hóa Buttons/Inputs/Modals
- Refactor `components/ui/Button.tsx` với variants chuẩn
- Refactor `components/ui/Input.tsx` với variants chuẩn
- Tạo `components/ui/Select.tsx` (nếu chưa có)
- Tạo `components/ui/Modal.tsx` base component

### 4. Áp dụng vào Dashboard
- Refactor KPI cards dùng StatCard
- Refactor QuickActionsBar dùng Button variants
- Thêm EmptyState và ErrorState

### 5. Áp dụng vào Booking
- Refactor CreateBookingModal dùng Modal base
- Refactor buttons dùng Button variants
- Dùng tokens cho colors

### 6. Áp dụng vào POS
- Refactor CancelOrderModal, DiscountModal, NoteModal dùng Modal base
- Dùng Button variants chuẩn
- Dùng tokens cho colors

### 7. Áp dụng vào CRM
- Refactor AdvancedFilterModal dùng Modal base
- Dùng Button variants và tokens
- Dùng badges với tokens

### 8. Typography & Spacing
- Định nghĩa font sizes trong tokens
- Định nghĩa spacing scale
- Chuẩn hóa icon sizes

### 9. Testing & Validation
- Kiểm tra tất cả pages không bị vỡ layout
- Kiểm tra responsive
- Kiểm tra functionality không bị ảnh hưởng

---

## 📁 Files Changed

### New Files
1. `lib/ui/tokens.ts` - Design tokens
2. `components/ui/PageHeader.tsx` - Page header component
3. `components/ui/Section.tsx` - Section component
4. `components/ui/StatCard.tsx` - Stat card component
5. `components/ui/EmptyState.tsx` - Empty state component
6. `components/ui/Modal.tsx` - Base modal component
7. `components/ui/Select.tsx` - Select component (nếu chưa có)

### Modified Files
1. `tailwind.config.ts` - Add tokens
2. `app/globals.css` - Add CSS variables
3. `components/ui/Button.tsx` - Refactor với variants
4. `components/ui/Input.tsx` - Refactor với variants
5. `app/dashboard/page.tsx` - Dùng components chuẩn
6. `components/booking/CreateBookingModal.tsx` - Dùng Modal base
7. `components/pos/CancelOrderModal.tsx` - Dùng Modal base
8. `components/pos/DiscountModal.tsx` - Dùng Modal base
9. `components/pos/NoteModal.tsx` - Dùng Modal base
10. `components/crm/AdvancedFilterModal.tsx` - Dùng Modal base

---

## 🔧 Implementation Details

### Design Tokens Structure
```typescript
export const tokens = {
  colors: {
    primary: { ... },
    secondary: { ... },
    success: { ... },
    warning: { ... },
    danger: { ... },
    // ...
  },
  spacing: { ... },
  typography: { ... },
  shadows: { ... },
  radius: { ... },
}
```

### Component Variants
- Button: primary, secondary, ghost, danger, success, outline
- Input: default, error, disabled
- Modal: standard, large, small

---

## ✅ Manual Test Checklist

### Design Tokens
- [ ] Colors hiển thị đúng trên tất cả components
- [ ] Spacing consistent
- [ ] Typography consistent
- [ ] Shadows và radius đúng

### Components
- [ ] PageHeader hoạt động đúng
- [ ] Section hoạt động đúng
- [ ] StatCard hoạt động đúng với loading/error
- [ ] EmptyState hoạt động đúng
- [ ] Modal base hoạt động đúng
- [ ] Button variants đúng
- [ ] Input variants đúng

### Pages
- [ ] Dashboard: KPI cards, QuickActionsBar dùng components chuẩn
- [ ] Booking: Modal và buttons dùng components chuẩn
- [ ] POS: 3 modals dùng Modal base và Button variants
- [ ] CRM: AdvancedFilterModal dùng Modal base

### Functionality
- [ ] Buffer time validation vẫn hoạt động
- [ ] POS actions vẫn hoạt động
- [ ] CRM filters vẫn hoạt động
- [ ] Không có regressions

### Responsive
- [ ] Mobile: Layout không vỡ
- [ ] Tablet: Layout không vỡ
- [ ] Desktop: Layout không vỡ

