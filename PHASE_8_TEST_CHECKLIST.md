# Phase 8 - Test Checklist (Updated for Phase 8.5)

## 🧪 Test Categories

### 1. Schema & Migration Tests

#### Prisma Schema:
- [ ] `npx prisma format` - Should pass
- [ ] `npx prisma generate` - Should generate client
- [ ] `npx prisma migrate dev --name add_subscription_system` - Should create migration
- [ ] `npx prisma db seed` - Should seed plans and assign FREE to default salon

#### Database:
- [ ] Verify `Plan` table has 4 plans (FREE, BASIC, PRO, ENTERPRISE)
- [ ] Verify `Subscription` table has record for default salon
- [ ] Verify `UsageTracking` table structure

---

### 2. API Route Tests

#### Subscription APIs:
- [ ] `GET /api/subscription/current`:
  - [ ] Returns current subscription info
  - [ ] Returns usage data
  - [ ] Requires authentication (401 if not logged in)
  - [ ] Filters by salonId (multi-tenant)

- [ ] `GET /api/subscription/plans`:
  - [ ] Returns all active plans
  - [ ] Includes features and limits
  - [ ] No authentication required (public info)

- [ ] `POST /api/subscription/upgrade`:
  - [ ] Requires OWNER role (403 if not OWNER)
  - [ ] Creates/updates subscription
  - [ ] Creates history record
  - [ ] Updates salon.planId and salon.planStatus

#### Feature Guards:
- [ ] `POST /api/pos`:
  - [ ] Requires POS feature (403 if FREE plan)
  - [ ] Checks invoice limit (403 if exceeded)
  - [ ] Tracks usage after creation

- [ ] `POST /api/bookings`:
  - [ ] Checks booking limit (403 if exceeded)
  - [ ] Tracks usage after creation

- [ ] `POST /api/customers`:
  - [ ] Checks customer limit (403 if exceeded)
  - [ ] Tracks usage after creation

---

### 3. Limit Enforcement Tests

#### Test Scenario: FREE Plan Limits
1. Login as OWNER with FREE plan salon
2. Create 3 staff members → Should succeed
3. Create 4th staff → Should fail with 403 "Limit exceeded: staff (3/3)"
4. Create 100 bookings → Should succeed
5. Create 101st booking → Should fail with 403 "Limit exceeded: bookings"

#### Test Scenario: Feature Gates
1. Login as FREE plan salon
2. Try to create POS order → Should fail with 403 "Feature POS is not available"
3. Upgrade to BASIC plan
4. Try to create POS order → Should succeed

---

### 4. Usage Tracking Tests

#### Test Scenarios:
- [ ] Create booking → Verify `UsageTracking` record created/updated for "bookings"
- [ ] Create customer → Verify `UsageTracking` record created/updated for "customers"
- [ ] Create POS order → Verify `UsageTracking` record created/updated for "invoices"
- [ ] Create staff → Verify `UsageTracking` record created/updated for "staff"
- [ ] `syncUsage()` → Should sync with actual DB counts

---

### 5. Multi-Tenant Regression Tests

#### Test Scenarios:
- [ ] Salon1 (FREE) → Create 3 staff → Success
- [ ] Salon2 (PRO) → Create 50 staff → Success
- [ ] Salon1 → Try to access Salon2 subscription → 404
- [ ] Salon1 → Try to upgrade Salon2 → 403/404

---

### 6. UI Tests

#### Subscription Page (`/system/subscription`):
- [ ] Only OWNER can access (403 for other roles)
- [ ] Displays current plan correctly
- [ ] Shows usage progress bars
- [ ] Shows available plans
- [ ] Upgrade modal works
- [ ] After upgrade, page refreshes with new plan

---

### 7. Role Tests

#### OWNER Role:
- [ ] OWNER can access `/system/subscription`
- [ ] OWNER can upgrade plan
- [ ] OWNER can view usage
- [ ] ADMIN/MANAGER cannot access subscription page (403)

---

## 🧪 Automated Test Scripts

### Run Tests:
```bash
# 1. Build
npm run build

# 2. Run migration
npx prisma migrate dev --name add_subscription_system

# 3. Seed
npx prisma db seed

# 4. Start dev server
npm run dev

# 5. Manual tests (see checklist above)
```

---

## 🧪 Phase 8.5 - Additional Test Scenarios

### Edge Case Tests:

#### 1. Plan Downgrade:
- [ ] Try to downgrade from PRO to BASIC
- [ ] Verify warnings shown for feature loss
- [ ] Try to downgrade when usage exceeds target plan limits
- [ ] Verify error prevents downgrade
- [ ] Successfully downgrade when within limits

#### 2. Salon Disabled:
- [ ] Set salon status to SUSPENDED
- [ ] Try to access subscription API → Should return 403
- [ ] Try to create booking → Should return 403
- [ ] Verify error message: "Salon không hoạt động"

#### 3. Owner Role Removed:
- [ ] Change user role from OWNER to ADMIN
- [ ] Try to access `/system/subscription` → Should return 403
- [ ] Try to upgrade plan → Should return 403
- [ ] Verify error message: "Chỉ chủ salon mới có thể quản lý gói dịch vụ"

#### 4. Subscription Expired:
- [ ] Set subscription status to EXPIRED
- [ ] Set currentPeriodEndsAt to past date
- [ ] Try to create booking → Should return 403
- [ ] Verify error message mentions expiration

#### 5. Trial Expired:
- [ ] Set trialEndsAt to past date
- [ ] Set status to EXPIRED
- [ ] Try to use features → Should return 403
- [ ] Verify error message: "Thời gian dùng thử đã hết hạn"

### UX Tests:

#### UpgradeRequired Component:
- [ ] Display when feature not available
- [ ] Display when limit exceeded
- [ ] Upgrade button navigates to `/system/subscription`
- [ ] Modal shows detailed information
- [ ] Progress bars show usage vs limits

#### Error Messages:
- [ ] All errors in Vietnamese
- [ ] Clear action items
- [ ] Context-aware messages

---

## ✅ Test Results

### Build:
- [x] `npm run build` - PASSED

### Schema:
- [ ] Migration - PENDING
- [ ] Seed - PENDING

### API:
- [ ] Subscription APIs - PENDING
- [ ] Feature Guards - PENDING
- [ ] Limit Enforcement - PENDING

### UI:
- [ ] Subscription Page - PENDING

---

## 📝 Notes

- All tests should be run in a clean database environment
- Test with multiple salons to verify multi-tenant isolation
- Test edge cases (unlimited plans, expired subscriptions, etc.)

**Last Updated:** $(date)

