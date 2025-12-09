# ⚡ QUICK REFERENCE - Nguyên Tắc Phát Triển CTSS

**File này dùng để tham chiếu nhanh trong các session chat mới**

---

## 🎯 **3 NGUYÊN TẮC CHÍNH**

### **1. GIỮ NGUYÊN TÍNH NĂNG CŨ** ✅
- ❌ **KHÔNG BAO GIỜ** xóa hoặc làm hỏng tính năng đã hoạt động
- ✅ **LUÔN** test lại các tính năng liên quan sau khi thêm mới
- ✅ **BACKUP** code trước khi thay đổi lớn
- ✅ Tạo file mới thay vì sửa file cũ (nếu có thể)

### **2. BÁO CÁO MỌI THAY ĐỔI** 📋
- ✅ **BẮT BUỘC** báo cáo mọi thay đổi trong code
- ✅ Liệt kê các file đã thay đổi
- ✅ Liệt kê các tính năng bị ảnh hưởng
- ✅ Giải thích lý do thay đổi

### **3. GIẢI THÍCH CÁCH TỐT HƠN** ✨
- ✅ Giải thích cách tính năng mới tốt hơn
- ✅ So sánh performance (nếu có)
- ✅ Liệt kê lợi ích cụ thể

---

## 📝 **CHECKLIST NHANH**

Trước khi làm tính năng mới:
- [ ] Backup code cũ (commit)
- [ ] Xác định tính năng liên quan
- [ ] Tạo file mới (không sửa file cũ nếu có thể)
- [ ] Test tính năng mới
- [ ] Test lại tính năng cũ (regression)
- [ ] Báo cáo thay đổi
- [ ] Giải thích cách tốt hơn

---

## 🔄 **TEMPLATE BÁO CÁO NHANH**

Khi thêm tính năng mới, báo cáo theo format:

```markdown
## 🔄 THAY ĐỔI: [Tên tính năng]

### Tính năng mới:
- [Mô tả]

### Files đã thay đổi:
- [Liệt kê]

### Tính năng cũ bị ảnh hưởng:
- [Không có / Liệt kê]

### Tốt hơn như thế nào:
1. [Lợi ích 1]
2. [Lợi ích 2]
3. [Lợi ích 3]
```

---

## 🛡️ **QUY TẮC BẢO VỆ CODE**

### ✅ **ĐÚNG:**
- Tạo function mới thay vì sửa function cũ
- Giữ nguyên logic cũ, thêm logic mới
- Versioning cho breaking changes
- Feature flags cho tính năng mới

### ❌ **SAI:**
- Xóa code cũ mà không backup
- Sửa logic cũ mà không test
- Thay đổi API mà không versioning
- Xóa database models mà không migration

---

## 📊 **TÍNH NĂNG CẦN TEST SAU MỖI THAY ĐỔI**

### **CRM Module:**
- Xem/sửa/xóa khách hàng
- Quản lý nhóm khách hàng
- Upload/xem/xóa ảnh khách hàng
- Import Excel

### **Booking Module:**
- Xem/tạo/sửa/xóa booking
- Drag & drop booking

### **POS Module:**
- Tạo đơn hàng
- Thanh toán

### **Inventory Module:**
- Quản lý sản phẩm
- Kiểm tra tồn kho

### **Dashboard:**
- Xem KPIs
- Xem charts

---

## 💬 **CÁCH SỬ DỤNG TRONG CHAT MỚI**

Khi mở cửa sổ chat mới, chỉ cần nói:

> **"Đọc file docs/QUICK_REFERENCE.md và docs/DEVELOPMENT_GUIDELINES.md để hiểu nguyên tắc phát triển dự án CTSS"**

Hoặc đơn giản hơn:

> **"Nhớ giữ nguyên tính năng cũ, báo cáo mọi thay đổi, và giải thích cách tốt hơn"**

---

## 📚 **TÀI LIỆU ĐẦY ĐỦ**

- `docs/DEVELOPMENT_GUIDELINES.md` - Quy trình phát triển chi tiết
- `docs/CHANGELOG_TEMPLATE.md` - Template báo cáo thay đổi
- `docs/PROJECT_COMPLETE_OVERVIEW.md` - Tổng quan toàn bộ dự án
- `docs/CRM_FEATURES_LIST.md` - Danh sách tính năng CRM

---

## 🎯 **TÓM TẮT 1 CÂU**

**"Giữ nguyên tính năng cũ, báo cáo mọi thay đổi, giải thích cách tốt hơn"**

---

*File này được tạo để tham chiếu nhanh trong các session chat mới*

