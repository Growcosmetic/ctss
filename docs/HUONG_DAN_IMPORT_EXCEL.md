# 📊 Hướng Dẫn Import Excel Khách Hàng

## 📋 Format File Excel Được Hỗ Trợ

Hệ thống hỗ trợ import file Excel với các cột sau (theo format mẫu):

### Các Cột Bắt Buộc:
- **`full name`** hoặc **`Họ và tên`** - Tên khách hàng
- **`mobile`** hoặc **`Số điện thoại`** - Số điện thoại

### Các Cột Tùy Chọn:

| Cột Excel | Tên Tiếng Việt | Mô tả |
|-----------|----------------|-------|
| `code` | Mã khách hàng | Mã định danh khách hàng |
| `email` | Email | Email khách hàng |
| `gender` | Giới tính | Nam/Nữ hoặc MALE/FEMALE |
| `card_code dob` | Sinh nhật | Format: DD/MM hoặc DD/MM/YY |
| `loyalty_point` | Điểm thưởng | Số điểm tích lũy |
| `tag_name` | Nhóm | Tên nhóm khách hàng |
| `address` | Địa chỉ | Địa chỉ chi tiết |
| `city_name district_na` | Tỉnh/Thành Quận/Huyện | Format: "TP Hồ Chí Minh Quận 1" |
| `country_o` | Quốc gia | Mã quốc gia (VD: VN) |
| `rank` | Xếp hạng | Hạng khách hàng (VD: Thường, VIP) |
| `refer_sour` | Nguồn giới thiệu | Nguồn khách hàng biết đến |
| `note` | Ghi chú | Ghi chú về khách hàng |
| `location` | Chi nhánh | Tên chi nhánh |
| `total_paid_amount` | Tổng tiền chi tiêu | Số tiền đã chi (có dấu chấm phân cách) |
| `createdAt` | Ngày tạo | Ngày tạo khách hàng |
| `last_visited` | Lần cuối đến | Ngày đến gần nhất |

---

## 🚀 Cách Sử Dụng

### Bước 1: Chuẩn bị file Excel

1. Mở file Excel của bạn
2. Đảm bảo có các cột:
   - **`full name`** hoặc **`Họ và tên`** (bắt buộc)
   - **`mobile`** hoặc **`Số điện thoại`** (bắt buộc)
   - Các cột khác tùy chọn

### Bước 2: Upload file

1. Mở CRM: `http://localhost:3000/crm`
2. Click button **"Nhập từ tệp excel"** ở header
3. Modal sẽ mở ra
4. Click **"Tải mẫu"** để xem format mẫu (nếu cần)
5. Click **"Chọn tệp dữ liệu khách hàng"** hoặc kéo thả file vào
6. Chọn file Excel (.xlsx hoặc .xls)

### Bước 3: Cấu hình import

1. **Nhóm khách hàng** (tùy chọn):
   - Nhập tên nhóm nếu muốn gán tất cả khách hàng vào một nhóm
   - Nếu để trống, sẽ dùng `tag_name` từ Excel

2. **Ghi đè dữ liệu** (tùy chọn):
   - Check nếu muốn cập nhật khách hàng đã tồn tại
   - Bỏ check nếu chỉ muốn tạo mới

### Bước 4: Import

1. Click **"Nhập dữ liệu"**
2. Đợi hệ thống xử lý
3. Xem kết quả:
   - Số khách hàng mới được tạo
   - Số khách hàng được cập nhật
   - Số khách hàng bị bỏ qua

---

## 📝 Format Dữ Liệu Chi Tiết

### 1. Tên khách hàng (`full name`)

- Có thể có prefix: `- Nguyễn Thị Minh` hoặc `.LUÂN`
- Hệ thống tự động loại bỏ prefix
- Tự động tách thành firstName và lastName

**Ví dụ:**
- `- Nguyễn Thị Minh` → Name: "Nguyễn Thị Minh"
- `.LUÂN` → Name: "LUÂN"

### 2. Số điện thoại (`mobile`)

- Format: 10 số (VD: `0903028440`)
- Hệ thống tự động loại bỏ ký tự không phải số

**Ví dụ:**
- `0903028440` → `0903028440`
- `0903028440 (bar` → `0903028440`

### 3. Ngày sinh (`card_code dob`)

- Format: `DD/MM` hoặc `DD/MM/YY` hoặc `DD/MM/YYYY`
- Hệ thống tự động parse

**Ví dụ:**
- `28/3` → `2000-03-28` (dùng năm mặc định)
- `13/2/25` → `2025-02-13`
- `15/10/21` → `2021-10-15`

### 4. Giới tính (`gender`)

- **Nam** hoặc **MALE** → `MALE`
- **Nữ** hoặc **FEMALE** → `FEMALE`
- Khác → `null`

### 5. Tỉnh/Thành Quận/Huyện (`city_name district_na`)

- Format: `"TP Hồ Chí Minh Quận 1"`
- Hệ thống tự động tách:
  - Province: `TP Hồ Chí Minh`
  - City: `Quận 1`

### 6. Tổng tiền chi tiêu (`total_paid_amount`)

- Format: Có dấu chấm phân cách hàng nghìn
- Hệ thống tự động loại bỏ dấu chấm

**Ví dụ:**
- `17.525.000` → `17525000`
- `350.000` → `350000`
- `0` → `0`

### 7. Điểm thưởng (`loyalty_point`)

- Số nguyên
- Tự động tạo CustomerLoyalty record nếu > 0

---

## ⚠️ Lưu Ý

### Xử lý trùng lặp:

- **Nếu không check "Ghi đè"**:
  - Khách hàng đã tồn tại (theo số điện thoại) → Bỏ qua
  - Khách hàng mới → Tạo mới

- **Nếu check "Ghi đè"**:
  - Khách hàng đã tồn tại → Cập nhật thông tin
  - Khách hàng mới → Tạo mới

### Validation:

- Khách hàng **thiếu tên hoặc số điện thoại** → Bỏ qua
- Số điện thoại **không hợp lệ** → Bỏ qua
- Các trường khác → Tự động xử lý hoặc để null

---

## 🔍 Troubleshooting

### Lỗi: "File không có dữ liệu"
- Kiểm tra file Excel có dữ liệu không
- Đảm bảo sheet đầu tiên có dữ liệu

### Lỗi: "Không tìm thấy dữ liệu khách hàng hợp lệ"
- Kiểm tra có cột `full name` hoặc `mobile` không
- Kiểm tra dữ liệu có đầy đủ tên và số điện thoại không

### Import thành công nhưng không thấy khách hàng
- Refresh trang CRM
- Kiểm tra filter/search có đang áp dụng không
- Kiểm tra console browser có lỗi không

---

## 📊 Ví Dụ File Excel

| code | full name | mobile | email | gender | card_code dob | loyalty_point | tag_name | address | city_name district_na | total_paid_amount |
|------|-----------|--------|-------|--------|---------------|---------------|----------|---------|----------------------|-------------------|
| CS100767 | Nguyễn Thị Minh | 0903028440 | | Nữ | 28/3 | 0 | FACEBOOK | 123 Đường ABC | TP Hồ Chí Minh Quận 1 | 0 |
| CS114804 | Trần Văn A | 0888808976 | a@example.com | Nam | 10/8 | 100 | VIP | 456 Đường XYZ | TP Hồ Chí Minh Quận 2 | 17.525.000 |

---

**📅 Cập nhật:** 2024-12-10
**✍️ Tác giả:** AI Assistant

