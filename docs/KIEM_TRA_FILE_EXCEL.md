# 🔍 Kiểm Tra File Excel Trước Khi Import

## ❌ Vấn Đề: "Không tìm thấy dữ liệu khách hàng hợp lệ"

Nếu bạn gặp lỗi này, có thể file Excel không đúng format hoặc thiếu dữ liệu bắt buộc.

---

## ✅ Format File Excel Đúng

### Các Cột Bắt Buộc:

| Cột | Tên Cột (Tiếng Anh) | Tên Cột (Tiếng Việt) | Ví Dụ |
|-----|---------------------|----------------------|-------|
| **1** | `full name` | `Họ và tên` | Nguyễn Văn A |
| **2** | `mobile` | `Số điện thoại` | 0901234567 |

### Các Cột Tùy Chọn:

| Cột | Tên Cột | Ví Dụ |
|-----|---------|-------|
| `email` | Email | nguyenvana@example.com |
| `gender` | Giới tính | Nam / Nữ |
| `card_code dob` | Sinh nhật | 28/3 hoặc 13/2/25 |
| `address` | Địa chỉ | 123 Đường ABC |
| `city_name district_na` | Tỉnh/Thành Quận/Huyện | TP Hồ Chí Minh Quận 1 |
| `tag_name` | Nhóm | VIP, FACEBOOK |
| `rank` | Xếp hạng | Thường, VIP |
| `total_paid_amount` | Tổng tiền chi tiêu | 17.525.000 |

---

## 🔍 Cách Kiểm Tra File Excel

### Bước 1: Mở File Excel

1. Mở file Excel của bạn
2. Kiểm tra **dòng đầu tiên** (header row):
   - Phải có cột **"full name"** hoặc **"Họ và tên"**
   - Phải có cột **"mobile"** hoặc **"Số điện thoại"**

### Bước 2: Kiểm Tra Dữ Liệu

1. Xem **dòng thứ 2 trở đi** (data rows):
   - Mỗi dòng phải có **tên** (không được trống)
   - Mỗi dòng phải có **số điện thoại** (không được trống)

### Bước 3: Kiểm Tra Format

✅ **Đúng:**
```
| full name        | mobile      | email              |
|------------------|-------------|---------------------|
| Nguyễn Văn A     | 0901234567  | a@example.com       |
| Trần Thị B       | 0907654321  | b@example.com       |
```

❌ **Sai:**
```
| Column1 | Column2 | Column3 |
|---------|---------|---------|
| 1       | L       | 1       |
| 2       | M       | 2       |
```
→ File này không có cột "full name" và "mobile"

---

## 🛠️ Cách Sửa File Excel

### Nếu File Không Đúng Format:

1. **Tạo file mới** hoặc **sửa file hiện tại**
2. **Dòng 1 (Header):** Đặt tên cột:
   - Cột A: `full name` hoặc `Họ và tên`
   - Cột B: `mobile` hoặc `Số điện thoại`
   - Các cột khác: `email`, `gender`, `address`, etc.
3. **Dòng 2 trở đi:** Nhập dữ liệu khách hàng
4. **Lưu file** dưới dạng `.xlsx`

### Ví Dụ File Đúng:

```
| full name        | mobile      | email              | gender | address           |
|------------------|-------------|---------------------|--------|-------------------|
| Nguyễn Văn A     | 0901234567  | a@example.com       | Nam    | 123 Đường ABC     |
| Trần Thị B       | 0907654321  | b@example.com       | Nữ     | 456 Đường XYZ     |
```

---

## 💡 Debug Với Console

### Cách Xem Log Chi Tiết:

1. **Mở Console:**
   - Windows/Linux: `F12`
   - Mac: `Cmd + Option + I`
2. **Chọn tab "Console"**
3. **Upload file Excel** và click "Nhập dữ liệu"
4. **Xem logs:**
   - `Total rows:` - Số dòng đọc được
   - `All column names:` - Tên các cột trong file
   - `First row:` - Dữ liệu dòng đầu tiên
   - `Processing row:` - Xử lý từng dòng

### Ví Dụ Log:

```
Total rows: 10
All column names: ["Column1", "Column2", "Column3"]
First row: {Column1: "1", Column2: "L", Column3: "1"}
Processing row: {fullName: "", phone: "", hasName: false, hasPhone: false}
```

→ **Vấn đề:** File không có cột "full name" và "mobile"

---

## 🎯 Checklist Trước Khi Import

- [ ] File có dòng header (dòng đầu tiên)
- [ ] Header có cột "full name" hoặc "Họ và tên"
- [ ] Header có cột "mobile" hoặc "Số điện thoại"
- [ ] Mỗi dòng dữ liệu có tên (không trống)
- [ ] Mỗi dòng dữ liệu có số điện thoại (không trống)
- [ ] File được lưu dưới dạng `.xlsx` hoặc `.xls`

---

## 📥 Tải File Mẫu

1. Mở modal "Nhập từ tệp excel"
2. Click **"Tải mẫu"**
3. File mẫu sẽ được tải về với format đúng
4. Mở file mẫu và copy format vào file của bạn

---

## ❓ FAQ

### Q: File của tôi có nhiều sheet, import sheet nào?
**A:** Hệ thống sẽ import **sheet đầu tiên** (sheet đầu tiên trong file)

### Q: File của tôi không có header row?
**A:** Hệ thống sẽ tự động detect. Nếu không có header, sẽ dùng dòng đầu tiên làm header.

### Q: Tên cột có thể viết hoa/thường không?
**A:** Có! Hệ thống hỗ trợ case-insensitive:
- `full name` = `Full Name` = `FULL NAME`
- `mobile` = `Mobile` = `MOBILE`

### Q: Có thể import file CSV không?
**A:** Hiện tại chỉ hỗ trợ `.xlsx` và `.xls`. Nếu có file CSV, mở bằng Excel và lưu lại dưới dạng `.xlsx`.

---

**📅 Cập nhật:** 2024-12-10
**✍️ Tác giả:** AI Assistant

