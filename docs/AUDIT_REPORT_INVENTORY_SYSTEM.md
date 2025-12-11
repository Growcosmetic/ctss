# 📊 BÁO CÁO AUDIT HỆ THỐNG QUẢN LÝ KHO HÀNG
**Ngày:** 11/12/2025  
**Người thực hiện:** Senior Lead Developer  
**Mục tiêu:** So sánh codebase hiện tại với yêu cầu nghiệp vụ thực tế

---

## 🎯 YÊU CẦU NGHIỆP VỤ

### Module 1: Quản lý sản phẩm
- ✅ Danh mục (Category)
- ⚠️ Giá vốn/Giá bán (Cost Price/Selling Price)
- ✅ Đơn vị tính (Unit)
- ✅ Hình ảnh (Image)
- ⚠️ Trạng thái (Sẵn sàng/Ngừng kinh doanh)

### Module 2: Quản lý kho (Inventory)
- ✅ Dashboard cảnh báo tồn kho thấp
- ⚠️ Phiếu Nhập (Stock Receipt)
- ⚠️ Phiếu Xuất (Stock Issue)
- ❌ Chuyển kho (Stock Transfer)
- ⚠️ Tổng giá trị kho (Inventory Valuation)

### Module 3: Quản lý nhà cung cấp
- ✅ Thông tin liên hệ
- ❌ Lịch sử nhập hàng

---

## 📋 PHẦN 1: HIỆN TRẠNG (WHAT WE HAVE)

### 1.1 Database Schema

#### ✅ **Model Product** (`prisma/schema.prisma:204-244`)
```prisma
model Product {
  id           String  @id @default(uuid())
  name         String
  category     String                    // ✅ Danh mục
  subCategory  String?                   // ✅ Danh mục phụ
  unit         String                     // ✅ Đơn vị đếm
  capacity     Float?                     // ✅ Dung tích
  capacityUnit String?                    // ✅ Đơn vị dung tích
  pricePerUnit Float?                     // ⚠️ Giá bán (có)
  // ❌ THIẾU: costPrice (Giá vốn)
  imageUrl     String?                    // ✅ Hình ảnh
  minStock     Float?                     // ✅ Mức tối thiểu
  maxStock     Float?                     // ✅ Mức tối đa
  supplierId   String?                    // ✅ Link nhà cung cấp
  expiryDate   DateTime?                  // ✅ Hạn sử dụng
  notes        String?                    // ✅ Ghi chú
  // ⚠️ THIẾU: isActive (Trạng thái) - có thể dùng logic khác
}
```

**Đánh giá:**
- ✅ Có đầy đủ: Danh mục, Đơn vị tính, Hình ảnh
- ⚠️ Thiếu: `costPrice` (Giá vốn) - chỉ có `pricePerUnit` (Giá bán)
- ⚠️ Thiếu: `isActive` field rõ ràng để quản lý trạng thái

#### ✅ **Model ProductStock** (`prisma/schema.prisma:283-296`)
```prisma
model ProductStock {
  id         String    @id @default(uuid())
  productId String
  branchId  String
  locationId String?   // ✅ Vị trí trong kho
  quantity  Int        // ✅ Số lượng tồn kho
  updatedAt DateTime   @updatedAt
}
```

**Đánh giá:** ✅ Đầy đủ cho tracking tồn kho theo chi nhánh

#### ✅ **Model StockTransaction** (`prisma/schema.prisma:320-331`)
```prisma
model StockTransaction {
  id        String   @id @default(uuid())
  productId String
  branchId  String
  type      String   // IN | OUT | ADJUST
  quantity  Int
  reason    String?
  createdAt DateTime @default(now())
}
```

**Đánh giá:**
- ✅ Có: IN, OUT, ADJUST
- ❌ Thiếu: TRANSFER type và logic chuyển kho

#### ✅ **Model Supplier** (`prisma/schema.prisma:347-371`)
```prisma
model Supplier {
  id           String   @id @default(uuid())
  code         String
  name         String
  contactName  String?
  phone        String?
  email        String?
  address      String?
  city         String?
  province     String?
  taxCode      String?
  website      String?
  paymentTerms String?
  notes        String?
  isActive     Boolean  @default(true)
  // ❌ THIẾU: Relation đến Purchase Orders/Stock Receipts
}
```

**Đánh giá:**
- ✅ Đầy đủ thông tin liên hệ
- ❌ Thiếu: Relation đến lịch sử nhập hàng

#### ❌ **Model StockTransfer** - KHÔNG TỒN TẠI
**Đánh giá:** ❌ Chưa có model cho chuyển kho giữa các chi nhánh

#### ❌ **Model PurchaseOrder / StockReceipt** - KHÔNG TỒN TẠI
**Đánh giá:** ❌ Chưa có model cho Phiếu Nhập/Xuất có cấu trúc

---

### 1.2 Backend API Endpoints

#### ✅ **Product Management APIs**
| Endpoint | Method | Status | Ghi chú |
|----------|--------|--------|---------|
| `/api/inventory` | GET | ✅ | List products |
| `/api/inventory` | POST | ✅ | Create product |
| `/api/inventory/product/[id]` | GET | ✅ | Get product detail |
| `/api/inventory/product/[id]` | PUT | ✅ | Update product |
| `/api/inventory/import` | POST | ✅ | Import Excel |
| `/api/inventory/seed` | POST | ✅ | Seed sample data |

**Đánh giá:**
- ✅ CRUD đầy đủ
- ⚠️ Thiếu: API để set `isActive` status
- ⚠️ Thiếu: `costPrice` field trong create/update

#### ✅ **Inventory Management APIs**
| Endpoint | Method | Status | Ghi chú |
|----------|--------|--------|---------|
| `/api/inventory/alerts` | GET | ✅ | Low stock alerts |
| `/api/inventory/stock/in` | POST | ✅ | Nhập kho |
| `/api/inventory/stock/out` | POST | ✅ | Xuất kho |
| `/api/inventory/stock/[id]/location` | PUT | ✅ | Assign location |
| `/api/inventory/transactions` | GET | ✅ | List transactions |
| `/api/inventory/adjust` | POST | ✅ | Điều chỉnh tồn kho |

**Đánh giá:**
- ✅ Có API nhập/xuất kho cơ bản
- ❌ Thiếu: API chuyển kho (`/api/inventory/transfer`)
- ⚠️ Thiếu: API Phiếu Nhập/Xuất có cấu trúc (với số phiếu, người duyệt, etc.)

#### ⚠️ **Inventory Valuation API**
| Endpoint | Method | Status | Ghi chú |
|----------|--------|--------|---------|
| `/api/reports` | GET | ⚠️ | Có tính tổng giá trị nhưng không có endpoint riêng |

**Đánh giá:**
- ⚠️ Có tính trong `/api/reports` nhưng không có endpoint riêng `/api/inventory/valuation`
- ⚠️ Logic tính giá trị dựa trên `cost` field (không tồn tại trong Product model)

#### ✅ **Supplier Management APIs**
| Endpoint | Method | Status | Ghi chú |
|----------|--------|--------|---------|
| `/api/inventory/suppliers` | GET | ✅ | List suppliers |
| `/api/inventory/suppliers` | POST | ✅ | Create supplier |
| `/api/inventory/suppliers/[id]` | GET | ✅ | Get supplier |
| `/api/inventory/suppliers/[id]` | PUT | ✅ | Update supplier |
| `/api/inventory/suppliers/[id]` | DELETE | ✅ | Delete supplier |
| `/api/inventory/suppliers/import` | POST | ✅ | Import Excel |

**Đánh giá:**
- ✅ CRUD đầy đủ
- ❌ Thiếu: API lấy lịch sử nhập hàng theo supplier (`/api/inventory/suppliers/[id]/purchase-history`)

---

### 1.3 Frontend Components

#### ✅ **Product Management UI**
- ✅ `CreateProductModal` - Tạo sản phẩm
- ✅ `EditProductModal` - Sửa sản phẩm
- ✅ `ImportExcelModal` - Import Excel
- ✅ `CategorySidebar` - Danh mục sản phẩm
- ✅ `ProductUnitSelector` - Chọn đơn vị tính

**Đánh giá:**
- ✅ UI đầy đủ cho CRUD
- ⚠️ Thiếu: Toggle `isActive` status trong UI
- ⚠️ Thiếu: Field `costPrice` trong form

#### ✅ **Inventory Dashboard UI**
- ✅ `InventoryDashboard` - Dashboard chính
- ✅ `LowStockAlertCard` - Cảnh báo tồn kho thấp
- ✅ `StockCard` - Card hiển thị sản phẩm
- ✅ `StockListView` - List view
- ✅ `StockTransactionList` - Lịch sử giao dịch
- ✅ `AssignLocationModal` - Gán vị trí kho

**Đánh giá:**
- ✅ UI đầy đủ cho dashboard và cảnh báo
- ❌ Thiếu: UI cho Phiếu Nhập/Xuất
- ❌ Thiếu: UI cho Chuyển kho
- ⚠️ Thiếu: Hiển thị tổng giá trị kho rõ ràng

#### ✅ **Supplier Management UI**
- ✅ `SupplierListPage` - Danh sách nhà cung cấp
- ✅ `SupplierFormModal` - Tạo/sửa nhà cung cấp
- ✅ `SupplierSelector` - Chọn nhà cung cấp
- ✅ `ImportSupplierExcelModal` - Import Excel

**Đánh giá:**
- ✅ UI đầy đủ cho CRUD
- ❌ Thiếu: UI hiển thị lịch sử nhập hàng theo supplier

---

## 🔍 PHẦN 2: PHÂN TÍCH THIẾU HỤT (GAP ANALYSIS)

### 2.1 Module 1: Quản lý sản phẩm

| Yêu cầu | Hiện trạng | Gap |
|---------|------------|-----|
| Danh mục | ✅ Có `category`, `subCategory` | ✅ Đầy đủ |
| Giá vốn | ❌ Chỉ có `pricePerUnit` (giá bán) | ❌ **THIẾU `costPrice`** |
| Giá bán | ✅ Có `pricePerUnit` | ✅ Đầy đủ |
| Đơn vị tính | ✅ Có `unit`, `capacity`, `capacityUnit` | ✅ Đầy đủ |
| Hình ảnh | ✅ Có `imageUrl` | ✅ Đầy đủ |
| Trạng thái | ⚠️ Không có field `isActive` rõ ràng | ⚠️ **THIẾU field `isActive`** |

**Gap chi tiết:**
1. ❌ **Thiếu `costPrice`**: Không thể tính lợi nhuận, không thể tính tổng giá trị kho chính xác
2. ⚠️ **Thiếu `isActive`**: Không thể quản lý trạng thái "Sẵn sàng/Ngừng kinh doanh" một cách rõ ràng

---

### 2.2 Module 2: Quản lý kho

| Yêu cầu | Hiện trạng | Gap |
|---------|------------|-----|
| Dashboard cảnh báo | ✅ Có API `/api/inventory/alerts` | ✅ Đầy đủ |
| Phiếu Nhập | ⚠️ Có API `/api/inventory/stock/in` nhưng không có model `StockReceipt` | ⚠️ **THIẾU model và UI** |
| Phiếu Xuất | ⚠️ Có API `/api/inventory/stock/out` nhưng không có model `StockIssue` | ⚠️ **THIẾU model và UI** |
| Chuyển kho | ❌ Không có API và model | ❌ **THIẾU HOÀN TOÀN** |
| Tổng giá trị kho | ⚠️ Có tính trong `/api/reports` nhưng không có endpoint riêng | ⚠️ **THIẾU API riêng và logic chính xác** |

**Gap chi tiết:**

1. ⚠️ **Phiếu Nhập/Xuất không có cấu trúc:**
   - Hiện tại: Chỉ có `StockTransaction` với `type: "IN"/"OUT"`
   - Thiếu: Model `StockReceipt` và `StockIssue` với:
     - Số phiếu (receiptNumber/issueNumber)
     - Ngày phiếu
     - Người tạo/Người duyệt
     - Danh sách sản phẩm (nhiều sản phẩm trong 1 phiếu)
     - Tổng giá trị phiếu
     - Trạng thái (Draft/Approved/Completed)

2. ❌ **Chuyển kho hoàn toàn thiếu:**
   - Không có model `StockTransfer`
   - Không có API `/api/inventory/transfer`
   - Không có UI cho chuyển kho
   - Logic: Cần tạo 2 transactions (OUT ở kho nguồn, IN ở kho đích)

3. ⚠️ **Tổng giá trị kho:**
   - Hiện tại: Tính trong `/api/reports` dựa trên `cost` field (không tồn tại)
   - Thiếu: API riêng `/api/inventory/valuation`
   - Thiếu: Logic tính chính xác dựa trên `costPrice` (chưa có)

---

### 2.3 Module 3: Quản lý nhà cung cấp

| Yêu cầu | Hiện trạng | Gap |
|---------|------------|-----|
| Thông tin liên hệ | ✅ Đầy đủ trong `Supplier` model | ✅ Đầy đủ |
| Lịch sử nhập hàng | ❌ Không có relation và API | ❌ **THIẾU HOÀN TOÀN** |

**Gap chi tiết:**

1. ❌ **Lịch sử nhập hàng:**
   - Thiếu: Relation từ `Supplier` đến `StockTransaction` hoặc `StockReceipt`
   - Thiếu: API `/api/inventory/suppliers/[id]/purchase-history`
   - Thiếu: UI hiển thị lịch sử nhập hàng theo supplier

---

## 💡 PHẦN 3: ĐỀ XUẤT KỸ THUẬT

### 3.1 Database Schema Changes

#### 3.1.1 Cập nhật Model Product
```prisma
model Product {
  // ... existing fields ...
  costPrice     Float?  // ⭐ THÊM: Giá vốn
  sellingPrice  Float?  // ⭐ ĐỔI TÊN: pricePerUnit -> sellingPrice (rõ ràng hơn)
  isActive      Boolean @default(true) // ⭐ THÊM: Trạng thái
  // ... rest of fields ...
}
```

#### 3.1.2 Tạo Model StockReceipt (Phiếu Nhập)
```prisma
model StockReceipt {
  id            String   @id @default(uuid())
  receiptNumber String   @unique // Số phiếu (ví dụ: PN-2025-001)
  branchId      String
  supplierId   String?  // Link đến nhà cung cấp
  date          DateTime @default(now())
  totalValue    Float    // Tổng giá trị phiếu
  status        String   @default("DRAFT") // DRAFT | APPROVED | COMPLETED
  createdBy     String   // User ID
  approvedBy    String?  // User ID người duyệt
  approvedAt    DateTime?
  notes         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  branch        Branch   @relation(fields: [branchId], references: [id])
  supplier      Supplier? @relation(fields: [supplierId], references: [id])
  items         StockReceiptItem[]
  
  @@index([branchId])
  @@index([supplierId])
  @@index([date])
}

model StockReceiptItem {
  id            String   @id @default(uuid())
  receiptId    String
  productId    String
  quantity     Int
  costPrice    Float    // Giá vốn tại thời điểm nhập
  totalCost    Float    // quantity * costPrice
  notes        String?

  receipt      StockReceipt @relation(fields: [receiptId], references: [id], onDelete: Cascade)
  product      Product      @relation(fields: [productId], references: [id])
  
  @@index([receiptId])
  @@index([productId])
}
```

#### 3.1.3 Tạo Model StockIssue (Phiếu Xuất)
```prisma
model StockIssue {
  id            String   @id @default(uuid())
  issueNumber   String   @unique // Số phiếu (ví dụ: PX-2025-001)
  branchId      String
  reason        String   // Lý do xuất: SERVICE_USAGE | SALE | DAMAGED | EXPIRED | OTHER
  date          DateTime @default(now())
  totalValue    Float    // Tổng giá trị phiếu (theo costPrice)
  status        String   @default("DRAFT") // DRAFT | APPROVED | COMPLETED
  createdBy     String   // User ID
  approvedBy    String?  // User ID người duyệt
  approvedAt    DateTime?
  notes         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  branch        Branch   @relation(fields: [branchId], references: [id])
  items         StockIssueItem[]
  
  @@index([branchId])
  @@index([date])
}

model StockIssueItem {
  id            String   @id @default(uuid())
  issueId       String
  productId    String
  quantity     Int
  costPrice    Float    // Giá vốn tại thời điểm xuất
  totalCost    Float    // quantity * costPrice
  notes        String?

  issue        StockIssue @relation(fields: [issueId], references: [id], onDelete: Cascade)
  product      Product    @relation(fields: [productId], references: [id])
  
  @@index([issueId])
  @@index([productId])
}
```

#### 3.1.4 Tạo Model StockTransfer (Chuyển kho)
```prisma
model StockTransfer {
  id            String   @id @default(uuid())
  transferNumber String   @unique // Số phiếu (ví dụ: CK-2025-001)
  fromBranchId  String   // Chi nhánh nguồn
  toBranchId    String   // Chi nhánh đích
  date          DateTime @default(now())
  status        String   @default("PENDING") // PENDING | IN_TRANSIT | COMPLETED | CANCELLED
  createdBy     String   // User ID
  completedBy   String?  // User ID người hoàn thành
  completedAt   DateTime?
  notes         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  fromBranch    Branch   @relation("TransferFrom", fields: [fromBranchId], references: [id])
  toBranch      Branch   @relation("TransferTo", fields: [toBranchId], references: [id])
  items         StockTransferItem[]
  
  @@index([fromBranchId])
  @@index([toBranchId])
  @@index([date])
}

model StockTransferItem {
  id            String   @id @default(uuid())
  transferId    String
  productId    String
  quantity     Int
  costPrice    Float    // Giá vốn tại thời điểm chuyển
  notes         String?

  transfer      StockTransfer @relation(fields: [transferId], references: [id], onDelete: Cascade)
  product       Product       @relation(fields: [productId], references: [id])
  
  @@index([transferId])
  @@index([productId])
}
```

#### 3.1.5 Cập nhật Model Supplier
```prisma
model Supplier {
  // ... existing fields ...
  stockReceipts StockReceipt[] // ⭐ THÊM: Relation đến phiếu nhập
  // ... rest of fields ...
}
```

#### 3.1.6 Cập nhật Model Branch
```prisma
model Branch {
  // ... existing fields ...
  stockReceipts     StockReceipt[]     // ⭐ THÊM
  stockIssues       StockIssue[]       // ⭐ THÊM
  stockTransfersFrom StockTransfer[]   @relation("TransferFrom") // ⭐ THÊM
  stockTransfersTo   StockTransfer[]   @relation("TransferTo")    // ⭐ THÊM
  // ... rest of fields ...
}
```

---

### 3.2 Backend API Endpoints cần tạo

#### 3.2.1 Product Management
| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `/api/inventory/product/[id]/status` | PUT | Cập nhật trạng thái `isActive` |

#### 3.2.2 Stock Receipt (Phiếu Nhập)
| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `/api/inventory/receipts` | GET | List phiếu nhập (có filter: branchId, supplierId, status, dateFrom, dateTo) |
| `/api/inventory/receipts` | POST | Tạo phiếu nhập mới |
| `/api/inventory/receipts/[id]` | GET | Chi tiết phiếu nhập |
| `/api/inventory/receipts/[id]` | PUT | Cập nhật phiếu nhập |
| `/api/inventory/receipts/[id]/approve` | POST | Duyệt phiếu nhập (tự động tạo StockTransaction IN) |
| `/api/inventory/receipts/[id]` | DELETE | Xóa phiếu nhập (chỉ khi status = DRAFT) |

#### 3.2.3 Stock Issue (Phiếu Xuất)
| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `/api/inventory/issues` | GET | List phiếu xuất (có filter: branchId, reason, status, dateFrom, dateTo) |
| `/api/inventory/issues` | POST | Tạo phiếu xuất mới |
| `/api/inventory/issues/[id]` | GET | Chi tiết phiếu xuất |
| `/api/inventory/issues/[id]` | PUT | Cập nhật phiếu xuất |
| `/api/inventory/issues/[id]/approve` | POST | Duyệt phiếu xuất (tự động tạo StockTransaction OUT) |
| `/api/inventory/issues/[id]` | DELETE | Xóa phiếu xuất (chỉ khi status = DRAFT) |

#### 3.2.4 Stock Transfer (Chuyển kho)
| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `/api/inventory/transfers` | GET | List phiếu chuyển kho |
| `/api/inventory/transfers` | POST | Tạo phiếu chuyển kho mới |
| `/api/inventory/transfers/[id]` | GET | Chi tiết phiếu chuyển kho |
| `/api/inventory/transfers/[id]` | PUT | Cập nhật phiếu chuyển kho |
| `/api/inventory/transfers/[id]/complete` | POST | Hoàn thành chuyển kho (tự động tạo 2 StockTransaction: OUT ở kho nguồn, IN ở kho đích) |
| `/api/inventory/transfers/[id]` | DELETE | Hủy phiếu chuyển kho (chỉ khi status = PENDING) |

#### 3.2.5 Inventory Valuation
| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `/api/inventory/valuation` | GET | Tính tổng giá trị kho theo chi nhánh (dựa trên `costPrice` * `quantity`) |

#### 3.2.6 Supplier Purchase History
| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `/api/inventory/suppliers/[id]/purchase-history` | GET | Lịch sử nhập hàng theo supplier (từ StockReceipt) |

---

### 3.3 Frontend Components cần tạo

#### 3.3.1 Product Management
- `ProductStatusToggle` - Component toggle `isActive`
- Cập nhật `CreateProductModal` và `EditProductModal` để thêm field `costPrice`

#### 3.3.2 Stock Receipt (Phiếu Nhập)
- `StockReceiptListPage` - Trang danh sách phiếu nhập
- `StockReceiptFormModal` - Modal tạo/sửa phiếu nhập
- `StockReceiptDetailModal` - Modal xem chi tiết phiếu nhập
- `StockReceiptItemTable` - Component hiển thị danh sách sản phẩm trong phiếu

#### 3.3.3 Stock Issue (Phiếu Xuất)
- `StockIssueListPage` - Trang danh sách phiếu xuất
- `StockIssueFormModal` - Modal tạo/sửa phiếu xuất
- `StockIssueDetailModal` - Modal xem chi tiết phiếu xuất
- `StockIssueItemTable` - Component hiển thị danh sách sản phẩm trong phiếu

#### 3.3.4 Stock Transfer (Chuyển kho)
- `StockTransferListPage` - Trang danh sách phiếu chuyển kho
- `StockTransferFormModal` - Modal tạo/sửa phiếu chuyển kho
- `StockTransferDetailModal` - Modal xem chi tiết phiếu chuyển kho
- `StockTransferItemTable` - Component hiển thị danh sách sản phẩm trong phiếu

#### 3.3.5 Inventory Valuation
- `InventoryValuationCard` - Component hiển thị tổng giá trị kho
- Cập nhật `InventoryDashboard` để hiển thị tổng giá trị kho

#### 3.3.6 Supplier Purchase History
- `SupplierPurchaseHistoryPanel` - Panel hiển thị lịch sử nhập hàng trong `SupplierListPage`

---

## 📊 TÓM TẮT ƯU TIÊN

### Priority 1: Critical (Cần làm ngay)
1. ✅ Thêm `costPrice` vào Product model và API
2. ✅ Thêm `isActive` vào Product model và API
3. ✅ Tạo API `/api/inventory/valuation` để tính tổng giá trị kho

### Priority 2: High (Quan trọng)
4. ✅ Tạo Model và API cho StockReceipt (Phiếu Nhập)
5. ✅ Tạo Model và API cho StockIssue (Phiếu Xuất)
6. ✅ Tạo UI cho Phiếu Nhập/Xuất

### Priority 3: Medium (Cần có)
7. ✅ Tạo Model và API cho StockTransfer (Chuyển kho)
8. ✅ Tạo UI cho Chuyển kho
9. ✅ Tạo API và UI cho Supplier Purchase History

---

## ✅ KẾT LUẬN

**Điểm mạnh:**
- ✅ Database schema cơ bản đã có (Product, ProductStock, StockTransaction, Supplier)
- ✅ API CRUD cho Product và Supplier đầy đủ
- ✅ API nhập/xuất kho cơ bản đã có
- ✅ UI Dashboard và cảnh báo tồn kho đã có

**Điểm yếu:**
- ❌ Thiếu `costPrice` và `isActive` trong Product
- ❌ Thiếu model và API cho Phiếu Nhập/Xuất có cấu trúc
- ❌ Thiếu hoàn toàn chức năng Chuyển kho
- ❌ Thiếu API tính tổng giá trị kho chính xác
- ❌ Thiếu lịch sử nhập hàng theo Supplier

**Khuyến nghị:**
Bắt đầu với Priority 1 để có nền tảng vững chắc, sau đó triển khai Priority 2 và 3 theo thứ tự ưu tiên nghiệp vụ.
