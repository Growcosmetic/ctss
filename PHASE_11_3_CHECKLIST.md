# Phase 11.3 - AI Action Engine - Test Checklist

## 🧪 Schema Tests

- [ ] `npx prisma format` - Should pass
- [ ] `npx prisma generate` - Should generate Prisma client
- [ ] `npx prisma migrate dev --name add_ai_action_engine` - Should create migration
- [ ] AIAction model exists in database
- [ ] ActionStatus enum exists
- [ ] ActionPriority enum exists
- [ ] ActionSource enum exists
- [ ] Relations work correctly

---

## 🧪 API Tests

### Authentication & Authorization:
- [ ] `GET /api/ai/actions` without auth → 401
- [ ] `GET /api/ai/actions` as OWNER → 200
- [ ] `GET /api/ai/actions` as ADMIN → 200
- [ ] `GET /api/ai/actions` as MANAGER → 403
- [ ] `POST /api/ai/actions` as OWNER → 201
- [ ] `POST /api/ai/actions` as MANAGER → 403

### List Actions (GET /api/ai/actions):
- [ ] Returns actions for current salon
- [ ] `?status=PENDING` → Filters by status
- [ ] `?status=DONE` → Filters by status
- [ ] `?status=IGNORED` → Filters by status
- [ ] `?priority=CRITICAL` → Filters by priority
- [ ] `?priority=HIGH` → Filters by priority
- [ ] `?source=AI_SUMMARY` → Filters by source
- [ ] `?source=ALERT_EXPLANATION` → Filters by source
- [ ] `?limit=10` → Limits results
- [ ] `?offset=10` → Paginates results
- [ ] Returns pagination info
- [ ] Returns counts (pending, done, ignored, criticalPending)

### Create Action (POST /api/ai/actions):
- [ ] Creates action with all fields
- [ ] Missing required fields → 400
- [ ] Invalid priority → 400
- [ ] Invalid source → 400
- [ ] Action saved to database

### Generate Actions (POST /api/ai/actions/generate):
- [ ] `source=AI_SUMMARY` with valid summaryId → Generates actions
- [ ] `source=ALERT_EXPLANATION` with valid alertId → Generates action
- [ ] Invalid source → 400
- [ ] Invalid sourceId → 404
- [ ] Duplicate prevention (existing actions not recreated)
- [ ] Actions generated correctly from summary
- [ ] Action generated correctly from alert

### Update Action (PATCH /api/ai/actions/:id):
- [ ] Update to DONE → Sets completedAt, completedBy
- [ ] Update to IGNORED → Sets ignoredAt, ignoredBy
- [ ] Update to PENDING → Clears completedAt/ignoredAt
- [ ] Invalid status → 400
- [ ] Invalid actionId → 404
- [ ] Cross-salon access → 403

### Delete Action (DELETE /api/ai/actions/:id):
- [ ] Deletes action
- [ ] Invalid actionId → 404
- [ ] Cross-salon access → 403

### Multi-Tenant:
- [ ] Salon1 user → Only sees Salon1 actions
- [ ] Salon2 user → Only sees Salon2 actions
- [ ] Cross-salon access → Blocked (403)

---

## 🧪 UI Tests

### Page Access:
- [ ] OWNER can access `/dashboard/actions`
- [ ] ADMIN can access `/dashboard/actions`
- [ ] MANAGER cannot access → Redirected or 403
- [ ] Other roles cannot access → Redirected or 403

### Stats Cards:
- [ ] Pending count displays correctly
- [ ] Done count displays correctly
- [ ] Ignored count displays correctly
- [ ] Critical Pending count displays correctly
- [ ] Counts update when filters change

### Filters:
- [ ] Status filter works
- [ ] Priority filter works
- [ ] Source filter works
- [ ] Multiple filters work together
- [ ] Clear filters button works
- [ ] Filters persist during session

### Actions List:
- [ ] Actions display correctly
- [ ] Priority badges show correct colors
- [ ] Status icons display correctly
- [ ] Source labels display correctly
- [ ] Timestamps format correctly
- [ ] Context links work
- [ ] Empty state shows when no actions

### Action Management:
- [ ] "Hoàn thành" button marks as DONE
- [ ] "Bỏ qua" button marks as IGNORED
- [ ] "Đánh dấu chưa xong" restores to PENDING
- [ ] "Khôi phục" restores to PENDING
- [ ] Status updates reflect immediately
- [ ] Context link opens in new tab

### Loading & Error States:
- [ ] Loading spinner shows during fetch
- [ ] Error message shows on error
- [ ] Retry button works

---

## 🧪 Integration Tests

### Generate from AI Summary:
- [ ] Create AI Summary with suggestedActions
- [ ] Call generate API
- [ ] Actions created correctly
- [ ] Actions appear in list
- [ ] Priority mapped correctly
- [ ] Context link set correctly

### Generate from Alert Explanation:
- [ ] Create Alert Explanation
- [ ] Call generate API
- [ ] Action created correctly
- [ ] Action appears in list
- [ ] Priority mapped from severity
- [ ] Context link set correctly

### Action Lifecycle:
- [ ] Create action → Status PENDING
- [ ] Mark Done → Status DONE, completedAt set
- [ ] Restore → Status PENDING, completedAt cleared
- [ ] Mark Ignored → Status IGNORED, ignoredAt set
- [ ] Restore → Status PENDING, ignoredAt cleared

### End-to-End Flow:
- [ ] Login as OWNER → Navigate to Actions → See actions
- [ ] Filter by status → List updates
- [ ] Mark action Done → Status updates
- [ ] Click context link → Navigate to related page

---

## 🧪 Edge Cases

### Empty Data:
- [ ] No actions → Empty state shows
- [ ] No actions matching filter → Empty state shows
- [ ] Generate with no suggestedActions → No actions created

### Duplicate Prevention:
- [ ] Generate same source twice → Second call returns existing
- [ ] Generate after action ignored → Still prevents duplicate
- [ ] Generate after action done → Still prevents duplicate

### Error Scenarios:
- [ ] Network error → Error message
- [ ] API timeout → Error message
- [ ] Invalid sourceId → 404
- [ ] Database error → Error message

---

## ✅ Test Results

### Build:
- [x] `npm run build` - PASSED

### Schema:
- [ ] All schema tests - PENDING

### API:
- [ ] All API tests - PENDING

### UI:
- [ ] All UI tests - PENDING

### Integration:
- [ ] All integration tests - PENDING

---

## 📝 Notes

- Test với real AI Summary và Alert Explanations
- Test với multiple salons
- Test với different user roles
- Test action generation from different sources
- Test duplicate prevention
- Test status transitions

**Last Updated:** $(date)

