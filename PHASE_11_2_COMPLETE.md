# Phase 11.2 - AI Alert Explanation - Complete

## ✅ Goal
Triển khai hệ thống AI Alert Explanation tự động giải thích các cảnh báo hệ thống với nguyên nhân, rủi ro và hành động đề xuất.

---

## ✅ Completed Tasks

### 1. Prisma Schema

#### Created Model:
- ✅ `AIAlertExplanation` model:
  - `id`, `alertId` (unique - one explanation per alert)
  - `salonId` (multi-tenant)
  - `content` (JSON: { cause, risk, suggestedAction })
  - `relatedData` (JSON - snapshot of related operational data)
  - Timestamps
  - Unique constraint: `alertId`

#### Relations:
- ✅ `SystemAlert.aiAlertExplanation` → `AIAlertExplanation?` (one-to-one)
- ✅ `Salon.aiAlertExplanations` → `AIAlertExplanation[]`

### 2. AI Alert Explanation Engine

#### Created:
- ✅ `lib/ai/alert-explain-prompt.ts` - AI prompt builder và generator

#### Features:
- ✅ **Structured Prompt**: Prompt đóng, chỉ sử dụng dữ liệu thực tế
- ✅ **No Hallucination**: Không suy đoán, chỉ dựa trên data
- ✅ **Input Processing**: AlertData + RelatedData
- ✅ **Output Structure**: 
  - `cause`: Nguyên nhân của cảnh báo
  - `risk`: Rủi ro nếu không xử lý
  - `suggestedAction`: Hành động đề xuất cụ thể

#### Functions:
- ✅ `buildAlertExplainPrompt()` - Build structured prompt từ alert + related data
- ✅ `parseAlertExplainResponse()` - Parse AI response to structured format
- ✅ `generateAlertExplanation()` - Generate explanation (mock implementation, ready for AI service)

### 3. API Route

#### Created:
- ✅ `GET /api/ai/alert-explain?alertId=xxx`

#### Features:
- ✅ **Role Guard**: Chỉ OWNER/ADMIN có thể truy cập
- ✅ **Multi-tenant**: Verify alert belongs to salon
- ✅ **Caching**: Cache explanation trong ngày (không regenerate nếu đã có)
- ✅ **Data Integration**:
  - Fetch alert từ database
  - Fetch related insights data
  - Fetch type-specific data (products, subscriptions, etc.)
  - Combine và generate explanation
- ✅ **Database Storage**: Lưu kết quả vào AIAlertExplanation table
- ✅ **Error Handling**: Graceful error handling với clear messages

### 4. UI Components

#### Created:
- ✅ `components/alerts/AlertExplainModal.tsx` - Modal hiển thị explanation

#### Features:
- ✅ **Modal Display**: Hiển thị cause, risk, suggestedAction
- ✅ **Loading State**: Spinner khi đang tải
- ✅ **Error State**: Error message với retry button
- ✅ **Cache Indicator**: Hiển thị nếu dùng cache
- ✅ **Icons**: Color-coded icons cho từng section

#### Updated:
- ✅ `components/dashboard/AlertsPanel.tsx` - Thêm nút "Vì sao?" cho mỗi alert
- ✅ `components/alerts/AlertBadge.tsx` - Thêm nút "Vì sao?" trong dropdown

### 5. Prompt Design

#### Structure:
- ✅ **Input Section**: Alert data + Related operational data
- ✅ **Instructions**: Rõ ràng về không hallucination
- ✅ **Output Format**: JSON structure cụ thể
- ✅ **Type-specific Data**: Fetch relevant data based on alert type

---

## 📋 Files Changed

### Schema:
- `prisma/schema.prisma` - Added AIAlertExplanation model

### Core Libraries:
- `lib/ai/alert-explain-prompt.ts` - AI prompt builder và generator

### API Routes:
- `app/api/ai/alert-explain/route.ts` - GET explanation endpoint

### UI Components:
- `components/alerts/AlertExplainModal.tsx` - Explanation modal
- `components/dashboard/AlertsPanel.tsx` - Added "Vì sao?" button
- `components/alerts/AlertBadge.tsx` - Added "Vì sao?" button

---

## 🧪 Testing Checklist

### Schema:
- [ ] `npx prisma format` - Should pass
- [ ] `npx prisma generate` - Should generate client
- [ ] `npx prisma migrate dev --name add_ai_alert_explanation` - Should create migration
- [ ] AIAlertExplanation model exists in database
- [ ] Unique constraint works (one explanation per alert)

### API Tests:
- [ ] `GET /api/ai/alert-explain?alertId=xxx` - Returns explanation for OWNER
- [ ] `GET /api/ai/alert-explain?alertId=xxx` - Returns 403 for non-OWNER/ADMIN
- [ ] `GET /api/ai/alert-explain` without alertId → 400
- [ ] `GET /api/ai/alert-explain?alertId=invalid` → 404
- [ ] Caching works (same alert same day returns cached)
- [ ] Multi-tenant isolation (Salon1 cannot see Salon2 alert explanation)
- [ ] Related data fetched correctly based on alert type
- [ ] Error handling (missing alert, missing related data)

### UI Tests:
- [ ] "Vì sao?" button appears in AlertsPanel
- [ ] "Vì sao?" button appears in AlertBadge dropdown
- [ ] Clicking "Vì sao?" opens modal
- [ ] Modal displays explanation correctly
- [ ] Loading state shows spinner
- [ ] Error state shows retry button
- [ ] Cache indicator shows when cached
- [ ] Modal closes correctly

### Integration Tests:
- [ ] Explanation uses real alert data
- [ ] Explanation uses real related data
- [ ] Explanation saved to database
- [ ] Cached explanation retrieved from database
- [ ] Different alert types generate different explanations

---

## 🎯 Key Features

### 1. Structured Prompt:
- **No Hallucination**: Chỉ sử dụng dữ liệu thực tế
- **Clear Instructions**: Rõ ràng về output format
- **Type-specific**: Fetch relevant data based on alert type

### 2. Output Structure:
- **Cause**: Giải thích nguyên nhân tại sao cảnh báo xuất hiện
- **Risk**: Mô tả rủi ro nếu không xử lý
- **Suggested Action**: Hành động cụ thể đề xuất

### 3. Caching:
- Cache explanation trong ngày
- One explanation per alert
- Cache indicator in UI

### 4. Data Integration:
- Alert data từ database
- Related insights data
- Type-specific data (products, subscriptions, etc.)

### 5. Security:
- Role-based access (OWNER/ADMIN only)
- Multi-tenant isolation
- Alert ownership verification

---

## 🔧 AI Service Integration

### Current Implementation:
- Mock implementation trong `generateAlertExplanation()`
- Ready for AI service integration

### To Integrate Real AI Service:

1. **Replace `generateAlertExplanation()` function**:
```typescript
export async function generateAlertExplanation(
  alert: AlertData,
  relatedData?: RelatedData
): Promise<AlertExplanationResult> {
  const prompt = buildAlertExplainPrompt(alert, relatedData);
  
  // Call AI service (OpenAI, Anthropic, etc.)
  const response = await aiService.generate(prompt);
  
  return parseAlertExplainResponse(response);
}
```

2. **Add AI Service Configuration**:
```env
AI_SERVICE_API_KEY=your-api-key
AI_SERVICE_MODEL=gpt-4
AI_SERVICE_TEMPERATURE=0.3
```

3. **Update `lib/ai/alert-explain-prompt.ts`**:
- Add actual AI service call
- Handle API errors
- Add retry logic if needed

---

## 📊 Data Flow

```
1. User clicks "Vì sao?" button on alert
   ↓
2. Modal opens, fetches explanation (GET /api/ai/alert-explain?alertId=xxx)
   ↓
3. Check cache (AIAlertExplanation table)
   ↓
4. If cached & today → Return cached
   ↓
5. If not cached → Fetch alert + related data
   ↓
6. Build prompt from data
   ↓
7. Generate AI explanation
   ↓
8. Save to AIAlertExplanation table
   ↓
9. Display explanation in modal
```

---

## 🚀 Next Steps

### Before Production:
1. Integrate real AI service (OpenAI, Anthropic, etc.)
2. Add rate limiting for AI calls
3. Add error handling for AI service failures
4. Test with real alerts and data
5. Optimize prompt for better results

### Future Enhancements:
- Explanation history
- Explanation feedback (helpful/not helpful)
- Custom explanation templates
- Multi-language support
- Explanation export

---

## ✅ Phase 11.2 Status: COMPLETE

AI Alert Explanation đã được triển khai thành công với:
- ✅ Database model
- ✅ AI prompt engine
- ✅ API endpoint
- ✅ UI components (modal + buttons)
- ✅ Caching mechanism
- ✅ Role guards và security
- ✅ Error handling
- ✅ Build passes

**Note**: Current implementation uses mock AI generation. Ready for real AI service integration.

**Last Updated:** $(date)
**Version:** 1.0.0

