# Test Login với 2 Salons - Multi-Tenant

## ✅ Build Status
- Build: **SUCCESS** ✓
- Tất cả Modal imports đã được fix

## 🔐 Test Accounts

### Salon 1: Chí Tâm Hair Salon
- **Phone:** `0900000001`
- **Password:** `123456`
- **Role:** ADMIN
- **Salon:** Chí Tâm Hair Salon (default)

### Salon 2: Test Salon 2
- **Phone:** `0900000011`
- **Password:** `123456`
- **Role:** ADMIN
- **Salon:** Test Salon 2

## 🧪 Test Checklist

### 1. Login với Salon 1
1. Mở `http://localhost:3000`
2. Login với phone `0900000001`, password `123456`
3. Verify:
   - ✅ Login thành công
   - ✅ Thấy dashboard
   - ✅ Sidebar hiển thị đầy đủ menu

### 2. Test Data Isolation - Customers
1. Vào `/crm`
2. Xem danh sách customers
3. Verify:
   - ✅ Chỉ thấy customers của Salon 1
   - ✅ Không thấy customers của Salon 2

### 3. Tạo Customer mới (Salon 1)
1. Click "Thêm khách hàng"
2. Tạo customer mới với tên "Test Customer Salon 1"
3. Verify:
   - ✅ Customer được tạo thành công
   - ✅ Customer có `salonId` = Salon 1

### 4. Logout và Login với Salon 2
1. Logout
2. Login với phone `0900000011`, password `123456`
3. Verify:
   - ✅ Login thành công
   - ✅ Thấy dashboard

### 5. Test Data Isolation - Customers (Salon 2)
1. Vào `/crm`
2. Xem danh sách customers
3. Verify:
   - ✅ Không thấy "Test Customer Salon 1" (tạo ở Salon 1)
   - ✅ Chỉ thấy customers của Salon 2 (nếu có)

### 6. Tạo Customer mới (Salon 2)
1. Click "Thêm khách hàng"
2. Tạo customer mới với tên "Test Customer Salon 2"
3. Verify:
   - ✅ Customer được tạo thành công
   - ✅ Customer có `salonId` = Salon 2

### 7. Test Bookings
1. Vào `/booking`
2. Verify:
   - ✅ Chỉ thấy bookings của Salon 2
   - ✅ Không thấy bookings của Salon 1

### 8. Test API Direct Access (Security)
1. Mở DevTools → Network
2. Login với Salon 2
3. Thử gọi API với customerId của Salon 1:
   ```javascript
   fetch('/api/customers?id=<salon1-customer-id>')
   ```
4. Verify:
   - ✅ Trả về 403 hoặc không thấy data của Salon 1

## 📝 Expected Results

### Data Isolation
- ✅ Users chỉ thấy data của salon mình
- ✅ API trả về 403 khi truy cập data salon khác
- ✅ Tạo mới records tự động gán vào salon hiện tại

### UI
- ✅ Sidebar hiển thị đúng menu theo role
- ✅ Dashboard hiển thị KPI của salon hiện tại
- ✅ Không có lỗi console

## 🐛 Nếu có lỗi

### Lỗi: "Salon ID is required"
- **Nguyên nhân:** Session không có salonId
- **Fix:** Kiểm tra auth API trả về salonId

### Lỗi: "Access denied"
- **Nguyên nhân:** API guard hoạt động đúng
- **Expected:** Đây là behavior mong muốn

### Lỗi: "Table 'Salon' does not exist"
- **Nguyên nhân:** Migration chưa chạy
- **Fix:** Chạy SQL migration script

## 🎯 Success Criteria

- [x] Build thành công
- [ ] Login Salon 1 thành công
- [ ] Login Salon 2 thành công
- [ ] Data isolation hoạt động đúng
- [ ] API guards block cross-salon access
- [ ] UI không có lỗi

