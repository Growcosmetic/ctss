# 📖 Hướng Dẫn Xem Các Tính Năng CRM Đã Tích Hợp

## 🎯 Tổng Quan

Các tính năng CRM đã được tích hợp vào UI. Dưới đây là hướng dẫn chi tiết cách xem từng tính năng.

---

## 1. ✅ Customer 360 View (Xem 360°)

### Vị trí:
- **Trong CustomerDetailPanel** (Panel giữa - Chi tiết khách hàng)

### Cách xem:
1. **Chọn một khách hàng** từ danh sách bên trái
2. Scroll xuống phần **"Action Buttons"** ở cuối panel
3. Click button **"Xem 360°"** (màu gradient xanh-tím)
4. Một drawer sẽ mở ra bên phải hiển thị:
   - Customer Journey Tracking
   - AI Insights (Churn Risk, Next Service, Promotion Suggestions)
   - Customer Statistics
   - Recent Activity

### Ảnh minh họa:
```
[Customer Detail Panel]
  └─ [Action Buttons]
      └─ [Xem 360°] ← Click vào đây
          └─ [Customer360Drawer mở ra]
```

---

## 2. ✅ Customer Tags (Thẻ khách hàng)

### Vị trí:
- **Trong CustomerDetailPanel** (Panel giữa)
- Hiển thị ngay trong **Profile Card** (phần đầu)

### Cách xem:
1. **Chọn một khách hàng** từ danh sách bên trái
2. Tags sẽ **tự động hiển thị** ngay dưới phần "Hạng" (Rank)
3. Tags hiển thị dạng badge màu tím với icon Tag
4. Nếu có > 5 tags, sẽ hiển thị "+N" tags còn lại

### Các loại tags tự động:
- VIP, Active, Risky Hair
- Hay uốn, Hay nhuộm
- High Value, Warm, Cold
- Overdue, Lost, etc.

### Làm mới tags:
- Click button **"Làm mới Tags"** trong Action Buttons để refresh tags từ API

### Ảnh minh họa:
```
[Profile Card]
  └─ [Hạng: VIP]
  └─ [Tags: VIP] [Tags: Active] [Tags: Hay uốn] ← Hiển thị ở đây
  └─ [Nhóm khách hàng]
```

---

## 3. ✅ Reminders (Nhắc nhở)

### Vị trí:
- **Trong CustomerActivityPanel** (Panel bên phải)
- Tab **"Hoạt động"** (Activity Tab)

### Cách xem:
1. **Chọn một khách hàng** từ danh sách bên trái
2. Panel bên phải sẽ hiển thị tab **"Hoạt động"**
3. Scroll xuống phần **"Nhắc nhở chưa thực hiện"**
4. Click để mở rộng section
5. Xem danh sách reminders với:
   - Màu sắc theo priority (HIGH=đỏ, MEDIUM=vàng, LOW=xanh)
   - Message của reminder
   - Due date (ngày đến hạn)

### Ảnh minh họa:
```
[Customer Activity Panel]
  └─ [Tab: Hoạt động]
      └─ [Nhắc nhở chưa thực hiện (N)] ← Click để mở
          └─ [Reminder 1] [Reminder 2] ... ← Hiển thị ở đây
```

---

## 4. ✅ Segmentation Filter (Lọc theo Segment)

### Vị trí:
- **Trong CustomerListPanel** (Panel bên trái)
- Ngay dưới phần Search và Filter buttons

### Cách xem:
1. Mở trang CRM (`/crm`)
2. Panel bên trái có dropdown **"Tất cả segments"**
3. Click dropdown để chọn segment:
   - **Segment A** - VIP High Value
   - **Segment B** - Ready-to-Return
   - **Segment C** - Overdue
   - **Segment D** - Lost
   - **Segment E** - High Risk
   - **Segment F** - Color Lovers
   - **Segment G** - Curl Lovers
4. Danh sách khách hàng sẽ tự động filter theo segment đã chọn

### Ảnh minh họa:
```
[Customer List Panel]
  └─ [Search Input]
  └─ [Filter Buttons]
  └─ [Dropdown: Tất cả segments] ← Click vào đây
      └─ [Segment A] [Segment B] ... ← Chọn segment
```

---

## 5. ✅ Customer Insights (AI) - Tích hợp trong 360 View

### Vị trí:
- **Trong Customer360View** (mở từ button "Xem 360°")

### Cách xem:
1. Mở **Customer 360 View** (xem hướng dẫn #1)
2. AI Insights sẽ hiển thị trong các section:
   - **Churn Risk Prediction** - Dự đoán khả năng rời bỏ
   - **Next Best Action** - Hành động tiếp theo đề xuất
   - **Service Recommendations** - Gợi ý dịch vụ
   - **Promotion Suggestions** - Gợi ý khuyến mãi

---

## 📍 Tóm Tắt Vị Trí

| Tính Năng | Vị Trí | Cách Xem |
|-----------|--------|----------|
| **Customer 360 View** | CustomerDetailPanel → Action Buttons | Click "Xem 360°" |
| **Customer Tags** | CustomerDetailPanel → Profile Card | Tự động hiển thị khi chọn customer |
| **Reminders** | CustomerActivityPanel → Tab Hoạt động | Mở section "Nhắc nhở chưa thực hiện" |
| **Segmentation Filter** | CustomerListPanel → Dropdown | Chọn segment từ dropdown |
| **AI Insights** | Customer360View | Mở 360 View để xem |

---

## 🚀 Quick Start

1. **Mở CRM**: `http://localhost:3000/crm`
2. **Chọn một customer** từ danh sách bên trái
3. **Xem Tags** ngay trong profile card
4. **Click "Xem 360°"** để xem Customer 360 View và AI Insights
5. **Mở tab "Hoạt động"** bên phải để xem Reminders
6. **Chọn segment** từ dropdown để filter customers

---

## 💡 Lưu Ý

- **Tags** và **Reminders** chỉ hiển thị khi đã chọn customer
- **Segmentation Filter** hoạt động ngay cả khi chưa chọn customer
- **Customer 360 View** cần customer có dữ liệu để hiển thị đầy đủ
- Nếu không thấy tags, click **"Làm mới Tags"** để refresh từ API

---

## 🔍 Troubleshooting

### Không thấy Tags?
- Đảm bảo đã chọn customer
- Click "Làm mới Tags" để refresh
- Kiểm tra API `/api/crm/tags/get` có hoạt động

### Không thấy Reminders?
- Đảm bảo đã chọn customer
- Kiểm tra tab "Hoạt động" đã mở chưa
- Kiểm tra API `/api/reminders/process` có hoạt động

### Segmentation không filter?
- Đảm bảo customers có tags tương ứng
- Kiểm tra API `/api/crm/segmentation/list` có hoạt động
- Refresh trang và thử lại

---

**📅 Cập nhật:** 2024-12-10
**✍️ Tác giả:** AI Assistant

