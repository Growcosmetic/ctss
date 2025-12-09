# 🤖 HƯỚNG DẪN CHO AI ASSISTANT

**File này dành cho AI Assistant khi làm việc với dự án CTSS**

---

## 🎯 **NGUYÊN TẮC PHÁT TRIỂN**

Khi làm việc với dự án CTSS, **BẮT BUỘC** tuân thủ 3 nguyên tắc sau:

### **1. GIỮ NGUYÊN TÍNH NĂNG CŨ** ✅
- ❌ **KHÔNG BAO GIỜ** xóa hoặc làm hỏng tính năng đã hoạt động
- ✅ **LUÔN** test lại các tính năng liên quan sau khi thêm mới
- ✅ **BACKUP** code trước khi thay đổi lớn (commit)
- ✅ Tạo file mới thay vì sửa file cũ (nếu có thể)
- ✅ Giữ nguyên logic cũ, thêm logic mới

### **2. BÁO CÁO MỌI THAY ĐỔI** 📋
- ✅ **BẮT BUỘC** báo cáo mọi thay đổi trong code
- ✅ Liệt kê các file đã thay đổi
- ✅ Liệt kê các tính năng bị ảnh hưởng (nếu có)
- ✅ Giải thích lý do thay đổi
- ✅ Sử dụng template trong `docs/CHANGELOG_TEMPLATE.md`

### **3. GIẢI THÍCH CÁCH TỐT HƠN** ✨
- ✅ Giải thích cách tính năng mới tốt hơn tính năng cũ
- ✅ So sánh performance (nếu có)
- ✅ Liệt kê lợi ích cụ thể
- ✅ So sánh trước/sau

---

## 📋 **CHECKLIST TRƯỚC KHI THÊM TÍNH NĂNG MỚI**

1. [ ] Đọc `docs/DEVELOPMENT_GUIDELINES.md` để hiểu quy trình
2. [ ] Backup code cũ (commit hiện tại)
3. [ ] Xác định tính năng liên quan có thể bị ảnh hưởng
4. [ ] Tạo file mới thay vì sửa file cũ (nếu có thể)
5. [ ] Test tính năng mới
6. [ ] Test lại tính năng cũ (regression test)
7. [ ] Báo cáo thay đổi theo template
8. [ ] Giải thích cách tốt hơn

---

## 🔄 **TEMPLATE BÁO CÁO THAY ĐỔI**

Khi thêm tính năng mới, **BẮT BUỘC** báo cáo theo format:

```markdown
## 🔄 THAY ĐỔI: [Tên tính năng]

### Tính năng mới:
- [Mô tả ngắn gọn]

### Files đã thay đổi:
- `path/to/file1.tsx` - [Mô tả]
- `path/to/file2.ts` - [Mô tả]

### Tính năng cũ bị ảnh hưởng:
- [ ] Không có
- [ ] [Tên tính năng] - [Mô tả ảnh hưởng]

### Tốt hơn như thế nào:
1. [Lợi ích 1]
2. [Lợi ích 2]
3. [Lợi ích 3]

### Cách test:
1. [Bước test 1]
2. [Bước test 2]
```

---

## 🛡️ **QUY TẮC BẢO VỆ CODE**

### ✅ **ĐÚNG:**
```typescript
// Tạo function mới thay vì sửa function cũ
function oldFunction() {
  // Logic cũ giữ nguyên
}

function newFunction() {
  // Logic mới
}
```

### ❌ **SAI:**
```typescript
// Sửa function cũ (KHÔNG ĐƯỢC LÀM)
function oldFunction() {
  // Logic cũ bị thay đổi - SAI!
}
```

---

## 📊 **TÍNH NĂNG CẦN TEST SAU MỖI THAY ĐỔI**

### **CRM Module:**
- Xem/sửa/xóa khách hàng
- Quản lý nhóm khách hàng
- Upload/xem/xóa ảnh khách hàng
- Import Excel
- Thống kê khách hàng

### **Booking Module:**
- Xem/tạo/sửa/xóa booking
- Drag & drop booking
- Filter theo staff

### **POS Module:**
- Tạo đơn hàng
- Thanh toán
- In hóa đơn

### **Inventory Module:**
- Quản lý sản phẩm
- Kiểm tra tồn kho
- Restock

### **Dashboard:**
- Xem KPIs
- Xem charts
- Xem alerts

---

## 📚 **TÀI LIỆU THAM KHẢO**

- `docs/DEVELOPMENT_GUIDELINES.md` - Quy trình phát triển chi tiết
- `docs/CHANGELOG_TEMPLATE.md` - Template báo cáo thay đổi
- `docs/QUICK_REFERENCE.md` - Tham chiếu nhanh
- `docs/PROJECT_COMPLETE_OVERVIEW.md` - Tổng quan toàn bộ dự án
- `docs/CRM_FEATURES_LIST.md` - Danh sách tính năng CRM

---

## 🎯 **TÓM TẮT**

**"Giữ nguyên tính năng cũ, báo cáo mọi thay đổi, giải thích cách tốt hơn"**

---

## 💬 **KHI NGƯỜI DÙNG YÊU CẦU TÍNH NĂNG MỚI**

1. **Đọc** `docs/DEVELOPMENT_GUIDELINES.md` và `docs/QUICK_REFERENCE.md`
2. **Xác định** tính năng liên quan
3. **Backup** code hiện tại
4. **Tạo** tính năng mới (không sửa cũ)
5. **Test** tính năng mới + regression test
6. **Báo cáo** thay đổi theo template
7. **Giải thích** cách tốt hơn

---

*File này được tạo để AI Assistant hiểu và tuân thủ nguyên tắc phát triển dự án CTSS*

