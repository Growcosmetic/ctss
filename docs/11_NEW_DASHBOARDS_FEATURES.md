# 📊 MÔ TẢ TÍNH NĂNG 11 DASHBOARDS MỚI

## Tổng quan
11 dashboards này được tạo để hiển thị dữ liệu từ các API đã có sẵn, giúp quản lý và theo dõi toàn diện hệ thống salon.

---

## 1. 🎯 CEO Control Tower (`/control-tower`)

### Mục đích
Dashboard tổng quan dành riêng cho CEO, cung cấp cái nhìn toàn diện về hoạt động của toàn bộ hệ thống.

### Tính năng chính:
- **KPI Cards (8 cards):**
  - Doanh thu hôm nay & tháng này
  - Lợi nhuận tháng & biên lợi nhuận
  - Lịch hẹn hôm nay & tổng tháng
  - Đánh giá trung bình khách hàng
  - Tỷ lệ upsale
  - Tỷ lệ khách quay lại
  - Trạng thái nhân viên (tổng/bận/rảnh)

- **Financial Control Panel:**
  - Lợi nhuận gộp/ròng
  - Biên lợi nhuận
  - Dòng tiền (thu/chi/ròng)
  - Chi phí theo danh mục (pie chart)

- **Multi-Branch Performance:**
  - Bảng so sánh hiệu suất các chi nhánh
  - Doanh thu, số lịch hẹn, đánh giá, điểm số
  - Sắp xếp theo điểm số

- **AI Prediction Hub:**
  - Dự báo tài chính
  - Dự đoán khách hàng quay lại

- **Alert Center:**
  - Cảnh báo tài chính (HIGH/CRITICAL)
  - Cảnh báo sản phẩm sắp hết
  - Cảnh báo khách VIP lâu không quay lại

### Phân quyền: Chỉ ADMIN

---

## 2. 💰 Financial Dashboard (`/reports/financial`)

### Mục đích
Báo cáo tài chính chi tiết với phân tích sâu về doanh thu, chi phí, lợi nhuận.

### Tính năng chính:
- **Overview Cards (4 cards):**
  - Tổng doanh thu
  - Lợi nhuận gộp & biên lợi nhuận
  - Lợi nhuận ròng & biên lợi nhuận
  - Tổng chi phí & COGS

- **Cashflow Analysis:**
  - Tổng thu
  - Tổng chi
  - Dòng tiền ròng (có màu xanh/đỏ)

- **Charts:**
  - Xu hướng doanh thu theo ngày (line chart)
  - Chi phí theo danh mục (pie chart)

- **Financial Alerts:**
  - Cảnh báo rủi ro tài chính
  - Gợi ý hành động

- **Date Range Filter:**
  - Chọn khoảng thời gian báo cáo

### Phân quyền: ADMIN, MANAGER

---

## 3. 📢 Marketing Dashboard (`/marketing/dashboard`)

### Mục đích
Tổng quan hiệu suất marketing với metrics, ROI, và phân tích chiến dịch.

### Tính năng chính:
- **KPI Cards (4 cards):**
  - Tổng Leads
  - Tỷ lệ chuyển đổi (conversion rate)
  - Chi phí/Lead (CPL)
  - ROI (Return on Investment)

- **Channel Performance:**
  - Bảng so sánh hiệu suất theo kênh
  - Doanh thu vs Chi phí quảng cáo (bar chart)
  - Conversion rate theo kênh

- **Top Campaigns:**
  - Bảng top 5 chiến dịch hiệu quả nhất
  - ROI, doanh thu, chi phí
  - Màu sắc theo mức độ hiệu quả

- **Active Campaigns:**
  - Danh sách chiến dịch đang chạy

- **Date Range Filter:**
  - Phân tích theo khoảng thời gian

### Phân quyền: ADMIN, MANAGER

---

## 4. ✅ Quality Dashboard (`/quality`)

### Mục đích
Kiểm soát chất lượng dịch vụ, theo dõi compliance và phát hiện lỗi.

### Tính năng chính:
- **Overview Cards (4 cards):**
  - Điểm chất lượng trung bình (0-100)
  - Tổng số dịch vụ đã kiểm tra
  - Số lỗi phát hiện
  - Tỷ lệ đạt chuẩn (compliance rate)

- **Staff Quality Performance:**
  - Bar chart so sánh chất lượng theo nhân viên
  - Điểm trung bình, số dịch vụ, số lỗi

- **Recent Errors:**
  - Danh sách 10 lỗi gần nhất
  - Loại lỗi, mô tả, mức độ nghiêm trọng
  - Thời gian phát hiện
  - Màu sắc theo severity (HIGH/MEDIUM)

- **Audit Results:**
  - Kết quả kiểm tra sau dịch vụ

- **Date Range Filter:**
  - Phân tích theo khoảng thời gian

### Phân quyền: ADMIN, MANAGER

---

## 5. 📞 Voice Dashboard (`/voice`)

### Mục đích
Phân tích cuộc gọi và tương tác qua điện thoại với khách hàng.

### Tính năng chính:
- **Overview Cards (4 cards):**
  - Tổng số cuộc gọi
  - Thời gian trung bình mỗi cuộc gọi
  - Tỷ lệ chuyển đổi (call → booking)
  - Điểm cảm xúc trung bình (sentiment score)

- **Call Statistics:**
  - Bar chart số cuộc gọi theo ngày
  - Xu hướng cuộc gọi

- **Call Analytics:**
  - Phân tích sentiment (tích cực/tiêu cực)
  - Thống kê theo nhân viên
  - Thống kê theo khung giờ

- **Top Agents:**
  - Nhân viên có hiệu suất tốt nhất

### Phân quyền: ADMIN, MANAGER

---

## 6. 👑 Membership Dashboard (`/membership`)

### Mục đích
Quản lý thành viên và chương trình loyalty, theo dõi điểm tích lũy và hạng thành viên.

### Tính năng chính:
- **Overview Cards (4 cards):**
  - Tổng số thành viên
  - Tổng điểm tích lũy
  - Số thành viên VIP
  - Tỷ lệ retention (khách quay lại)

- **Tier Distribution:**
  - Pie chart phân bố hạng thành viên
  - MEMBER, SILVER, GOLD, PLATINUM, DIAMOND
  - Số lượng và tỷ lệ % mỗi hạng

- **Top Members:**
  - Danh sách thành viên có điểm cao nhất
  - Hạng hiện tại, điểm tích lũy

- **Recent Activity:**
  - Hoạt động gần đây (tích điểm, đổi quà)

- **Loyalty Program Stats:**
  - Thống kê chương trình khuyến mãi
  - Hiệu quả các chiến dịch loyalty

### Phân quyền: ADMIN, MANAGER

---

## 7. 💵 Pricing Dashboard (`/pricing`)

### Mục đích
Phân tích giá cả, theo dõi dynamic pricing và tối ưu hóa chiến lược giá.

### Tính năng chính:
- **Overview Cards (4 cards):**
  - Giá trung bình các dịch vụ
  - Số dịch vụ áp dụng dynamic pricing
  - Tỷ lệ tối ưu giá
  - Tác động đến doanh thu (revenue impact %)

- **Price Trends:**
  - Line chart xu hướng giá theo thời gian
  - So sánh giá cố định vs dynamic pricing

- **Dynamic Pricing Analysis:**
  - Dịch vụ đang áp dụng dynamic pricing
  - Hiệu quả của việc điều chỉnh giá

- **Top Services by Price:**
  - Dịch vụ có giá cao nhất/thấp nhất
  - Dịch vụ có biến động giá nhiều nhất

- **Pricing Strategies:**
  - Chiến lược giá theo thời điểm
  - Chiến lược giá theo khách hàng

### Phân quyền: ADMIN, MANAGER

---

## 8. 🎨 Personalization Dashboard (`/personalization`)

### Mục đích
Theo dõi và phân tích việc cá nhân hóa trải nghiệm khách hàng.

### Tính năng chính:
- **Overview Cards (4 cards):**
  - Tổng số cá nhân hóa đã thực hiện
  - Tỷ lệ engagement (tương tác)
  - Conversion rate từ personalization
  - Số segments đang active

- **Personalization Statistics:**
  - Bar chart thống kê theo loại cá nhân hóa
  - Product recommendations
  - Service suggestions
  - Content personalization

- **Top Segments:**
  - Các nhóm khách hàng được cá nhân hóa nhiều nhất
  - Hiệu quả của từng segment

- **Recommendations Performance:**
  - Tỷ lệ chấp nhận gợi ý
  - Doanh thu từ recommendations

### Phân quyền: ADMIN, MANAGER

---

## 9. 🏢 Partner HQ Dashboard (`/partner/hq`)

### Mục đích
Quản lý đối tác, franchise và multi-brand từ trụ sở chính.

### Tính năng chính:
- **Overview Cards (4 cards):**
  - Tổng số đối tác
  - Số đối tác đang hoạt động
  - Tổng doanh thu từ tất cả đối tác
  - Tỷ lệ tăng trưởng

- **Partner Performance:**
  - Bảng so sánh hiệu suất các đối tác
  - Doanh thu, số chi nhánh, điểm đánh giá
  - Sắp xếp theo điểm số

- **Multi-Brand Analysis:**
  - Phân tích theo từng brand
  - So sánh hiệu suất các brand

- **Franchise Management:**
  - Thống kê franchise
  - Compliance và quality scores

- **Revenue by Partner:**
  - Phân bổ doanh thu theo đối tác
  - Top performing partners

### Phân quyền: Chỉ ADMIN (HQ only)

---

## 10. 💆 Hair Health Dashboard (`/hair-health`)

### Mục đích
Phân tích sức khỏe tóc của khách hàng, theo dõi lịch sử và kế hoạch điều trị.

### Tính năng chính:
- **Customer Input:**
  - Nhập Customer ID để xem dữ liệu
  - Tìm kiếm khách hàng

- **Health Score Cards (4 cards):**
  - Điểm tổng thể sức khỏe tóc (0-100)
  - Mức độ hư tổn (damage level)
  - Độ xốp tóc (porosity level)
  - Tình trạng da đầu (scalp condition)

- **Latest Scan Results:**
  - Kết quả scan gần nhất
  - Overall score, recommendations

- **Damage Assessment:**
  - Mức độ hư tổn chi tiết
  - Nguyên nhân hư tổn

- **Porosity & Elasticity:**
  - Phân tích độ xốp và độ đàn hồi
  - Gợi ý sản phẩm phù hợp

- **Chemical History Risk:**
  - Rủi ro từ lịch sử hóa chất
  - Cảnh báo an toàn

- **Treatment Plan:**
  - Kế hoạch điều trị hiện tại
  - Recommendations và next steps

### Phân quyền: ADMIN, MANAGER, STYLIST

---

## 11. 💼 Sales Dashboard (`/sales`)

### Mục đích
Báo cáo bán hàng và upsale, theo dõi hiệu suất bán hàng của nhân viên.

### Tính năng chính:
- **Upsale Stats Cards (4 cards):**
  - Tổng số upsale
  - Tỷ lệ upsale trung bình
  - Tổng giá trị upsale
  - Tổng doanh thu (gốc + upsale)

- **Top Sales Staff:**
  - Bảng top nhân viên bán hàng
  - Số upsale, tổng giá trị, tỷ lệ TB
  - Sắp xếp theo hiệu suất

- **Top Upsale Products:**
  - Sản phẩm/dịch vụ được upsale nhiều nhất
  - Giá trị upsale, số lần

- **Sales Trends:**
  - Xu hướng upsale theo thời gian
  - So sánh theo ngày/tuần/tháng

- **Conversion Metrics:**
  - Tỷ lệ chuyển đổi từ booking → upsale
  - Average upsale amount

- **Date Range Filter:**
  - Phân tích theo khoảng thời gian

### Phân quyền: ADMIN, MANAGER

---

## 📋 Tổng kết

### Nhóm theo chức năng:

**📊 Executive & Financial:**
- CEO Control Tower
- Financial Dashboard

**📈 Marketing & Sales:**
- Marketing Dashboard
- Sales Dashboard

**👥 Customer Management:**
- Membership Dashboard
- Personalization Dashboard

**✅ Quality & Operations:**
- Quality Dashboard
- Voice Dashboard

**💼 Business Management:**
- Pricing Dashboard
- Partner HQ Dashboard

**💆 Service Enhancement:**
- Hair Health Dashboard

### Đặc điểm chung:
- ✅ Real-time data từ API
- ✅ Role-based access control
- ✅ Responsive design
- ✅ Charts & visualizations
- ✅ Date range filters (nếu cần)
- ✅ Error handling & loading states
- ✅ Refresh functionality

---

*Tài liệu này mô tả chi tiết 11 dashboards mới được tạo để bổ sung cho hệ thống CTSS.*
