# Phase 10.1 - Operation Insights - Test Checklist

## 🧪 API Tests

### Authentication & Authorization:
- [ ] `GET /api/insights/overview` without auth → 401
- [ ] `GET /api/insights/overview` as OWNER → 200
- [ ] `GET /api/insights/overview` as ADMIN → 200
- [ ] `GET /api/insights/overview` as MANAGER → 403
- [ ] `GET /api/insights/overview` as RECEPTIONIST → 403
- [ ] `GET /api/insights/overview` as STYLIST → 403

### Period Parameters:
- [ ] `?period=day` → Returns today's data
- [ ] `?period=week` → Returns last 7 days data
- [ ] `?period=month` → Returns current month data
- [ ] `?startDate=2024-01-01&endDate=2024-01-31` → Returns custom range
- [ ] Invalid date format → Returns error

### Multi-Tenant Isolation:
- [ ] Salon1 user → Only sees Salon1 data
- [ ] Salon2 user → Only sees Salon2 data
- [ ] Cross-salon access → Blocked (403)

### Data Accuracy:
- [ ] Bookings count matches database
- [ ] Revenue total matches sum of invoices
- [ ] Customer count matches database
- [ ] Staff count matches database
- [ ] Previous period comparison correct

### Edge Cases:
- [ ] No bookings in period → Returns 0, empty arrays
- [ ] No revenue in period → Returns 0, empty chart
- [ ] No customers in period → Returns 0, empty arrays
- [ ] No staff → Returns 0, empty performance array
- [ ] Database connection error → Returns mock data

### Performance:
- [ ] Response time < 2s for month period
- [ ] Response time < 1s for day period
- [ ] Response time < 3s for custom range (30 days)
- [ ] No memory leaks on repeated requests

---

## 🧪 UI Tests

### Access Control:
- [ ] OWNER can access `/dashboard/insights`
- [ ] ADMIN can access `/dashboard/insights`
- [ ] MANAGER cannot access → Redirected or 403
- [ ] RECEPTIONIST cannot access → Redirected or 403
- [ ] STYLIST cannot access → Redirected or 403

### Page Load:
- [ ] Page loads without errors
- [ ] Loading spinner shows while fetching
- [ ] Data displays after load
- [ ] Error message shows if API fails
- [ ] Retry button works

### Period Selector:
- [ ] "Ngày" button switches to day period
- [ ] "Tuần" button switches to week period
- [ ] "Tháng" button switches to month period
- [ ] Active button is highlighted
- [ ] Data refreshes when period changes

### KPI Cards:
- [ ] 4 cards display correctly
- [ ] Values format correctly (currency, numbers)
- [ ] Trends show with correct colors (green/red)
- [ ] Icons display correctly
- [ ] Descriptions show below values
- [ ] Footer shows additional info

### Charts:
- [ ] Revenue Line Chart renders
- [ ] Bookings Pie Chart renders
- [ ] Staff Performance Bar Chart renders
- [ ] Customers by Source Bar Chart renders
- [ ] Charts are responsive (mobile/desktop)
- [ ] Tooltips work on hover
- [ ] Empty state shows "Không có dữ liệu"

### Tables:
- [ ] Top Customers table displays
- [ ] Staff Performance table displays
- [ ] Tables are scrollable on mobile
- [ ] Data formats correctly (currency, percentages)
- [ ] Empty state shows "Không có dữ liệu"

### Responsive Design:
- [ ] Mobile layout (< 768px) works
- [ ] Tablet layout (768px - 1024px) works
- [ ] Desktop layout (> 1024px) works
- [ ] Charts resize correctly
- [ ] Tables scroll horizontally on mobile

---

## 🧪 Integration Tests

### End-to-End Flow:
- [ ] Login as OWNER → Navigate to Insights → See data
- [ ] Change period → Data updates
- [ ] Click retry on error → Data reloads
- [ ] Navigate away and back → Data reloads

### Data Consistency:
- [ ] API data matches UI display
- [ ] Calculations are correct (percentages, averages)
- [ ] Dates format correctly
- [ ] Currency formats correctly (VND)

---

## 🧪 Edge Cases

### Empty Data:
- [ ] New salon with no data → Shows zeros and empty states
- [ ] Period with no bookings → Shows 0 bookings
- [ ] Period with no revenue → Shows 0 revenue
- [ ] No staff → Shows 0 staff

### Error Scenarios:
- [ ] Network error → Shows error message
- [ ] API timeout → Shows error message
- [ ] Invalid response → Handles gracefully
- [ ] Database error → Falls back to mock data

### Performance:
- [ ] Large dataset (1000+ bookings) → Loads within 3s
- [ ] Multiple rapid requests → Handles correctly
- [ ] Browser back/forward → Works correctly

---

## ✅ Test Results

### Build:
- [x] `npm run build` - PASSED

### API:
- [ ] All API tests - PENDING

### UI:
- [ ] All UI tests - PENDING

### Integration:
- [ ] All integration tests - PENDING

---

## 📝 Notes

- Test với real database data
- Test với multiple salons
- Test với different user roles
- Monitor performance metrics
- Check browser console for errors

**Last Updated:** $(date)

