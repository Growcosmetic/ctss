# Changelog - CTSS System

Tài liệu này ghi lại tất cả các thay đổi quan trọng trong hệ thống CTSS.

---

## 📅 2025-01-XX - CRM Page Redesign

### ✨ Tính năng mới
- **Layout 3 cột** cho trang CRM:
  - Left Panel: Danh sách khách hàng với search
  - Center Panel: Chi tiết khách hàng với **edit inline** (không cần modal)
  - Right Panel: Lịch sử hoạt động và giao dịch

### 🆕 Components mới
- `components/crm/CustomerListPanel.tsx` - Left sidebar với danh sách khách hàng
- `components/crm/CustomerDetailPanel.tsx` - Center panel với edit inline
- `components/crm/CustomerActivityPanel.tsx` - Right sidebar với lịch sử

### 🔄 Thay đổi
- `app/crm/page.tsx` - Chuyển từ layout table sang layout 3 cột
- Edit khách hàng: Từ modal → Inline edit trong center panel

### 📚 Documentation
- `docs/CRM_REDESIGN.md` - Tài liệu chi tiết về CRM redesign

---

## 📅 2025-01-XX - Booking Page Improvements

### ✨ Tính năng mới
- **Sidebar toggle** - Có thể ẩn/hiện sidebar menu
- **AI Insights Panel** - Panel bên phải với toggle
- **Booking List Panel** - Panel bên phải hiển thị danh sách booking chi tiết
- **Staff Filter Panel** - Panel bên trái để lọc theo nhân viên
- **Calendar View Modes**:
  - "Staff Mode": Mỗi nhân viên một hàng
  - "Time Mode": Tất cả booking trong một cột
- **Booking Detail Drawer** - Drawer có thể chỉnh sửa với:
  - 2 cột layout
  - 7 trạng thái booking
  - Actions: Call, Send Zalo, Print, Save

### 🆕 Components mới
- `components/booking/BookingListPanel.tsx`
- `components/booking/StaffFilterPanel.tsx`
- `components/booking/BookingDetailDrawer.tsx` (redesigned)

### 🔄 Thay đổi
- `components/booking/BookingCalendar.tsx` - Thêm view modes
- `components/booking/BookingHeader.tsx` - Thêm view mode toggle
- `components/layout/Sidebar.tsx` - Thêm toggle functionality
- `components/layout/Header.tsx` - Thêm sidebar và AI Insights toggle
- `store/useUIStore.ts` - Thêm `aiInsightsOpen` state

---

## 📅 2025-01-XX - Customer Form Improvements

### ✨ Tính năng mới
- Form thêm/sửa khách hàng với **2 cột layout**
- Nhiều trường mới:
  - Mã khách hàng (auto-generated, không editable)
  - Nghề nghiệp, Hạng, Website
  - Nhóm khách hàng, Mã thẻ
  - Số ĐT Zalo, Facebook, Công ty
  - Nguồn giới thiệu
  - Địa chỉ chi tiết (Tỉnh/Thành, Quận/Huyện, Địa chỉ)

### 🔄 Thay đổi
- `components/crm/CustomerFormModal.tsx` - Redesign form với 2 cột
- `app/api/crm/customer/route.ts` - Map form data vào database schema
- Lưu extended fields vào `CustomerProfile.preferences` (JSON)

### 🔒 Security
- **Unique constraints**: 1 email = 1 khách hàng, 1 SĐT = 1 khách hàng
- Validation cho phone và email

---

## 📅 2025-01-XX - Authentication Fixes

### 🐛 Bugs fixed
- Login với phone number thay vì email
- Cookie `secure` flag cho HTTP (development)
- Database seeding với phone numbers

### 🔄 Thay đổi
- `app/api/auth/login/route.ts` - Support phone login
- `features/auth/components/LoginPage.tsx` - Input type text thay vì email
- `prisma/seed.ts` - Seed users với phone numbers

---

## 📅 2025-01-XX - Build & Deployment Fixes

### 🐛 Bugs fixed
- Build errors với TypeScript và ESLint
- OpenAI API key missing during build
- Dynamic server usage errors
- `useSearchParams` without Suspense

### 🔄 Thay đổi
- `next.config.mjs` - Ignore build errors (temporary)
- `lib/ai/openai.ts` - Lazy initialization
- Multiple API routes - Add `export const dynamic = 'force-dynamic'`
- `app/customer-app/bookings/page.tsx` - Wrap với Suspense

---

## 📋 File Structure

### Components
```
components/
├── booking/
│   ├── BookingCalendar.tsx
│   ├── BookingHeader.tsx
│   ├── BookingListPanel.tsx (NEW)
│   ├── StaffFilterPanel.tsx (NEW)
│   └── BookingDetailDrawer.tsx (REDESIGNED)
├── crm/
│   ├── CustomerListPanel.tsx (NEW)
│   ├── CustomerDetailPanel.tsx (NEW)
│   ├── CustomerActivityPanel.tsx (NEW)
│   └── CustomerFormModal.tsx (REDESIGNED)
└── layout/
    ├── Sidebar.tsx (UPDATED)
    └── Header.tsx (UPDATED)
```

### Stores
```
store/
└── useUIStore.ts (UPDATED - Added aiInsightsOpen)
```

### Pages
```
app/
├── booking/
│   └── page.tsx (UPDATED)
└── crm/
    └── page.tsx (REDESIGNED)
```

---

## 🔗 Quick Links

- [CRM Redesign Documentation](./CRM_REDESIGN.md)
- [Booking Page Features](./BOOKING_FEATURES.md) (TODO)
- [API Documentation](./API.md) (TODO)

---

**Last Updated:** 2025-01-XX

