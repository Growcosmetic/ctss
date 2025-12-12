# 📋 TÍNH NĂNG CHƯA THỰC HIỆN HOẶC CHƯA HOÀN CHỈNH

## ⚠️ BOOKING SYSTEM - Tính năng chưa hoàn chỉnh

### 1. ❌ Copy/Duplicate Booking
- **Status:** Có code trong `BookingDetailDrawer.tsx` nhưng chỉ update local state, chưa tích hợp API
- **Cần:** Tích hợp API để tạo booking mới từ booking cũ

### 2. ⚠️ Walk-in Booking
- **Status:** Có UI và handler nhưng chưa hoàn chỉnh
- **Cần:** Hoàn thiện flow walk-in booking với API

### 3. ❌ Quick Edit Booking
- **Status:** Chưa có
- **Cần:** Click vào booking để edit nhanh (thời gian, stylist, service)

### 4. ⚠️ Thông báo booking sắp đến
- **Status:** Có reminder system nhưng chưa có badge trên UI
- **Cần:** Badge "Sắp đến" trên booking card (trong 30 phút)

### 5. ⚠️ Edit Booking API
- **Status:** UI có nhưng API chưa đầy đủ
- **Cần:** Hoàn thiện PUT `/api/bookings/[id]`

### 6. ⚠️ Nhắn tin Zalo/SMS
- **Status:** Có button, có fallback mở Zalo app nhưng chưa tích hợp API đầy đủ
- **Cần:** Tích hợp API gửi tin nhắn Zalo/SMS

---

## 📦 INVENTORY - Tính năng chưa hoàn chỉnh

### 1. ❌ Các lô hàng (Batches/Lots)
- **Status:** Có mention trong `StockActionMenu.tsx` nhưng chưa implement
- **Cần:** Quản lý lô hàng, hạn sử dụng theo lô

### 2. ❌ Cân bằng tất cả kho về 0
- **Status:** Có mention nhưng chưa implement
- **Cần:** Button để reset tất cả tồn kho về 0

### 3. ❌ Báo Cáo Kho
- **Status:** Có button nhưng chưa implement
- **Cần:** Tạo báo cáo tồn kho chi tiết

### 4. ⚠️ Nhập từ Excel cho Phiếu nhập/xuất
- **Status:** Có button "Nhập từ Excel" nhưng chưa implement
- **Cần:** Import phiếu nhập/xuất từ Excel

### 5. ❌ Tạo phiếu chi cho số quỹ
- **Status:** Có checkbox trong UI (SalonHero reference) nhưng chưa implement
- **Cần:** Tự động tạo phiếu chi khi hoàn thành phiếu nhập

---

## 👨‍💼 STAFF MANAGEMENT - Tính năng chưa hoàn chỉnh

### 1. ❌ Schedule Management
- **Status:** Có model `StaffShift` nhưng chưa có UI
- **Cần:** Quản lý ca làm việc cho nhân viên

### 2. ❌ Performance Tracking
- **Status:** Có models nhưng chưa có UI đầy đủ
- **Cần:** Dashboard hiệu suất nhân viên

### 3. ❌ Skill Assessment UI
- **Status:** Có API nhưng chưa có UI trong staff management
- **Cần:** Đánh giá kỹ năng nhân viên

---

## 📊 REPORTS - Tính năng chưa hoàn chỉnh

### 1. ⚠️ Export PDF
- **Status:** Có mention nhưng chưa implement
- **Cần:** Export báo cáo ra PDF

### 2. ❌ Custom Reports
- **Status:** Chưa có
- **Cần:** Tạo báo cáo tùy chỉnh

---

## 🛒 POS - Tính năng chưa hoàn chỉnh

### 1. ⚠️ Receipt Printing
- **Status:** Có mention nhưng chưa implement đầy đủ
- **Cần:** In hóa đơn thực tế

### 2. ⚠️ Payment Processing
- **Status:** Có structure nhưng chưa tích hợp payment gateway
- **Cần:** Tích hợp cổng thanh toán

---

## 🤖 AI FEATURES - Tính năng chưa hoàn chỉnh

### 1. ⚠️ Một số AI engines chưa được test đầy đủ
- **Status:** Có code nhưng cần test với real data
- **Cần:** Test và optimize

---

## 📱 CUSTOMER APP - Tính năng chưa hoàn chỉnh

### 1. ⚠️ OTP Login
- **Status:** Có structure nhưng chưa test đầy đủ
- **Cần:** Test OTP flow

---

## 🎯 ƯU TIÊN THỰC HIỆN

### Priority 1 (Quan trọng - Cần ngay)
1. ✅ **Quản lý nhân viên** - ĐÃ HOÀN THÀNH
2. ✅ **Phiếu nhập/xuất kho** - ĐÃ HOÀN THÀNH
3. ✅ **Di chuyển kho** - ĐÃ HOÀN THÀNH
4. 🔄 **Copy/Duplicate Booking** - Đang làm
5. 🔄 **Quick Edit Booking** - Đang làm
6. 🔄 **Walk-in Booking hoàn chỉnh** - Đang làm

### Priority 2 (Quan trọng - Cần sớm)
7. **Thông báo booking sắp đến** (badge)
8. **Nhập từ Excel cho phiếu nhập/xuất**
9. **Schedule Management cho nhân viên**
10. **Export PDF cho báo cáo**

### Priority 3 (Có thể làm sau)
11. **Các lô hàng (Batches)**
12. **Báo cáo kho chi tiết**
13. **Tạo phiếu chi tự động**
14. **Custom Reports**

---

**Tổng số tính năng chưa hoàn chỉnh:** ~15 tính năng
**Tổng số tính năng đã hoàn thành:** ~85+ tính năng
