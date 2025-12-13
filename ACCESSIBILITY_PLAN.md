# Accessibility Implementation Plan - Phase 6

## 📋 Plan (Kế hoạch thực thi)

### 1. Global Accessibility Baseline
- Thêm "Skip to content" link trong MainLayout
- Đảm bảo mọi page có `<main id="main-content">`
- Đảm bảo có H1 heading đúng

### 2. Focus Ring & Keyboard UX
- Chuẩn hóa focus ring trong globals.css
- Đảm bảo buttons/links có focus ring
- Sidebar: active item có `aria-current="page"`

### 3. Modal Accessibility
- Cập nhật Modal component:
  - Role và aria attributes
  - Focus management (focus trap)
  - Keyboard handling (ESC, Tab)
  - Focus restore khi đóng

### 4. Form & Error Semantics
- Cập nhật Input component:
  - aria-invalid
  - aria-describedby
  - Error text có id
- Loading states với aria-busy

### 5. Sidebar Accordion Accessibility
- aria-expanded cho accordion buttons
- aria-controls trỏ tới collapse area
- Hidden/inert khi collapsed

### 6. Contrast Check
- Review tokens cho contrast
- Điều chỉnh nếu cần

---

## 📁 Files Changed

### Modified Files
1. `components/layout/MainLayout.tsx` - Skip link + main tag
2. `components/ui/Modal.tsx` - Focus trap + aria attributes
3. `components/ui/Input.tsx` - aria-invalid + aria-describedby
4. `components/ui/Button.tsx` - Focus ring
5. `components/layout/Sidebar.tsx` - Accordion accessibility
6. `app/globals.css` - Focus ring styles
7. `app/dashboard/page.tsx` - Main tag + H1
8. `app/booking/page.tsx` - Main tag + H1
9. `app/pos/page.tsx` - Main tag + H1
10. `app/crm/page.tsx` - Main tag + H1
11. `app/modules/page.tsx` - Main tag + H1

---

## 🔧 Implementation Details

### Skip Link
```tsx
<a href="#main-content" className="skip-link">
  Skip to content
</a>
```

### Focus Trap Hook
```tsx
function useFocusTrap(isOpen: boolean) {
  // Trap focus trong modal
}
```

### Modal Aria
```tsx
role="dialog"
aria-modal="true"
aria-labelledby={titleId}
aria-describedby={descriptionId}
```

---

## ✅ Manual Test Checklist

### Keyboard Navigation
- [ ] Tab qua tất cả interactive elements
- [ ] Enter/Space activate buttons
- [ ] ESC đóng modals
- [ ] Focus trap trong modals
- [ ] Focus restore khi đóng modal

### Screen Reader
- [ ] Skip link đọc được
- [ ] Modal title đọc được
- [ ] Form errors đọc được
- [ ] Loading states đọc được
- [ ] Accordion states đọc được

### Visual
- [ ] Focus ring visible
- [ ] Contrast đủ
- [ ] Hidden elements không focus được

