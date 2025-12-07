# Phase 16A - SOP Master System

Hệ thống quản lý quy trình vận hành salon chuẩn hóa - ONE SOURCE OF TRUTH.

## 🎯 Mục tiêu

Tạo SOP trung tâm để:
- Chuẩn hóa quy trình vận hành salon
- Quy định từng bộ phận rõ ràng
- Checklist để nhân viên làm đúng
- UI xem nhanh, filter theo bộ phận
- AI hỗ trợ tạo SOP mới
- Nền tảng cho SOP automation (Phase 16B-16F)

## 📋 SOP 7 Bước Chuẩn Chí Tâm Hair Salon

### 1. Chào khách & Tiếp nhận thông tin
- Lễ tân chủ động chào
- Hỏi nhu cầu
- Xác nhận lịch hẹn
- Ghi nhận trạng thái tâm lý khách

### 2. Tư vấn & Khảo sát tóc
- Stylist phân tích tóc
- Kiểm tra lịch sử hóa chất
- Đánh giá độ rủi ro
- Gợi ý kiểu & dịch vụ phù hợp
- Xin phép báo giá (theo nguyên tắc Mina)

### 3. Chốt dịch vụ & vào quy trình
- Xác nhận dịch vụ cuối
- Chọn sản phẩm
- Chuyển thông tin qua pha chế

### 4. Thực hiện kỹ thuật
- Stylist + phụ việc chia task
- Kiểm soát an toàn
- Theo dõi thời gian
- Chụp hình before nếu cần

### 5. Hoàn thiện & Kiểm tra
- Sấy/hoàn thiện
- Kiểm tra 360 độ
- Hướng dẫn chăm sóc tại nhà
- Upsell hợp lý

### 6. Thanh toán
- Lễ tân xác nhận dịch vụ
- Giải thích ưu đãi
- Điểm thành viên

### 7. Chăm sóc sau dịch vụ
- Nhắn tin 24h → hỏi tình trạng tóc
- Nhắc khách quay lại
- Gợi ý sản phẩm tại nhà
- Nhập dữ liệu vào hệ thống

## 🗂️ Database Schema

```prisma
model SOP {
  id        String   @id @default(cuid())
  step      Int
  title     String
  detail    Json     // Nội dung quy trình chi tiết
  role      String   // receptionist | stylist | assistant | online | all
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## 🚀 API Endpoints

### 1. Add SOP

```
POST /api/sop/add
{
  "step": 1,
  "title": "Chào khách & Tiếp nhận thông tin",
  "detail": {
    "purpose": "...",
    "steps": [...],
    "checklist": [...],
    "commonMistakes": [...]
  },
  "role": "receptionist"
}
```

### 2. Get SOPs

```
POST /api/sop/get
{
  "role": "stylist"  // Optional: filter by role
}
```

**Response:**
```json
{
  "success": true,
  "sops": [
    {
      "id": "...",
      "step": 1,
      "title": "...",
      "detail": {...},
      "role": "receptionist"
    }
  ],
  "total": 7
}
```

### 3. Generate SOP (AI)

```
POST /api/sop/generate
{
  "step": 1,
  "title": "Chào khách & Tiếp nhận thông tin",
  "role": "receptionist",
  "context": "...",
  "autoSave": true  // Optional: auto-save after generation
}
```

## 🎨 UI Page

**Path:** `/sop`

**Features:**
- Filter by role (receptionist, stylist, assistant, online, all)
- Display all SOPs with step numbers
- Expandable detail view
- Sections: Purpose, Steps, Checklist, Common Mistakes, Quality Standards
- Clean, professional layout

## 📝 SOP Structure

```json
{
  "title": "Tiêu đề SOP",
  "purpose": "Mục đích của bước này",
  "steps": [
    {
      "stepNumber": 1,
      "description": "Mô tả bước chi tiết",
      "estimatedTime": "5 phút",
      "important": true
    }
  ],
  "checklist": [
    "Điểm kiểm tra 1",
    "Điểm kiểm tra 2"
  ],
  "commonMistakes": [
    {
      "mistake": "Lỗi thường gặp",
      "prevention": "Cách tránh"
    }
  ],
  "qualityStandards": [
    "Tiêu chuẩn 1",
    "Tiêu chuẩn 2"
  ],
  "notes": "Ghi chú bổ sung"
}
```

## 🔧 Roles

- **receptionist**: Lễ tân
- **stylist**: Stylist
- **assistant**: Phụ việc
- **online**: CSKH Online
- **all**: Tất cả bộ phận

## ✅ Phase 16A Checklist

- ✅ Prisma model (SOP)
- ✅ API: Add SOP
- ✅ API: Get SOPs (with filter)
- ✅ API: Generate SOP (AI)
- ✅ SOP Generator Prompt
- ✅ UI: SOP Master Page
- ✅ Role-based filtering
- ✅ Documentation

## 🎯 Next Steps (Phase 16B-16F)

- 16B: SOP Lễ tân automation
- 16C: SOP Stylist automation
- 16D: SOP Pha chế automation
- 16E: SOP CSKH Online automation
- 16F: Operations Dashboard

## 🎉 Kết quả

Sau Phase 16A, salon đã có:
- ✅ SOP trung tâm - ONE SOURCE OF TRUTH
- ✅ Quy trình 7 bước chuẩn hóa
- ✅ Quy định từng bộ phận
- ✅ Checklist để nhân viên làm đúng
- ✅ UI xem nhanh, filter theo bộ phận
- ✅ AI hỗ trợ tạo SOP mới
- ✅ Nền tảng cho SOP automation

**Salon anh hoạt động như một hệ thống chuyên nghiệp: rõ ràng – nhanh – chuẩn – đo lường được!**

