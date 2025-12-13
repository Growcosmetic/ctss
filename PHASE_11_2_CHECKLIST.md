# Phase 11.2 - AI Alert Explanation - Test Checklist

## 🧪 Schema Tests

- [ ] `npx prisma format` - Should pass
- [ ] `npx prisma generate` - Should generate Prisma client
- [ ] `npx prisma migrate dev --name add_ai_alert_explanation` - Should create migration
- [ ] AIAlertExplanation model exists in database
- [ ] Unique constraint works (one explanation per alert)
- [ ] Relation to SystemAlert works

---

## 🧪 API Tests

### Authentication & Authorization:
- [ ] `GET /api/ai/alert-explain?alertId=xxx` without auth → 401
- [ ] `GET /api/ai/alert-explain?alertId=xxx` as OWNER → 200
- [ ] `GET /api/ai/alert-explain?alertId=xxx` as ADMIN → 200
- [ ] `GET /api/ai/alert-explain?alertId=xxx` as MANAGER → 403
- [ ] `GET /api/ai/alert-explain?alertId=xxx` as RECEPTIONIST → 403

### Parameters:
- [ ] `?alertId=valid-id` → Returns explanation
- [ ] `?alertId=invalid-id` → Returns 404
- [ ] Missing alertId → Returns 400

### Caching:
- [ ] First request → Generates new explanation
- [ ] Second request same day → Returns cached explanation
- [ ] Next day request → Generates new explanation
- [ ] Cache indicator in response (`cached: true/false`)

### Data Integration:
- [ ] Fetches alert correctly
- [ ] Fetches related insights data
- [ ] Fetches type-specific data (LOW_STOCK → products)
- [ ] Fetches type-specific data (SUBSCRIPTION_EXPIRING → subscription)
- [ ] Handles missing related data gracefully

### Multi-Tenant:
- [ ] Salon1 user → Only sees Salon1 alert explanations
- [ ] Salon2 user → Only sees Salon2 alert explanations
- [ ] Cross-salon alert access → Blocked (403)

### Error Handling:
- [ ] Invalid alertId → 404
- [ ] Missing alert → 404
- [ ] Missing related data → Continues with available data
- [ ] Database error → Error message

---

## 🧪 UI Tests

### Button Display:
- [ ] "Vì sao?" button appears in AlertsPanel for each alert
- [ ] "Vì sao?" button appears in AlertBadge dropdown for each alert
- [ ] Button is clickable
- [ ] Button has correct styling

### Modal Display:
- [ ] Clicking "Vì sao?" opens modal
- [ ] Modal displays alert title
- [ ] Modal displays cause section
- [ ] Modal displays risk section
- [ ] Modal displays suggestedAction section
- [ ] Modal closes on "Đóng" button
- [ ] Modal closes on backdrop click

### Loading & Error States:
- [ ] Loading spinner shows during fetch
- [ ] Error message shows on error
- [ ] Retry button works
- [ ] Cache indicator shows when cached

### Styling:
- [ ] Icons display correctly (AlertTriangle, TrendingUp)
- [ ] Colors are correct
- [ ] Text is readable
- [ ] Layout is responsive

---

## 🧪 Integration Tests

### End-to-End Flow:
- [ ] Login as OWNER → See alerts → Click "Vì sao?" → See explanation
- [ ] Explanation uses real alert data
- [ ] Explanation uses real related data
- [ ] Explanation saved to database
- [ ] Cached explanation retrieved from database

### Alert Types:
- [ ] BOOKING_OVERDUE → Generates relevant explanation
- [ ] BOOKING_CONFLICT → Generates relevant explanation
- [ ] LOW_STOCK → Generates relevant explanation with product data
- [ ] CUSTOMER_BIRTHDAY → Generates relevant explanation
- [ ] SUBSCRIPTION_EXPIRING → Generates relevant explanation with subscription data

### Performance:
- [ ] First load < 3s (with AI generation)
- [ ] Cached load < 1s
- [ ] No memory leaks
- [ ] Modal opens/closes smoothly

---

## 🧪 Edge Cases

### Empty Data:
- [ ] Alert without metadata → Explanation still generated
- [ ] Alert without related data → Explanation still generated
- [ ] Missing insights data → Continues with available data

### Error Scenarios:
- [ ] Network error → Error message
- [ ] API timeout → Error message
- [ ] Invalid response → Handles gracefully
- [ ] Database error → Error message

### Concurrent Requests:
- [ ] Multiple requests same alert → Only one generates
- [ ] Race condition handled correctly

---

## 🧪 AI Service Integration (When Ready)

### Mock → Real AI:
- [ ] Replace `generateAlertExplanation()` with real AI call
- [ ] Add API key configuration
- [ ] Test with real AI service
- [ ] Handle API errors
- [ ] Add retry logic
- [ ] Monitor costs/usage

### Prompt Quality:
- [ ] Prompt generates good explanations
- [ ] No hallucination
- [ ] Cause is accurate
- [ ] Risk is relevant
- [ ] Actions are actionable
- [ ] Output format consistent

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

- Test với real database data
- Test với multiple salons
- Test với different user roles
- Test với different alert types
- Monitor AI service costs (when integrated)
- Check prompt quality and adjust if needed

**Last Updated:** $(date)

