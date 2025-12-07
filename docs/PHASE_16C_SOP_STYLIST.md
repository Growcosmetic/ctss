# Phase 16C - SOP Stylist

Hệ thống SOP chuẩn hóa cho bộ phận Stylist - Chí Tâm Hair Salon.

## 🎯 Mục tiêu

Tạo SOP đầy đủ 7 bước cho Stylist:
- Chuẩn hóa quy trình tư vấn và kỹ thuật
- Tích hợp AI Stylist Coach (Phase 11)
- Form khảo sát tóc chi tiết
- Checklist kỹ thuật
- SOP xử lý rủi ro
- Upsell tinh tế theo style Mina

## 📋 SOP 7 Bước Stylist

### Bước 1: Chào & Tạo thiện cảm
- Cười, chào, xưng tên
- Quan sát tóc nhanh
- Hỏi nhu cầu khách
- Lắng nghe thật sự
- Ghi chú cảm xúc khách

### Bước 2: Khảo sát tóc (Hair Diagnosis)
- Kiểm tra 6 yếu tố: Độ giãn, đàn hồi, lịch sử hóa chất, độ hư tổn, tỷ lệ tóc mới/cũ, độ dày
- Tuyên bố rủi ro rõ ràng
- Chụp ảnh before (nếu cần)
- Tích hợp AI Stylist Coach để phân tích

### Bước 3: Tư vấn & Đề xuất 3 phương án
- Option A: Đẹp nhất (kỹ thuật cao + sản phẩm premium)
- Option B: Cân bằng (tối ưu chi phí)
- Option C: An toàn nhất (cho tóc yếu)
- Hỏi câu Mina: "Chị muốn em báo giá trước hay mình chốt dịch vụ rồi báo giá sau ha?"

### Bước 4: Xác nhận dịch vụ + Ghi phiếu
- Xác nhận dịch vụ khách chọn
- Ghi phiếu đầy đủ
- Bàn giao cho lễ tân + pha chế
- Chuẩn bị kỹ thuật

### Bước 5: Thực hiện kỹ thuật (7 nguyên tắc)
1. Kiểm soát độ ẩm (25-35%)
2. Quy luật phân khu (Pure Forms / Solid Form)
3. Đo độ mềm, test thuốc đúng chuẩn
4. Kiểm soát độ căng & xoăn
5. Thời gian tiêu chuẩn
6. Lưu ý rủi ro (overprocess)
7. Hoàn thiện mềm mại theo khuôn mặt

### Bước 6: Review kết quả + Hướng dẫn
- Cho khách xem 360 độ
- Giải thích sản phẩm đã dùng
- Đề xuất sản phẩm chăm sóc (tinh tế, không ép buộc)

### Bước 7: Hướng dẫn chăm sóc sau dịch vụ
- Gửi file hướng dẫn
- Nhắc lịch quay lại (4-8 tuần)
- Nhắc follow-up 24-48h
- Ghi chú kỹ thuật vào hệ thống (cho AI Coach)

## 🗂️ Files Structure

```
core/
├── data/
│   ├── stylistSOP.json              # Full 7-step SOP JSON
│   ├── stylistChecklist.json        # Technical checklist
│   └── stylistTroubleshooting.json  # Troubleshooting guides
└── prompts/
    └── sopSupportPrompt.ts          # AI support (reused)

app/
├── api/
│   ├── sop/
│   │   └── import-stylist/
│   │       └── route.ts            # Import stylist SOPs
│   └── stylist/
│       ├── troubleshooting/
│       │   └── route.ts            # Get troubleshooting guides
│       └── checklist/
│           └── route.ts            # Get checklist
└── (dashboard)/
    └── sop/
        └── stylist-troubleshooting/
            └── page.tsx            # Troubleshooting UI
```

## 🚀 API Endpoints

### Import Stylist SOPs

```
POST /api/sop/import-stylist
{
  "overwrite": false
}
```

### Get Troubleshooting Guides

```
GET /api/stylist/troubleshooting
GET /api/stylist/troubleshooting?id=hair_not_hold_curl
```

### Get Checklist

```
GET /api/stylist/checklist
GET /api/stylist/checklist?category=technical
```

## 🔧 Troubleshooting Guides

4 tình huống được hỗ trợ:

1. **Tóc không vào nếp sau uốn**
   - Kiểm tra độ ẩm, góc cuốn, size trục
   - Xử lý lại phần thân nếu cần

2. **Tóc bị phai màu – xỉn màu**
   - Khắc phục bằng Acid Gloss / Pigment
   - Hướng dẫn chăm sóc màu

3. **Tóc khô – xốp sau dịch vụ**
   - Ampoule + Phục hồi nóng nhẹ 10'
   - Theo dõi 48h

4. **Tóc đứt – yếu – overprocess**
   - KHÔNG tiếp tục hóa chất
   - Điều trị phục hồi 2-3 lần
   - Đánh giá lại sau 10 ngày

## 📊 Checklist Categories

- **assessment**: Khảo sát tóc
- **consultation**: Tư vấn
- **confirmation**: Xác nhận dịch vụ
- **technical**: Kỹ thuật
- **review**: Review kết quả
- **followup**: Chăm sóc sau dịch vụ

## 🤖 Integration với AI Stylist Coach

- Bước 2 (Khảo sát): Dùng AI Coach để phân tích tình trạng tóc
- Bước 5 (Kỹ thuật): Tham khảo AI Coach cho quyết định kỹ thuật
- Bước 7 (Ghi chú): Lưu thông tin để AI Coach học cho lần tới

## ✅ Phase 16C Checklist

- ✅ SOP 7 bước chuẩn hóa
- ✅ Checklist kỹ thuật (25 items)
- ✅ Troubleshooting guides (4 tình huống)
- ✅ JSON SOP ready for import
- ✅ Import API
- ✅ Troubleshooting API & UI
- ✅ Checklist API
- ✅ Integration với AI Stylist Coach
- ✅ Upsell tinh tế theo Mina
- ✅ Documentation

## 🎉 Kết quả

Sau Phase 16C, salon đã có:
- ✅ SOP Stylist 7 bước chuyên nghiệp
- ✅ Checklist kỹ thuật đầy đủ
- ✅ Form khảo sát tóc chuẩn
- ✅ Lộ trình tư vấn 3 phương án
- ✅ Quy tắc upsell tinh tế
- ✅ Xử lý rủi ro chuyên nghiệp
- ✅ Tích hợp AI Stylist Coach
- ✅ Hệ thống hóa cho AI sử dụng

**Salon anh trở thành salon có SOP Stylist chuyên nghiệp bậc nhất Việt Nam!**

