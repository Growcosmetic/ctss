# Phase 16E - SOP CSKH Online

Hệ thống SOP chuẩn hóa cho bộ phận CSKH Online (Zalo, Instagram, Facebook) - Chí Tâm Hair Salon.

## 🎯 Mục tiêu

Tạo SOP đầy đủ 7 bước cho CSKH Online:
- Chuẩn hóa quy trình tư vấn online
- Script nhắn tin cho 10 tình huống
- Tích hợp AI hỗ trợ
- Tự động hóa follow-up
- Tăng tỷ lệ chốt đặt lịch

## 📋 SOP 7 Bước CSKH Online

### Bước 1: Chào khách & Nhận nhiệm vụ
- Trả lời tin nhắn trong 1 phút
- Tone Mina chuẩn
- Chủ động hỏi nhu cầu

### Bước 2: Xác định nhu cầu & Lấy thông tin
- Hỏi tình trạng tóc
- Hỏi lần làm gần nhất
- Hỏi độ hư tổn
- Xin hình tóc (mục tiêu: 80%)

### Bước 3: Gửi ảnh cho AI (Mina / AI Stylist Coach)
- Lưu ảnh vào hệ thống
- Gửi AI phân tích
- Nhận kết quả phân tích
- Sử dụng kết quả để tư vấn

### Bước 4: Chuyển tư vấn cho Stylist (Khi cần)
- Xác định ca phức tạp
- Thông báo cho khách
- Gửi thông tin cho stylist
- Theo dõi phản hồi

### Bước 5: Gợi ý dịch vụ (Dựa trên SOP Mina)
- Phân tích kết quả AI
- Đưa ra 2-3 option
- Giải thích từng option
- Không push, không ép

### Bước 6: Báo giá & Chốt lịch
- Hỏi câu Mina trước khi báo giá
- Hỏi ngày – giờ
- Chọn stylist
- Xác nhận thông tin
- Gửi mã booking

### Bước 7: Follow-up trước & sau dịch vụ
- Nhắc lịch trước 12h
- Follow-up 24h sau làm tóc
- Hỏi feedback
- Giải quyết vấn đề

## 🗂️ Files Structure

```
core/
├── data/
│   ├── onlineCSOPS.json          # Full 7-step SOP JSON
│   ├── onlineCSChecklist.json    # CS checklist
│   └── onlineCSScripts.json      # 10 messaging scripts
└── prompts/
    └── sopSupportPrompt.ts       # AI support (reused)

app/
├── api/
│   ├── sop/
│   │   └── import-online-cs/
│   │       └── route.ts         # Import online CS SOPs
│   └── online-cs/
│       ├── checklist/
│       │   └── route.ts         # Get checklist
│       ├── scripts/
│       │   └── route.ts         # Get messaging scripts
│       └── ai-assist/
│           └── route.ts         # AI hỗ trợ CSKH
└── (dashboard)/
    └── sop/
        └── online-cs/
            └── page.tsx         # Scripts UI
```

## 🚀 API Endpoints

### Import Online CS SOPs

```
POST /api/sop/import-online-cs
{
  "overwrite": false
}
```

### Get Messaging Scripts

```
GET /api/online-cs/scripts
GET /api/online-cs/scripts?platform=zalo
GET /api/online-cs/scripts?situation=giá
GET /api/online-cs/scripts?id=customer_asks_price
```

### AI Assist

```
POST /api/online-cs/ai-assist
{
  "action": "analyze_hair_photo" | "generate_reply" | "suggest_service" | "handle_objection",
  "customerMessage": "Tin nhắn khách",
  "customerInfo": {...},
  "hairPhotoUrl": "URL ảnh tóc",
  "context": "Ngữ cảnh"
}
```

**Actions:**
- `analyze_hair_photo`: Phân tích ảnh tóc
- `generate_reply`: Tạo phản hồi tự động
- `suggest_service`: Gợi ý dịch vụ
- `handle_objection`: Xử lý phản đối

## 📝 Messaging Scripts

10 tình huống được hỗ trợ:

1. **Khách muốn làm uốn**
2. **Khách hỏi giá**
3. **Khách muốn tư vấn kiểu**
4. **Khách gửi ảnh**
5. **Khách muốn stylist nhất định**
6. **Khách chê giá cao**
7. **Khách lâu không trả lời**
8. **Khách muốn hoàn tiền (hiếm)**
9. **Khách hỏi 'làm xong có đẹp không?'**
10. **Khách muốn ưu đãi**

## 🔧 Checklist Categories

- **response**: Trả lời tin nhắn
- **greeting**: Chào khách
- **information**: Thu thập thông tin
- **ai**: Phân tích AI
- **escalation**: Chuyển cho stylist
- **consultation**: Tư vấn
- **pricing**: Báo giá
- **booking**: Đặt lịch
- **followup**: Follow-up

## ✅ Phase 16E Checklist

- ✅ SOP 7 bước chuẩn hóa
- ✅ Checklist CSKH Online (24 items)
- ✅ 10 messaging scripts
- ✅ JSON SOP ready for import
- ✅ Import API
- ✅ Scripts API
- ✅ AI Assist API (4 actions)
- ✅ UI cho scripts
- ✅ Documentation

## 🎉 Kết quả

Sau Phase 16E, salon đã có:
- ✅ SOP CSKH Online chuyên nghiệp
- ✅ Checklist đầy đủ
- ✅ 10 scripts nhắn tin chuẩn Mina
- ✅ Tích hợp AI toàn bộ
- ✅ Tự động hóa follow-up
- ✅ Chuẩn Zalo – IG – Facebook

**Không salon nào có hệ thống online pro như thế này!**

## 📊 Mục tiêu KPIs

- ⚡ **Trả lời trong 1 phút**: 100%
- 📸 **Lấy được hình tóc**: 80% khách inbox
- 📅 **Chuyển thành đặt lịch**: 60% khách hỏi
- 💬 **Follow-up sau dịch vụ**: 100% khách

