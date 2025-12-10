# 🏷️ Hướng Dẫn Tags Tự Động

## ❓ Câu Hỏi: Tags tự động gắn hay phải gắn thủ công?

### ✅ Trả Lời: **TỰ ĐỘNG HOÀN TOÀN**

Tags được hệ thống **tự động gắn** dựa trên dữ liệu khách hàng. Bạn **KHÔNG CẦN** gắn thủ công.

---

## 🔄 Cách Tags Tự Động Hoạt Động

### 1. **Khi nào Tags được tạo?**

Tags được tạo tự động khi:
- ✅ Khách hàng có **lịch sử dịch vụ** (visits, orders)
- ✅ Bạn click button **"Tạo Tags"** hoặc **"Làm mới Tags"**
- ✅ Hệ thống phân tích dữ liệu và tạo tags phù hợp

### 2. **Tags dựa trên gì?**

Hệ thống phân tích:

| Dữ liệu | Tags được tạo |
|---------|---------------|
| **Tổng chi tiêu > 20 triệu** | VIP |
| **Chi tiêu 6 tháng > 8 triệu** | VIP |
| **Chi tiêu 8-20 triệu** | High Value |
| **Đến trong 30 ngày** | Active |
| **Đến trong 60 ngày** | Warm |
| **Đến trong 90 ngày** | Cold |
| **Quá 90 ngày không đến** | Overdue |
| **Quá 180 ngày không đến** | Lost |
| **Uốn tóc ≥ 2 lần** | Hay uốn |
| **Nhuộm tóc ≥ 2 lần** | Hay nhuộm |
| **Stylist yêu thích ≥ 2 lần** | Preferred: [Tên] |
| **Tóc có hư tổn** | Risky Hair |

### 3. **Quy trình tự động**

```
Khách hàng sử dụng dịch vụ
    ↓
Dữ liệu được lưu vào database (visits, orders)
    ↓
Click "Tạo Tags" hoặc "Làm mới Tags"
    ↓
Hệ thống tự động:
  - Đọc lịch sử dịch vụ
  - Phân tích hành vi
  - Tính toán tags phù hợp
  - Lưu tags vào database
    ↓
Tags hiển thị trong Profile Card
```

---

## 📝 Ví Dụ Thực Tế

### Khách hàng: Nguyễn Văn A

**Lịch sử dịch vụ:**
- 15/11/2024: Uốn tóc - 500,000đ
- 20/11/2024: Nhuộm tóc - 800,000đ
- 25/11/2024: Cắt tóc - 200,000đ
- Tổng chi tiêu: 1,500,000đ
- Stylist: Minh (3 lần)

**Sau khi click "Tạo Tags":**
- ✅ `[Returning Customer]` - Vì có ≥ 2 lần đến
- ✅ `[Hay uốn]` - Vì có 1 lần uốn (cần ≥ 2)
- ✅ `[Hay nhuộm]` - Vì có 1 lần nhuộm (cần ≥ 2)
- ✅ `[Preferred: Minh]` - Vì stylist Minh ≥ 2 lần
- ❌ Không có VIP (chưa đủ 20 triệu)

**Sau 6 tháng, tổng chi tiêu > 20 triệu:**
- Click "Làm mới Tags"
- ✅ Thêm tag `[VIP]`
- ✅ Thêm tag `[Active]` nếu đến trong 30 ngày

---

## 🎯 Khi Nào Cần Click "Tạo Tags"?

### ✅ Nên click khi:
1. **Khách hàng mới** có đủ dữ liệu (visits, orders)
2. **Muốn cập nhật tags** sau khi khách có thêm dịch vụ
3. **Tags không chính xác** và muốn refresh

### ❌ Không cần click khi:
- Khách hàng chưa có dữ liệu dịch vụ
- Tags đã đúng và mới được tạo gần đây

---

## 🔍 Kiểm Tra Tags

### Cách xem tags:
1. Chọn khách hàng trong CRM
2. Xem phần **Profile Card** (panel giữa)
3. Tags hiển thị ngay dưới phần "Hạng"

### Nếu không thấy tags:
1. Kiểm tra khách hàng có dữ liệu visits/orders chưa
2. Click button **"Tạo Tags"** để tạo tags tự động
3. Tags sẽ xuất hiện sau vài giây

---

## 💡 Lưu Ý Quan Trọng

### ⚠️ Tags KHÔNG tự động cập nhật
- Tags chỉ được tạo khi bạn click "Tạo Tags" hoặc "Làm mới Tags"
- Nếu khách hàng có thêm dịch vụ mới, cần click "Làm mới Tags" để cập nhật

### ✅ Tags tự động tính toán
- Bạn không cần chọn tags thủ công
- Hệ thống tự động phân tích và gán tags phù hợp

### 🔄 Segmentation tự động từ Tags
- Sau khi có tags, segmentation sẽ tự động được tính
- Không cần làm gì thêm

---

## 📊 Bảng Tags Phổ Biến

| Tag | Điều kiện | Category |
|-----|-----------|----------|
| VIP | Tổng chi tiêu > 20 triệu | behavior |
| High Value | Tổng chi tiêu 8-20 triệu | behavior |
| Active | Đến trong 30 ngày | frequency |
| Warm | Đến trong 60 ngày | frequency |
| Cold | Đến trong 90 ngày | frequency |
| Overdue | Quá 90 ngày không đến | frequency |
| Lost | Quá 180 ngày không đến | frequency |
| Hay uốn | Uốn tóc ≥ 2 lần | service |
| Hay nhuộm | Nhuộm tóc ≥ 2 lần | service |
| Preferred: [Tên] | Stylist ≥ 2 lần | stylist |
| Risky Hair | Tóc có hư tổn | technical |

---

**📅 Cập nhật:** 2024-12-10
**✍️ Tác giả:** AI Assistant

