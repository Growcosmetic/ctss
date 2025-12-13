# Phase 12 - Automation Engine - Test Checklist

## 🧪 Schema Tests

- [ ] `npx prisma format` - Should pass
- [ ] `npx prisma generate` - Should generate Prisma client
- [ ] `npx prisma migrate dev --name add_automation_engine` - Should create migration
- [ ] AutomationRule model exists
- [ ] AutomationLog model exists
- [ ] AutomationTrigger enum exists
- [ ] AutomationAction enum exists
- [ ] AutomationStatus enum exists
- [ ] Relations work correctly

---

## 🧪 API Tests

### Authentication & Authorization:
- [ ] `GET /api/automation/rules` without auth → 401
- [ ] `GET /api/automation/rules` as OWNER → 200
- [ ] `GET /api/automation/rules` as ADMIN → 403
- [ ] `POST /api/automation/rules` as OWNER → 201
- [ ] `POST /api/automation/rules` as ADMIN → 403

### List Rules (GET /api/automation/rules):
- [ ] Returns rules for current salon
- [ ] `?enabled=true` → Filters enabled rules
- [ ] `?enabled=false` → Filters disabled rules
- [ ] Returns log counts
- [ ] Multi-tenant isolation

### Create Rule (POST /api/automation/rules):
- [ ] Creates rule with enabled=false by default
- [ ] Missing required fields → 400
- [ ] Invalid trigger → 400
- [ ] Invalid action → 400
- [ ] Rule saved to database

### Update Rule (PATCH /api/automation/rules/:id):
- [ ] Enable rule → Sets enabledBy, enabledAt
- [ ] Disable rule → Clears enabledBy, enabledAt
- [ ] Update name → Updates correctly
- [ ] Update config → Updates correctly
- [ ] Invalid ruleId → 404
- [ ] Cross-salon access → 403

### Delete Rule (DELETE /api/automation/rules/:id):
- [ ] Deletes rule
- [ ] Invalid ruleId → 404
- [ ] Cross-salon access → 403

### Logs (GET /api/automation/logs):
- [ ] Returns logs for current salon
- [ ] `?ruleId=xxx` → Filters by rule
- [ ] `?status=SUCCESS` → Filters by status
- [ ] Pagination works
- [ ] Multi-tenant isolation

### Rollback (POST /api/automation/logs/:id/rollback):
- [ ] Rollbacks execution
- [ ] Sets rolledBack, rolledBackAt, rolledBackBy
- [ ] Updates status to ROLLED_BACK
- [ ] Invalid logId → 404
- [ ] Already rolled back → Error
- [ ] Cross-salon access → 403

### Trigger (POST /api/automation/trigger):
- [ ] Triggers automation for matching rules
- [ ] Only executes enabled rules
- [ ] Checks conditions
- [ ] Creates logs
- [ ] Missing required fields → 400
- [ ] Invalid trigger → 400

---

## 🧪 Automation Execution Tests

### Trigger from AIAction:
- [ ] Create HIGH priority action → Triggers ACTION_HIGH_PRIORITY
- [ ] Create CRITICAL priority action → Triggers ACTION_CRITICAL_PRIORITY
- [ ] Create MEDIUM priority action → Does not trigger
- [ ] Create LOW priority action → Does not trigger

### Rule Execution:
- [ ] Enabled rule executes → Creates log with SUCCESS
- [ ] Disabled rule does not execute
- [ ] Conditions not met → Rule skipped
- [ ] Multiple matching rules → All execute
- [ ] Execution error → Creates log with FAILED

### Action Types:
- [ ] SEND_NOTIFICATION → Executes correctly
- [ ] CREATE_TASK → Executes correctly
- [ ] UPDATE_STATUS → Updates status correctly
- [ ] SEND_EMAIL → Executes correctly
- [ ] LOG_EVENT → Logs correctly

### Rollback:
- [ ] Rollback successful execution → Status updated
- [ ] Rollback failed execution → Status updated
- [ ] Rollback sets rolledBack flag
- [ ] Cannot rollback twice

---

## 🧪 UI Tests

### Page Access:
- [ ] OWNER can access `/dashboard/automation`
- [ ] ADMIN cannot access → Redirected or 403
- [ ] Other roles cannot access → Redirected or 403

### Rules List:
- [ ] Rules display correctly
- [ ] Enabled/disabled status shows correctly
- [ ] Trigger and action labels display correctly
- [ ] Log count displays correctly
- [ ] Empty state shows when no rules

### Toggle Switch:
- [ ] Toggle ON → Rule enabled, enabledBy/enabledAt set
- [ ] Toggle OFF → Rule disabled, enabledBy/enabledAt cleared
- [ ] Toggle disabled during operation
- [ ] Loading state shows during toggle

### View Logs:
- [ ] Click "Logs" → Modal opens
- [ ] Logs display correctly
- [ ] Status colors correct
- [ ] Status icons correct
- [ ] Error messages display
- [ ] Rollback status shows

### Delete Rule:
- [ ] Click delete → Confirmation dialog
- [ ] Confirm → Rule deleted
- [ ] Cancel → Rule not deleted

### Create Rule Modal:
- [ ] Opens when clicking "Tạo Rule mới"
- [ ] Closes correctly
- [ ] Placeholder message shows

---

## 🧪 Integration Tests

### End-to-End Flow:
- [ ] Create HIGH priority action → Automation triggered
- [ ] Enabled rule executes → Log created
- [ ] View logs → Log appears in list
- [ ] Rollback log → Status updated
- [ ] Disable rule → No more executions

### Multi-Rule Execution:
- [ ] Multiple enabled rules match trigger → All execute
- [ ] Some rules fail → Others still execute
- [ ] Logs created for each execution

### Error Handling:
- [ ] Rule execution fails → Log created with FAILED status
- [ ] Error message logged
- [ ] Other rules still execute
- [ ] Action creation not affected

---

## 🧪 Edge Cases

### Empty Data:
- [ ] No rules → Empty state shows
- [ ] No logs → Empty state in modal

### Rule States:
- [ ] Rule enabled → Executes on trigger
- [ ] Rule disabled → Does not execute
- [ ] Rule deleted → No execution

### Concurrent Executions:
- [ ] Multiple triggers → All handled correctly
- [ ] Race conditions handled

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

- Test với real AIActions
- Test với multiple salons
- Test với different user roles
- Test automation execution
- Test rollback functionality
- Verify safety features (default OFF, OWNER only)

**Last Updated:** $(date)

