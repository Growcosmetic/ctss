# 📖 Hướng Dẫn Tags và Segmentation

## 🏷️ CUSTOMER TAGS (Thẻ Khách Hàng)

### Tags là gì?

**Tags** là các nhãn tự động được gán cho khách hàng dựa trên:
- **Hành vi mua hàng** (VIP, Active, Warm, Cold)
- **Tần suất sử dụng dịch vụ** (Hay uốn, Hay nhuộm)
- **Lịch sử dịch vụ** (Risky Hair, High-Damage History)
- **Stylist yêu thích** (Preferred: [Tên stylist])
- **Trạng thái** (Overdue, Lost, High Value)

### Tại sao "Chưa có tags"?

Tags được **tự động tạo** dựa trên dữ liệu khách hàng. Nếu thấy "Chưa có tags" có nghĩa là:

1. **Khách hàng mới** - Chưa có đủ dữ liệu để tạo tags
2. **Chưa có lịch sử dịch vụ** - Chưa có visits/orders
3. **Chưa được refresh** - Tags chưa được tạo tự động

### Cách tạo Tags

#### Cách 1: Tự động (Khuyến nghị)
1. Chọn khách hàng trong CRM
2. Scroll xuống phần Action Buttons
3. Click button **"Tạo Tags"** hoặc **"Làm mới Tags"**
4. Hệ thống sẽ tự động:
   - Phân tích lịch sử dịch vụ
   - Phân tích hành vi mua hàng
   - Tạo tags phù hợp
   - Hiển thị tags trong Profile Card

#### Cách 2: Thủ công (Nếu cần)
- Tags sẽ tự động được tạo khi khách hàng có:
  - Lịch sử đặt lịch
  - Lịch sử mua hàng
  - Dữ liệu visits

### Các loại Tags phổ biến

| Loại Tag | Ý nghĩa | Khi nào xuất hiện |
|----------|---------|-------------------|
| **VIP** | Khách hàng VIP | Tổng chi tiêu cao hoặc số lần đến nhiều |
| **Active** | Khách hàng tích cực | Đến thường xuyên trong 3 tháng gần nhất |
| **Warm** | Khách hàng ấm | Đã đến nhưng không thường xuyên |
| **Cold** | Khách hàng lạnh | Lâu không đến |
| **Hay uốn** | Thích dịch vụ uốn | Có nhiều lịch sử uốn tóc |
| **Hay nhuộm** | Thích dịch vụ nhuộm | Có nhiều lịch sử nhuộm tóc |
| **Risky Hair** | Tóc có vấn đề | Có lịch sử tóc bị hư tổn |
| **Overdue** | Quá hạn | Đã quá thời gian dự kiến quay lại |
| **Lost** | Mất khách | Không đến trong thời gian dài |
| **High Value** | Giá trị cao | Chi tiêu nhiều |

### Ví dụ Tags

```
[VIP] [Active] [Hay uốn] [Preferred: Minh]
```

---

## 🎯 SEGMENTATION (Phân Nhóm Khách Hàng)

### Segmentation là gì?

**Segmentation** là cách phân loại khách hàng thành các nhóm (segments) dựa trên:
- Tags của khách hàng
- Hành vi mua hàng
- Giá trị khách hàng
- Trạng thái tương tác

### Các Segments

| Segment | Tên | Mô tả | Tags liên quan |
|---------|-----|-------|----------------|
| **A** | VIP High Value | Khách VIP có giá trị cao | VIP + High Value hoặc Active |
| **B** | Ready-to-Return | Sẵn sàng quay lại | Warm, Cold, hoặc Active |
| **C** | Overdue | Quá hạn quay lại | Overdue |
| **D** | Lost | Mất khách | Lost |
| **E** | High Risk | Rủi ro cao | Risky Hair, High-Damage History |
| **F** | Color Lovers | Yêu thích nhuộm | Tags có "màu" hoặc "nhuộm" |
| **G** | Curl Lovers | Yêu thích uốn | "Hay uốn" |

### Cách sử dụng Segmentation Filter

1. **Mở CRM**: `http://localhost:3000/crm`
2. **Panel bên trái** → Tìm dropdown **"Tất cả segments"**
3. **Chọn segment** từ dropdown:
   - **Tất cả segments** - Xem tất cả khách hàng
   - **Segment A** - Chỉ xem VIP High Value
   - **Segment B** - Chỉ xem Ready-to-Return
   - **Segment C** - Chỉ xem Overdue
   - **Segment D** - Chỉ xem Lost
   - **Segment E** - Chỉ xem High Risk
   - **Segment F** - Chỉ xem Color Lovers
   - **Segment G** - Chỉ xem Curl Lovers
4. **Danh sách khách hàng** sẽ tự động filter theo segment đã chọn

### Ví dụ sử dụng

#### Tìm khách VIP:
1. Chọn **"Segment A - VIP High Value"**
2. Danh sách chỉ hiển thị khách VIP có giá trị cao

#### Tìm khách cần follow-up:
1. Chọn **"Segment C - Overdue"**
2. Danh sách chỉ hiển thị khách quá hạn quay lại

#### Tìm khách yêu thích nhuộm:
1. Chọn **"Segment F - Color Lovers"**
2. Danh sách chỉ hiển thị khách có tags liên quan đến nhuộm

---

## 🔗 Mối Quan Hệ Tags ↔ Segmentation

### Tags → Segmentation

Segmentation được **tự động tính toán** dựa trên Tags:

```
Tags của khách hàng → Hệ thống phân tích → Gán vào Segment phù hợp
```

**Ví dụ:**
- Khách có tags: `[VIP] [Active] [High Value]` → **Segment A**
- Khách có tags: `[Hay uốn]` → **Segment G**
- Khách có tags: `[Overdue]` → **Segment C**

### Quy trình hoàn chỉnh

```
1. Khách hàng có dữ liệu (visits, orders)
   ↓
2. Click "Tạo Tags" → Hệ thống tạo tags tự động
   ↓
3. Tags được gán cho khách hàng
   ↓
4. Hệ thống tự động phân loại vào Segment
   ↓
5. Có thể filter theo Segment trong dropdown
```

---

## 💡 Best Practices

### Khi nào nên tạo Tags?
- ✅ Khi khách hàng mới có đủ dữ liệu (visits, orders)
- ✅ Khi muốn cập nhật tags mới nhất
- ✅ Khi khách hàng có thay đổi hành vi

### Khi nào nên dùng Segmentation?
- ✅ Tìm khách VIP để ưu tiên chăm sóc
- ✅ Tìm khách cần follow-up (Overdue)
- ✅ Tìm khách theo sở thích (Color/Curl Lovers)
- ✅ Phân tích nhóm khách hàng để marketing

---

## 🚨 Troubleshooting

### Tags không hiển thị sau khi click "Tạo Tags"?
- Kiểm tra khách hàng có dữ liệu visits/orders chưa
- Kiểm tra console browser có lỗi không
- Thử refresh trang và click lại

### Segmentation không filter đúng?
- Đảm bảo khách hàng đã có tags
- Tags phải khớp với logic của segment
- Thử refresh trang

### Không thấy segment nào trong dropdown?
- Dropdown luôn có sẵn các segments
- Nếu không thấy, kiểm tra code đã deploy chưa

---

## 📊 Ví dụ thực tế

### Khách hàng: Nguyễn Văn A
- **Tags**: `[VIP] [Active] [Hay uốn] [Preferred: Minh]`
- **Segment**: **A** (VIP High Value) hoặc **G** (Curl Lovers)
- **Hành động**: Ưu tiên chăm sóc, gửi khuyến mãi uốn tóc

### Khách hàng: Trần Thị B
- **Tags**: `[Warm] [Hay nhuộm]`
- **Segment**: **B** (Ready-to-Return) hoặc **F** (Color Lovers)
- **Hành động**: Follow-up, gửi khuyến mãi nhuộm tóc

### Khách hàng: Lê Văn C
- **Tags**: `[Overdue]`
- **Segment**: **C** (Overdue)
- **Hành động**: Gọi điện follow-up, tìm hiểu lý do không quay lại

---

**📅 Cập nhật:** 2024-12-10
**✍️ Tác giả:** AI Assistant

