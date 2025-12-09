# 📋 QUY TRÌNH PHÁT TRIỂN TÍNH NĂNG MỚI

## 🎯 **NGUYÊN TẮC CƠ BẢN**

### **1. GIỮ NGUYÊN TÍNH NĂNG CŨ**
- ✅ **KHÔNG BAO GIỜ** xóa hoặc làm hỏng tính năng đã hoạt động
- ✅ **LUÔN** test lại các tính năng liên quan sau khi thêm mới
- ✅ **BACKUP** code trước khi thay đổi lớn
- ✅ **COMMIT** thường xuyên với message rõ ràng

### **2. BÁO CÁO THAY ĐỔI**
- ✅ **BẮT BUỘC** báo cáo mọi thay đổi trong code
- ✅ Liệt kê các tính năng bị ảnh hưởng
- ✅ Giải thích lý do thay đổi
- ✅ So sánh trước/sau

### **3. CẢI THIỆN TỐT HƠN**
- ✅ Giải thích cách tính năng mới tốt hơn
- ✅ So sánh performance (nếu có)
- ✅ Liệt kê lợi ích cụ thể

---

## 📝 **CHECKLIST TRƯỚC KHI THÊM TÍNH NĂNG MỚI**

### **Bước 1: Phân Tích**
- [ ] Xác định tính năng cần thêm
- [ ] Kiểm tra xem đã có tính năng tương tự chưa
- [ ] Xác định các tính năng liên quan có thể bị ảnh hưởng
- [ ] Liệt kê các file/components sẽ thay đổi

### **Bước 2: Backup & Planning**
- [ ] Commit code hiện tại (backup)
- [ ] Tạo branch mới (nếu cần)
- [ ] Viết plan chi tiết
- [ ] Liệt kê các API endpoints cần tạo/sửa

### **Bước 3: Implementation**
- [ ] Tạo file mới thay vì sửa file cũ (nếu có thể)
- [ ] Giữ nguyên code cũ, thêm code mới
- [ ] Test tính năng mới
- [ ] Test lại tính năng cũ (regression test)

### **Bước 4: Documentation**
- [ ] Cập nhật tài liệu tính năng
- [ ] Báo cáo thay đổi
- [ ] Giải thích cách tốt hơn

### **Bước 5: Review & Deploy**
- [ ] Review code
- [ ] Test tổng hợp
- [ ] Deploy

---

## 📋 **TEMPLATE BÁO CÁO THAY ĐỔI**

```markdown
## 🔄 THAY ĐỔI: [Tên tính năng]

### **Ngày thay đổi:** [YYYY-MM-DD]

### **Tính năng mới:**
- [ ] Tính năng mới hoàn toàn
- [ ] Cải thiện tính năng cũ
- [ ] Sửa bug

### **Các file đã thay đổi:**
- `path/to/file1.tsx` - [Mô tả thay đổi]
- `path/to/file2.ts` - [Mô tả thay đổi]

### **Tính năng cũ bị ảnh hưởng:**
- [ ] Không có
- [ ] [Tên tính năng] - [Mô tả ảnh hưởng]

### **Tính năng mới tốt hơn như thế nào:**
1. [Lợi ích 1]
2. [Lợi ích 2]
3. [Lợi ích 3]

### **Cách test:**
1. [Bước test 1]
2. [Bước test 2]

### **Rollback plan:**
- [Cách rollback nếu có vấn đề]
```

---

## 🛡️ **QUY TẮC BẢO VỆ TÍNH NĂNG CŨ**

### **1. Không Xóa Code Cũ**
```typescript
// ❌ SAI: Xóa code cũ
function oldFunction() {
  // Code cũ bị xóa
}

// ✅ ĐÚNG: Giữ code cũ, thêm code mới
function oldFunction() {
  // Code cũ được giữ nguyên
}

function newFunction() {
  // Code mới được thêm
}
```

### **2. Thêm Tính Năng Mới, Không Sửa Cũ**
```typescript
// ❌ SAI: Sửa function cũ
function getCustomers() {
  // Logic cũ bị thay đổi
}

// ✅ ĐÚNG: Tạo function mới
function getCustomers() {
  // Logic cũ giữ nguyên
}

function getCustomersWithPhotos() {
  // Logic mới
}
```

### **3. Versioning cho Breaking Changes**
```typescript
// ✅ ĐÚNG: Versioning
function getCustomersV1() {
  // Version cũ
}

function getCustomersV2() {
  // Version mới
}
```

### **4. Feature Flags**
```typescript
// ✅ ĐÚNG: Feature flag
const USE_NEW_FEATURE = process.env.NEXT_PUBLIC_USE_NEW_FEATURE === 'true';

if (USE_NEW_FEATURE) {
  // Tính năng mới
} else {
  // Tính năng cũ
}
```

---

## 🔍 **KIỂM TRA REGRESSION**

### **Checklist Test Sau Khi Thêm Tính Năng Mới:**

#### **CRM Module**
- [ ] Xem danh sách khách hàng
- [ ] Tìm kiếm khách hàng
- [ ] Xem chi tiết khách hàng
- [ ] Thêm khách hàng mới
- [ ] Sửa khách hàng
- [ ] Xóa khách hàng
- [ ] Quản lý nhóm khách hàng
- [ ] Thêm khách vào nhóm
- [ ] Upload ảnh khách hàng
- [ ] Xem ảnh khách hàng
- [ ] Xóa ảnh khách hàng
- [ ] Import Excel
- [ ] Thống kê khách hàng

#### **Booking Module**
- [ ] Xem lịch booking
- [ ] Tạo booking mới
- [ ] Sửa booking
- [ ] Xóa booking
- [ ] Drag & drop booking
- [ ] Filter theo staff

#### **POS Module**
- [ ] Tạo đơn hàng
- [ ] Thanh toán
- [ ] In hóa đơn

#### **Inventory Module**
- [ ] Xem danh sách sản phẩm
- [ ] Thêm sản phẩm
- [ ] Sửa sản phẩm
- [ ] Xóa sản phẩm
- [ ] Kiểm tra tồn kho
- [ ] Restock

#### **Dashboard**
- [ ] Xem KPIs
- [ ] Xem charts
- [ ] Xem alerts

#### **Authentication**
- [ ] Đăng nhập
- [ ] Đăng xuất
- [ ] Phân quyền

---

## 📊 **SO SÁNH TRƯỚC/SAU**

### **Template So Sánh:**

```markdown
## 📊 SO SÁNH: [Tên tính năng]

### **TRƯỚC:**
- Tính năng: [Mô tả]
- Performance: [Số liệu]
- UX: [Mô tả]
- Code: [Số dòng code]

### **SAU:**
- Tính năng: [Mô tả]
- Performance: [Số liệu]
- UX: [Mô tả]
- Code: [Số dòng code]

### **CẢI THIỆN:**
- ✅ [Cải thiện 1]: [Mô tả]
- ✅ [Cải thiện 2]: [Mô tả]
- ✅ [Cải thiện 3]: [Mô tả]

### **GIỮ NGUYÊN:**
- ✅ [Tính năng cũ 1]: Vẫn hoạt động như cũ
- ✅ [Tính năng cũ 2]: Vẫn hoạt động như cũ
```

---

## 🚨 **CẢNH BÁO**

### **KHÔNG BAO GIỜ:**
- ❌ Xóa code cũ mà không backup
- ❌ Sửa logic cũ mà không test
- ❌ Thay đổi API mà không versioning
- ❌ Xóa database models mà không migration
- ❌ Thay đổi UI mà không test responsive

### **PHẢI LÀM:**
- ✅ Backup trước khi thay đổi
- ✅ Test regression sau mỗi thay đổi
- ✅ Báo cáo mọi thay đổi
- ✅ Giải thích lý do thay đổi
- ✅ So sánh trước/sau

---

## 📝 **VÍ DỤ THỰC TẾ**

### **Ví dụ 1: Thêm tính năng Upload Ảnh**

#### **Báo cáo thay đổi:**
```markdown
## 🔄 THAY ĐỔI: Thêm tính năng Upload Ảnh Khách Hàng

### **Ngày thay đổi:** 2025-01-XX

### **Tính năng mới:**
- ✅ Tính năng mới hoàn toàn

### **Các file đã thay đổi:**
- `components/crm/CustomerPhotosTab.tsx` - Component mới
- `app/api/crm/customers/[customerId]/photos/route.ts` - API mới
- `prisma/schema.prisma` - Thêm model CustomerPhoto
- `components/crm/CustomerActivityPanel.tsx` - Tích hợp tab ảnh

### **Tính năng cũ bị ảnh hưởng:**
- ✅ Không có - Tính năng hoàn toàn mới

### **Tính năng mới tốt hơn như thế nào:**
1. ✅ Cho phép lưu trữ ảnh khách hàng
2. ✅ Quản lý ảnh theo khách hàng
3. ✅ Upload nhiều ảnh cùng lúc
4. ✅ Xem ảnh theo ngày
5. ✅ Download và xóa ảnh

### **Cách test:**
1. Chọn khách hàng trong CRM
2. Mở tab "Ảnh Khách Hàng"
3. Click "Thêm ảnh"
4. Upload ảnh
5. Kiểm tra ảnh hiển thị đúng

### **Rollback plan:**
- Xóa model CustomerPhoto trong schema
- Xóa component CustomerPhotosTab
- Xóa API endpoints
```

---

## 🎯 **QUY TRÌNH LÀM VIỆC**

### **Khi nhận yêu cầu tính năng mới:**

1. **Phân tích yêu cầu**
   - Hiểu rõ yêu cầu
   - Xác định tính năng liên quan
   - Lên plan chi tiết

2. **Backup & Planning**
   - Commit code hiện tại
   - Tạo branch mới
   - Viết plan

3. **Implementation**
   - Tạo file mới (không sửa file cũ)
   - Giữ nguyên logic cũ
   - Thêm logic mới
   - Test

4. **Documentation**
   - Cập nhật docs
   - Báo cáo thay đổi
   - Giải thích cải thiện

5. **Review & Deploy**
   - Review code
   - Test regression
   - Deploy

---

## ✅ **CHECKLIST CUỐI CÙNG**

Trước khi commit/push:

- [ ] Đã backup code cũ
- [ ] Đã test tính năng mới
- [ ] Đã test lại tính năng cũ (regression)
- [ ] Đã cập nhật documentation
- [ ] Đã báo cáo thay đổi
- [ ] Đã giải thích cách tốt hơn
- [ ] Code không có lỗi lint
- [ ] Build thành công

---

## 📞 **LIÊN HỆ**

Nếu có thắc mắc về quy trình phát triển, vui lòng:
1. Đọc lại document này
2. Kiểm tra examples
3. Hỏi trước khi thay đổi lớn

---

*Last updated: 2025-01-XX*
*Version: 1.0.0*

