# Phase 19 - Inventory & Pha Chế Management

Hệ thống quản lý sản phẩm, tồn kho, pha chế và hao hụt cho salon.

## 🎯 Mục tiêu

Tạo hệ thống:
- Quản lý nhập - xuất - tồn theo từng sản phẩm
- Theo dõi pha chế theo gram
- Theo dõi từng dịch vụ đã dùng bao nhiêu thuốc
- Cảnh báo hao hụt vượt mức
- Báo cáo cuối ngày / cuối tháng
- Dashboard trực quan

## 📋 Phase 19 Components

### 19A - Inventory Model (Prisma)
- Product model
- StockLog model
- MixLog model

### 19B - Product Category & Unit System
- 3 nhóm chính: Chemical, Nhuộm, Care
- Đơn vị: g, ml, tube, bottle
- Product examples

### 19C - Stock-in / Stock-out
- API nhập kho
- API xuất kho
- Tự động update stock

### 19D - Pha Chế Log
- Ghi log pha chế theo gram
- Link với service/visit
- Tự động trừ kho
- Tính chi phí

### 19E - Hao Hụt Control Engine
- Tính hao hụt = actualQty - expectedQty
- Cảnh báo khi hao hụt > 15%
- AI phân tích nguyên nhân

### 19F - Inventory Dashboard
- Sản phẩm sắp hết
- Hao hụt cao
- Tổng tồn kho theo danh mục
- Chi phí sản phẩm theo dịch vụ

### 19G - Daily Report & Alerts
- Tổng tồn kho
- Sản phẩm dùng nhiều bất thường
- Hao hụt vượt mức
- Chi phí pha chế theo nhân viên

## 🗂️ Files Structure

```
prisma/
└── schema.prisma              # Product, StockLog, MixLog models

core/
└── inventory/
    └── productCategories.ts   # Product categories & examples

app/
└── api/
    └── inventory/
        ├── product/
        │   ├── create/
        │   │   └── route.ts   # Create product
        │   └── list/
        │       └── route.ts   # List products
        ├── stock/
        │   ├── in/
        │   │   └── route.ts   # Stock in
        │   └── out/
        │       └── route.ts   # Stock out
        └── mix/
            ├── create/
            │   └── route.ts   # Create mix log
            └── list/
                └── route.ts   # List mix logs
```

## 📊 Prisma Models

### Product
```prisma
model Product {
  id          String   @id @default(cuid())
  name        String
  category    String   // Chemical | Nhuộm | Care
  subCategory String?
  unit        String   // g | ml | tube | bottle
  pricePerUnit Float
  stock       Float    @default(0)
  minStock    Float?
  maxStock    Float?
  supplier    String?
  expiryDate  DateTime?
  imageUrl    String?
  notes       String?
}
```

### StockLog
```prisma
model StockLog {
  id          String   @id @default(cuid())
  productId   String
  type        String   // IN | OUT | ADJUST | MIX
  quantity    Float    // + cho IN, - cho OUT
  pricePerUnit Float?
  totalCost   Float?
  note        String?
  referenceId String?
  createdBy   String
}
```

### MixLog
```prisma
model MixLog {
  id            String   @id @default(cuid())
  serviceId     String?
  visitId       String?
  staffId       String
  productId     String
  quantity      Float
  expectedQty   Float?
  actualQty     Float
  cost          Float
  note          String?
  imageUrl      String?
}
```

## 🚀 API Endpoints

### POST /api/inventory/product/create
Create new product.

### GET /api/inventory/product/list
List products (with filters).

### POST /api/inventory/stock/in
Stock in (nhập kho).

### POST /api/inventory/stock/out
Stock out (xuất kho).

### POST /api/inventory/mix/create
Create mix log (pha chế).

### GET /api/inventory/mix/list
List mix logs (with filters).

## ✅ Phase 19 Checklist (50% Complete)

- ✅ Prisma Models (Product, StockLog, MixLog)
- ✅ Product Categories & Units
- ✅ API Create Product
- ✅ API List Products
- ✅ API Stock In
- ✅ API Stock Out
- ✅ API Create Mix Log
- ✅ API List Mix Logs
- ⏳ Hao Hụt Control Engine (19E)
- ⏳ Inventory Dashboard (19F)
- ⏳ Daily Report & Alerts (19G)

## 🎉 Kết quả

Sau Phase 19 (50%), salon đã có:
- ✅ Hệ thống quản lý sản phẩm cơ bản
- ✅ Stock in/out system
- ✅ Pha chế log system
- ✅ Tự động trừ kho khi pha chế
- ⏳ Cần hoàn thiện: Dashboard, Hao hụt, Reports

**Phase 19 framework đã sẵn sàng!**

