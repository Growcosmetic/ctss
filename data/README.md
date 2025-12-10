# 📊 SEED DATA - Dữ liệu mẫu cho CTSS

## 📁 File Seed Data

File `seed-data.js` chứa tất cả dữ liệu mẫu có thể chỉnh sửa:

- **Users**: Người dùng hệ thống (Admin, Manager, Receptionist, Stylist, Assistant)
- **Customer Groups**: Nhóm khách hàng
- **Customers**: Khách hàng với đầy đủ thông tin
- **Services**: Dịch vụ salon
- **Products**: Sản phẩm/hóa chất
- **Branches**: Chi nhánh

## 🚀 Cách sử dụng

### 1. Chỉnh sửa dữ liệu

Mở file `data/seed-data.js` và chỉnh sửa dữ liệu theo nhu cầu:

```javascript
module.exports = {
  users: [
    {
      name: "Tên của bạn",
      phone: "0900000001",
      password: "123456",
      role: "ADMIN",
    },
    // ... thêm users khác
  ],
  
  customers: [
    {
      firstName: "Nguyễn",
      lastName: "Văn An",
      phone: "0901234567",
      // ... các thông tin khác
    },
    // ... thêm customers khác
  ],
  
  // ... các dữ liệu khác
};
```

### 2. Chạy seed

```bash
# Đảm bảo dev server đang chạy
npm run dev

# Chạy seed (terminal khác)
node scripts/seed-all-via-api.js
```

### 3. Seed từng phần

Nếu chỉ muốn seed một phần:

```bash
# Chỉ seed CRM (customers + groups)
node scripts/seed-crm-via-api.js

# Seed toàn bộ
node scripts/seed-all-via-api.js
```

## 📋 Dữ liệu hiện có

### Users (5)
- Admin User (0900000001)
- Manager User (0900000002)
- Reception User (0900000003)
- Stylist User (0900000004)
- Assistant User (0900000005)

**Password cho tất cả**: `123456`

### Customer Groups (5)
- Khách hàng VIP
- Khách hàng Thân thiết
- Khách hàng Mới
- Khách hàng Tiềm năng
- Khách hàng Thường xuyên

### Customers (10)
- Nguyễn Văn An (VIP)
- Trần Thị Bình (Thân thiết)
- Lê Văn Cường (Mới)
- Phạm Thị Dung (Thường xuyên)
- Hoàng Văn Em (VIP)
- Võ Thị Phương (Thân thiết)
- Đặng Văn Giang (Mới)
- Bùi Thị Hoa (Thường xuyên)
- Ngô Văn Ích (VIP)
- Đỗ Thị Kim (Thân thiết)

### Services (8)
- Cắt tóc nam
- Cắt tóc nữ
- Uốn tóc
- Nhuộm tóc
- Duỗi tóc
- Gội đầu
- Massage da đầu
- Tạo kiểu

### Products (6)
- Thuốc nhuộm L'Oreal
- Thuốc uốn Plexis
- Dầu gội Kerastase
- Dầu xả Kerastase
- Mặt nạ tóc Olaplex
- Thuốc duỗi Goldwell

### Branches (2)
- Chi nhánh Quận 1
- Chi nhánh Quận 3

## 🔄 Cập nhật dữ liệu

1. **Chỉnh sửa file `data/seed-data.js`**
2. **Chạy lại script seed**:
   ```bash
   node scripts/seed-all-via-api.js
   ```
3. Script sẽ tự động bỏ qua các dữ liệu đã tồn tại

## 💡 Tips

- **Thêm customers mới**: Chỉ cần thêm vào array `customers` trong `seed-data.js`
- **Thêm services mới**: Thêm vào array `services`
- **Thay đổi groups**: Sửa array `customerGroups`
- **Script tự động skip**: Nếu dữ liệu đã tồn tại, script sẽ bỏ qua và không tạo duplicate

## 📝 Lưu ý

- Dữ liệu seed qua API nên không cần database permission trực tiếp
- Một số API (Products, Branches) có thể cần authentication
- Services và Customers đã được seed thành công
- File `seed-data.js` có thể commit vào Git để chia sẻ với team

---

**Tạo bởi**: CTSS Development Team  
**Cập nhật**: 2025-12-10

