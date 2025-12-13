# Phase 11.1 - AI Operational Summary - Test Checklist

## 🧪 Schema Tests

- [ ] `npx prisma format` - Should pass
- [ ] `npx prisma generate` - Should generate Prisma client
- [ ] `npx prisma migrate dev --name add_ai_summary` - Should create migration
- [ ] AISummary model exists in database
- [ ] SummaryPeriod enum exists
- [ ] Unique constraint works (salonId + period + periodDate)

---

## 🧪 API Tests

### Authentication & Authorization:
- [ ] `GET /api/ai/summary` without auth → 401
- [ ] `GET /api/ai/summary` as OWNER → 200
- [ ] `GET /api/ai/summary` as ADMIN → 200
- [ ] `GET /api/ai/summary` as MANAGER → 403
- [ ] `GET /api/ai/summary` as RECEPTIONIST → 403

### Period Parameters:
- [ ] `?period=day` → Returns day summary
- [ ] `?period=week` → Returns week summary
- [ ] `?period=month` → Returns month summary
- [ ] Invalid period → Defaults to day

### Caching:
- [ ] First request → Generates new summary
- [ ] Second request same day → Returns cached summary
- [ ] Next day request → Generates new summary
- [ ] Cache indicator in response (`cached: true/false`)

### Data Integration:
- [ ] Fetches insights data correctly
- [ ] Fetches alerts data correctly
- [ ] Combines data correctly
- [ ] Handles missing insights data gracefully
- [ ] Handles missing alerts data gracefully

### Database Storage:
- [ ] Summary saved to AISummary table
- [ ] Insights snapshot saved
- [ ] Alerts snapshot saved
- [ ] Upsert works (updates existing, creates new)

### Multi-Tenant:
- [ ] Salon1 user → Only sees Salon1 summary
- [ ] Salon2 user → Only sees Salon2 summary
- [ ] Cross-salon access → Blocked (403)

### Error Handling:
- [ ] Invalid salonId → 401/403
- [ ] Missing insights API → Error message
- [ ] Missing alerts API → Continues with empty alerts
- [ ] Database error → Error message

---

## 🧪 UI Tests

### Component Display:
- [ ] AISummaryCard displays on Insights page
- [ ] Summary text displays correctly
- [ ] Risks section displays (if any)
- [ ] Actions section displays (if any)
- [ ] Empty state when no risks/actions

### Period Selection:
- [ ] Day period shows day summary
- [ ] Week period shows week summary
- [ ] Month period shows month summary
- [ ] Period changes trigger new fetch

### Interactions:
- [ ] Refresh button works
- [ ] Refresh bypasses cache
- [ ] Loading spinner shows during fetch
- [ ] Error message shows on error
- [ ] Retry button works

### Styling:
- [ ] CRITICAL risks show red
- [ ] HIGH risks show orange
- [ ] MEDIUM risks show yellow
- [ ] LOW risks show blue
- [ ] HIGH priority actions show red
- [ ] MEDIUM priority actions show orange
- [ ] LOW priority actions show blue

### Cache Indicator:
- [ ] Shows "Đã lưu cache" when cached
- [ ] Hides when not cached
- [ ] Updates after refresh

### Generated At:
- [ ] Timestamp displays correctly
- [ ] Format: Vietnamese locale
- [ ] Updates after refresh

---

## 🧪 Integration Tests

### End-to-End Flow:
- [ ] Login as OWNER → Navigate to Insights → See summary
- [ ] Change period → Summary updates
- [ ] Refresh summary → New summary generated
- [ ] Navigate away and back → Cached summary loads

### Data Accuracy:
- [ ] Summary reflects actual insights data
- [ ] Risks match actual alerts
- [ ] Actions are relevant to data
- [ ] No hallucinated data

### Performance:
- [ ] First load < 5s (with AI generation)
- [ ] Cached load < 1s
- [ ] Refresh < 5s
- [ ] No memory leaks

---

## 🧪 Edge Cases

### Empty Data:
- [ ] No bookings → Summary still generated
- [ ] No revenue → Summary still generated
- [ ] No alerts → Summary without risks
- [ ] No customers → Summary still generated

### Error Scenarios:
- [ ] Network error → Error message
- [ ] API timeout → Error message
- [ ] Invalid response → Handles gracefully
- [ ] Database error → Error message

### Concurrent Requests:
- [ ] Multiple requests same period → Only one generates
- [ ] Race condition handled correctly

---

## 🧪 AI Service Integration (When Ready)

### Mock → Real AI:
- [ ] Replace `generateAISummary()` with real AI call
- [ ] Add API key configuration
- [ ] Test with real AI service
- [ ] Handle API errors
- [ ] Add retry logic
- [ ] Monitor costs/usage

### Prompt Quality:
- [ ] Prompt generates good summaries
- [ ] No hallucination
- [ ] Risks identified correctly
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
- Monitor AI service costs (when integrated)
- Check prompt quality and adjust if needed

**Last Updated:** $(date)

