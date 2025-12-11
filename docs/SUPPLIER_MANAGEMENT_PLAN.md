# 📋 KẾ HOẠCH QUẢN LÝ NHÀ CUNG CẤP (SUPPLIER MANAGEMENT)

## 🎯 Mục tiêu

Tạo hệ thống quản lý nhà cung cấp đầy đủ với:
- CRUD nhà cung cấp
- Import/Export Excel danh sách nhà cung cấp
- Liên kết nhà cung cấp với sản phẩm
- Quản lý thông tin liên hệ, địa chỉ, điều khoản thanh toán

## 📊 Cấu trúc dữ liệu đề xuất

### Supplier Model
```prisma
model Supplier {
  id            String   @id @default(uuid())
  code          String   // Mã nhà cung cấp (ví dụ: NCC001)
  name          String   // Tên nhà cung cấp
  contactName   String?  // Tên người liên hệ
  phone         String?  // Số điện thoại
  email         String?  // Email
  address       String?  // Địa chỉ
  city          String?  // Thành phố
  province      String?  // Tỉnh/Thành phố
  country       String?  @default("VN") // Quốc gia
  taxCode       String?  // Mã số thuế
  website       String?  // Website
  paymentTerms  String?  // Điều khoản thanh toán (ví dụ: "Net 30")
  notes         String?  // Ghi chú
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  products      Product[]
  
  @@unique([code])
  @@index([name])
  @@index([isActive])
}
```

### Cập nhật Product Model
```prisma
model Product {
  // ... existing fields ...
  supplierId    String?  // Thay thế supplier String bằng supplierId
  supplier      Supplier? @relation(fields: [supplierId], references: [id])
}
```

## 🎨 UI Components cần tạo

1. **SupplierListPage** - Trang danh sách nhà cung cấp
2. **SupplierFormModal** - Modal tạo/sửa nhà cung cấp
3. **SupplierDetailPanel** - Panel chi tiết nhà cung cấp
4. **SupplierSelector** - Component chọn nhà cung cấp (dropdown)
5. **ImportSupplierExcelModal** - Import Excel cho nhà cung cấp
6. **Export Supplier Excel** - Xuất danh sách nhà cung cấp

## 📝 Format Excel cho Nhà cung cấp

| Cột | Mô tả | Bắt buộc |
|-----|-------|----------|
| Mã nhà cung cấp | Mã duy nhất | ✅ |
| Tên nhà cung cấp | Tên công ty/nhà cung cấp | ✅ |
| Người liên hệ | Tên người liên hệ | |
| Số điện thoại | SĐT liên hệ | |
| Email | Email liên hệ | |
| Địa chỉ | Địa chỉ | |
| Thành phố | Thành phố | |
| Tỉnh/Thành phố | Tỉnh/TP | |
| Mã số thuế | MST | |
| Website | Website | |
| Điều khoản thanh toán | Ví dụ: Net 30 | |
| Ghi chú | Ghi chú | |

## 🔄 Workflow

1. **Tạo/Sửa Nhà cung cấp**: Form với đầy đủ thông tin
2. **Gán nhà cung cấp cho sản phẩm**: Khi tạo/sửa sản phẩm, chọn từ dropdown Supplier
3. **Import Excel**: Upload file Excel danh sách nhà cung cấp
4. **Export Excel**: Xuất danh sách nhà cung cấp ra Excel
5. **Xem sản phẩm theo nhà cung cấp**: Filter sản phẩm theo nhà cung cấp

## 📍 Vị trí trong UI

- Tab "Quản lý nhà cung cấp" trong trang Inventory (như hình tham khảo)
- Hoặc submenu trong Inventory Management
