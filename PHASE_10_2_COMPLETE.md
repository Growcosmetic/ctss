# Phase 10.2 - Rule-based Alerts System - Complete

## ✅ Goal
Triển khai hệ thống cảnh báo dựa trên rules cho CTSS, tự động phát hiện và thông báo các vấn đề quan trọng.

---

## ✅ Completed Tasks

### 1. Prisma Schema

#### Created Models:
- ✅ `SystemAlert` model:
  - `id`, `salonId` (multi-tenant)
  - `type` (AlertType enum)
  - `severity` (AlertSeverity enum: LOW, MEDIUM, HIGH, CRITICAL)
  - `status` (AlertStatus enum: ACTIVE, ACKNOWLEDGED, RESOLVED, DISMISSED)
  - `title`, `message`
  - `metadata` (JSON for additional data)
  - `ruleId` (optional, ID of rule that generated alert)
  - `acknowledgedAt`, `acknowledgedBy`
  - `resolvedAt`, `resolvedBy`
  - `dismissedAt`, `dismissedBy`
  - Timestamps

- ✅ `AlertRule` model:
  - `id`, `salonId` (multi-tenant)
  - `name`, `description`
  - `type`, `severity`
  - `enabled` (boolean)
  - `conditions` (JSON for rule conditions)
  - `schedule` (cron expression)
  - `lastRunAt`
  - Timestamps

#### Created Enums:
- ✅ `AlertType`: BOOKING_OVERDUE, BOOKING_CONFLICT, LOW_STOCK, CUSTOMER_BIRTHDAY, SUBSCRIPTION_EXPIRING, REVENUE_TARGET, STAFF_OVERLOAD, PAYMENT_PENDING, SYSTEM_ERROR, INFO
- ✅ `AlertSeverity`: LOW, MEDIUM, HIGH, CRITICAL
- ✅ `AlertStatus`: ACTIVE, ACKNOWLEDGED, RESOLVED, DISMISSED

#### Relations:
- ✅ `Salon.systemAlerts` → `SystemAlert[]`
- ✅ `Salon.alertRules` → `AlertRule[]`

### 2. Alert Rules Engine

#### Created:
- ✅ `lib/alerts/rules.ts` - Alert rules engine

#### Default Rules Implemented:
- ✅ **BOOKING_OVERDUE**: Phát hiện lịch hẹn quá hạn nhưng chưa hoàn thành
- ✅ **BOOKING_CONFLICT**: Phát hiện lịch hẹn có thể trùng thời gian
- ✅ **LOW_STOCK**: Cảnh báo sản phẩm sắp hết hàng (≤10 units)
- ✅ **CUSTOMER_BIRTHDAY**: Nhắc nhở sinh nhật khách hàng hôm nay
- ✅ **SUBSCRIPTION_EXPIRING**: Cảnh báo gói dịch vụ sắp hết hạn (≤7 days)

#### Functions:
- ✅ `runAlertRules(salonId)` - Chạy tất cả rules cho một salon
- ✅ `runAlertRulesForAllSalons()` - Chạy rules cho tất cả salons
- ✅ Tránh duplicate alerts (chỉ tạo alert mới nếu chưa có trong ngày)

### 3. API Routes

#### Created:
- ✅ `GET /api/alerts` - Lấy alerts cho salon hiện tại
  - Query params: `status`, `severity`, `limit`, `unreadOnly`
  - Returns: alerts array + counts (active, critical, high)
  - Multi-tenant: filter by salonId

- ✅ `POST /api/alerts/:id` - Actions trên alert
  - Actions: `acknowledge`, `resolve`, `dismiss`
  - Updates status và timestamps
  - Verifies salon ownership

- ✅ `GET /api/cron/alerts` - Cron endpoint để chạy alert rules
  - Optional: Bearer token authentication (CRON_SECRET)
  - Runs rules for all active salons
  - Returns execution summary

### 4. UI Components

#### Created:
- ✅ `components/alerts/AlertBadge.tsx` - Alert badge cho Header
  - Hiển thị số lượng alerts
  - Dropdown với danh sách alerts
  - Color-coded theo severity
  - Auto-refresh mỗi 30 giây

- ✅ `components/dashboard/AlertsPanel.tsx` - Panel hiển thị alerts trên Dashboard
  - Hiển thị top alerts
  - Action buttons (Đã xem, Đã xử lý)
  - Empty state khi không có alerts
  - Color-coded theo severity

#### Integrated:
- ✅ `components/layout/Header.tsx` - Thêm AlertBadge vào Header
- ✅ `app/dashboard/page.tsx` - Thêm AlertsPanel vào Dashboard

### 5. Logging & Error Handling

#### Logging:
- ✅ Request logging với salonId
- ✅ Rule execution logging
- ✅ Error logging với context
- ✅ Performance logging (duration)

#### Error Handling:
- ✅ Database errors → Graceful fallback
- ✅ Invalid parameters → Clear error messages
- ✅ Multi-tenant isolation → 403 on cross-salon access
- ✅ Missing data → Empty states

---

## 📋 Files Changed

### Schema:
- `prisma/schema.prisma` - Added SystemAlert, AlertRule models + enums

### Core Libraries:
- `lib/alerts/rules.ts` - Alert rules engine

### API Routes:
- `app/api/alerts/route.ts` - GET alerts
- `app/api/alerts/[id]/route.ts` - Alert actions
- `app/api/cron/alerts/route.ts` - Cron endpoint

### UI Components:
- `components/alerts/AlertBadge.tsx` - Header badge
- `components/dashboard/AlertsPanel.tsx` - Dashboard panel

### Updated:
- `components/layout/Header.tsx` - Added AlertBadge
- `app/dashboard/page.tsx` - Added AlertsPanel

---

## 🧪 Testing Checklist

### Schema:
- [ ] `npx prisma format` - Should pass
- [ ] `npx prisma generate` - Should generate client
- [ ] `npx prisma migrate dev --name add_alert_system` - Should create migration

### API Tests:
- [ ] `GET /api/alerts` - Returns alerts for current salon
- [ ] `GET /api/alerts?unreadOnly=true` - Returns only ACTIVE alerts
- [ ] `GET /api/alerts?severity=CRITICAL` - Filters by severity
- [ ] `POST /api/alerts/:id` with action=acknowledge - Updates status
- [ ] `POST /api/alerts/:id` with action=resolve - Updates status
- [ ] `POST /api/alerts/:id` with action=dismiss - Updates status
- [ ] Multi-tenant isolation (Salon1 cannot see Salon2 alerts)

### Cron Tests:
- [ ] `GET /api/cron/alerts` - Runs rules for all salons
- [ ] `GET /api/cron/alerts` without auth → 401 (if CRON_SECRET set)
- [ ] Rules generate alerts correctly
- [ ] Duplicate prevention works (no duplicate alerts same day)

### UI Tests:
- [ ] AlertBadge shows count in Header
- [ ] AlertBadge dropdown shows alerts
- [ ] AlertsPanel displays on Dashboard
- [ ] Action buttons work (acknowledge, resolve)
- [ ] Empty state shows when no alerts
- [ ] Color coding by severity works

### Rule Tests:
- [ ] BOOKING_OVERDUE rule detects overdue bookings
- [ ] LOW_STOCK rule detects low stock products
- [ ] CUSTOMER_BIRTHDAY rule detects birthdays
- [ ] SUBSCRIPTION_EXPIRING rule detects expiring subscriptions
- [ ] Rules don't create duplicates

---

## 🎯 Key Features

### 1. Rule-based System:
- Configurable rules với conditions
- Cron scheduling support
- Multi-tenant isolation

### 2. Alert Types:
- **BOOKING_OVERDUE**: Lịch hẹn quá hạn
- **BOOKING_CONFLICT**: Lịch hẹn trùng lịch
- **LOW_STOCK**: Hàng tồn kho thấp
- **CUSTOMER_BIRTHDAY**: Sinh nhật khách hàng
- **SUBSCRIPTION_EXPIRING**: Gói dịch vụ sắp hết hạn

### 3. Severity Levels:
- **CRITICAL**: Cần xử lý ngay (red)
- **HIGH**: Quan trọng (orange)
- **MEDIUM**: Trung bình (yellow)
- **LOW**: Thông tin (blue)

### 4. Alert Lifecycle:
- **ACTIVE** → **ACKNOWLEDGED** → **RESOLVED** / **DISMISSED**
- Track who acknowledged/resolved/dismissed
- Timestamps for all actions

### 5. UI Integration:
- Header badge với dropdown
- Dashboard panel với actions
- Auto-refresh
- Color-coded by severity

---

## 🚀 Setup & Deployment

### 1. Database Migration:
```bash
npx prisma migrate dev --name add_alert_system
npx prisma generate
```

### 2. Setup Cron Job:
Có thể setup cron job để gọi `/api/cron/alerts` định kỳ:

**Option A: External Cron Service**
- Sử dụng cron-job.org hoặc tương tự
- Schedule: Mỗi giờ (0 * * * *)
- URL: `https://your-domain.com/api/cron/alerts`
- Headers: `Authorization: Bearer YOUR_CRON_SECRET`

**Option B: Server Cron**
```bash
# Add to crontab
0 * * * * curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-domain.com/api/cron/alerts
```

**Option C: Next.js API Route (Manual)**
- Call manually hoặc integrate với external scheduler

### 3. Environment Variables:
```env
CRON_SECRET=your-secret-key-here  # Optional, for cron endpoint auth
```

---

## 📊 Alert Rules Details

### BOOKING_OVERDUE:
- **Severity**: HIGH
- **Check**: Bookings với status PENDING/CONFIRMED và date < now
- **Action**: Tạo alert với danh sách booking IDs

### BOOKING_CONFLICT:
- **Severity**: MEDIUM
- **Check**: Bookings cùng staff và cùng giờ
- **Action**: Tạo alert với danh sách conflict booking IDs

### LOW_STOCK:
- **Severity**: MEDIUM
- **Check**: Products với stockQuantity ≤ 10
- **Action**: Tạo alert với danh sách products

### CUSTOMER_BIRTHDAY:
- **Severity**: LOW
- **Check**: Customers có birthday hôm nay
- **Action**: Tạo alert với danh sách customers

### SUBSCRIPTION_EXPIRING:
- **Severity**: HIGH
- **Check**: Subscription expires trong ≤7 days hoặc đã expired
- **Action**: Tạo alert với plan name và expiry date

---

## ✅ Phase 10.2 Status: COMPLETE

Rule-based Alerts System đã được triển khai thành công với:
- ✅ Database models và enums
- ✅ Alert rules engine
- ✅ API endpoints
- ✅ UI components (Header + Dashboard)
- ✅ Cron support
- ✅ Multi-tenant isolation
- ✅ Logging và error handling
- ✅ Build passes

**Last Updated:** $(date)
**Version:** 1.0.0

