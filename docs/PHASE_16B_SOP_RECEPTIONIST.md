# Phase 16B - SOP Lễ Tân

Hệ thống SOP chuẩn hóa cho bộ phận Lễ Tân - Chí Tâm Hair Salon.

## 🎯 Mục tiêu

Tạo SOP đầy đủ 7 bước cho Lễ Tân:
- Chuẩn hóa quy trình tiếp khách
- Checklist rõ ràng
- Xử lý các tình huống đặc biệt
- AI hỗ trợ khi gặp khó khăn

## 📋 SOP 7 Bước Lễ Tân

### Bước 1: Chào khách & Nhận diện khách
- Đứng dậy chào trong 3 giây đầu
- Hỏi nhu cầu khách
- Xác nhận lịch hẹn (nếu có)
- Ghi chú trạng thái khách

### Bước 2: Xác nhận thông tin + Điều phối
- Kiểm tra lịch hẹn
- Chọn stylist phù hợp
- Thông báo thời gian chờ
- Cập nhật trạng thái

### Bước 3: Hỗ trợ tư vấn cho Stylist
- Giới thiệu khách cho stylist
- Bàn giao thông tin
- Chuẩn bị không gian tư vấn
- Hỗ trợ khi cần

### Bước 4: Trong suốt quá trình làm
- Quan sát khách
- Mời nước nếu cần
- Điều phối phụ việc/pha chế
- Kiểm tra môi trường
- Hỗ trợ stylist

### Bước 5: Bàn giao Lễ tân ↔ Stylist
- Nhận thông tin từ stylist
- Xác nhận dịch vụ
- Hỏi upsell sản phẩm
- Chuẩn bị hóa đơn

### Bước 6: Thanh toán chuẩn 5 bước
- Xác nhận dịch vụ
- Giải thích giá rõ ràng
- Đưa ưu đãi
- Mở hóa đơn
- Chúc khách + mời chụp ảnh

### Bước 7: Chăm sóc sau dịch vụ (Follow-up)
- Nhắn tin Zalo 24h
- Gửi hướng dẫn chăm sóc
- Mời book lịch lại
- Nhập thông tin vào hệ thống

## 🗂️ Files Structure

```
core/
├── data/
│   └── receptionistSOP.json    # Full 7-step SOP JSON
└── prompts/
    └── sopSupportPrompt.ts     # AI support prompt

app/
├── api/
│   └── sop/
│       ├── import/
│       │   └── route.ts        # Generic import API
│       └── import-receptionist/
│           └── route.ts        # Quick import receptionist SOPs
└── (dashboard)/
    └── sop/
        └── receptionist-support/
            └── page.tsx        # AI support UI
```

## 🚀 Import SOPs

### Quick Import (Recommended)

```
POST /api/sop/import-receptionist
{
  "overwrite": false  // Optional: overwrite existing SOPs
}
```

This will import all 7 receptionist SOPs from the JSON file.

### Generic Import

```
POST /api/sop/import
{
  "sops": [...],      // Array of SOP objects
  "overwrite": false
}
```

## 🤖 AI Support

### Get Support Advice

```
POST /api/sop/support
{
  "situation": "Khách khó tính, phàn nàn về dịch vụ",
  "context": "Khách là VIP, lần đầu đến salon",
  "customerInfo": {...}  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "support": {
    "analysis": "...",
    "approach": "...",
    "steps": [...],
    "phrases": [...],
    "doNot": [...],
    "escalate": "...",
    "expectedOutcome": "..."
  }
}
```

### Common Situations Supported:
- Khách khó tính, phàn nàn
- Khách gấp, đòi làm ngay
- Khách đòi stylist A nhưng A bận
- Khách muốn hoàn tiền
- Khách không hài lòng với kết quả
- Khách walk-in nhưng salon đầy

## 🎨 UI Pages

### 1. SOP Master Page
**Path:** `/sop`
- Filter by role = "receptionist"
- Display all 7 receptionist SOPs
- Full detail view

### 2. AI Support Page
**Path:** `/sop/receptionist-support`
- Input situation
- Get AI support advice
- Step-by-step guidance
- Sample phrases
- Do's and Don'ts

## ✅ Phase 16B Checklist

- ✅ SOP 7 bước chuẩn hóa
- ✅ Checklist YES/NO
- ✅ JSON SOP ready for import
- ✅ Import API
- ✅ AI Support Prompt
- ✅ AI Support API
- ✅ UI: Receptionist Support page
- ✅ Documentation

## 🎉 Kết quả

Sau Phase 16B, salon đã có:
- ✅ SOP Lễ Tân đầy đủ 7 bước
- ✅ Checklist chuẩn
- ✅ JSON import sẵn sàng
- ✅ UI hiển thị hoàn chỉnh
- ✅ AI hỗ trợ xử lý tình huống đặc biệt

**Tất cả trong 1 hệ thống — cực chuyên nghiệp!**

