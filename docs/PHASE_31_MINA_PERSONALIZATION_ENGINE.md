# PHASE 31 — MINA PERSONALIZATION ENGINE

## Tổng quan

Phase 31 biến MINA thành trợ lý cá nhân hóa cho từng khách hàng, học phong cách của từng stylist, và tư vấn theo vibe riêng của mỗi người.

**Tính năng chính:**
- ✅ Phân tích tính cách và thẩm mỹ khách hàng
- ✅ Học phong cách signature của từng stylist
- ✅ Tư vấn cá nhân hóa dựa trên gu khách + phong cách stylist
- ✅ Memory engine - nhớ mọi thứ về khách
- ✅ Smart follow-up theo tính cách khách
- ✅ Dashboard cá nhân hóa

**Salon anh sẽ có AI MINA độc nhất, không thể copy!**

---

## Các Module

### 31A — Customer Personality Profile

**Phân tích tính cách và sở thích:**

1. **Hair Preferences:**
   - Curl preference: LOOSE, MEDIUM, TIGHT, STRAIGHT
   - Length preference: SHORT, MEDIUM, LONG, EXTRA_LONG
   - Style preference: NATURAL, GLAM, CASUAL, ELEGANT

2. **Color Preferences:**
   - Color preference: Array of colors
   - Tone preference: WARM, COOL, NEUTRAL
   - Intensity: LIGHT, MEDIUM, DARK

3. **Style Vibe:**
   - FEMININE, MINIMAL, SEDUCTIVE, YOUTHFUL, KOREAN, MATURE
   - Personality: GENTLE, BOLD, ELEGANT, CASUAL, SOPHISTICATED

4. **Habits:**
   - LOW_MAINTENANCE, HEAT_STYLING, FREQUENT_DYEING, etc.
   - Lifestyle: BUSY, RELAXED, ACTIVE

5. **Communication Style:**
   - QUIET, CHATTY, DETAIL_ORIENTED, DECISIVE
   - Follow-up preference: SHORT, DETAILED, REMINDER_HEAVY

**API Endpoint:**
```
POST /api/personalization/customer/profile

Body:
{
  "customerId": "customer_id"
}

Response:
{
  "success": true,
  "data": {
    "id": "profile_id",
    "customerId": "...",
    "curlPreference": "LOOSE",
    "lengthPreference": "LONG",
    "styleVibe": ["FEMININE", "MINIMAL", "KOREAN"],
    "personality": "GENTLE",
    "hairCareHabits": ["LOW_MAINTENANCE", "HEAT_STYLING"],
    "communicationStyle": "QUIET",
    "followUpPreference": "SHORT",
    "personalitySummary": "...",
    ...
  }
}
```

---

### 31B — Stylist Signature Style Learning

**Học phong cách riêng của từng stylist:**

- Specialties: PERM_HOT, PERM_COLD, COLOR_COLD, BOB, LAYER, etc.
- Preferred curl sizes: ["3.2", "3.5", "3.8"]
- Preferred color tones: ["mocha", "beige", "cool"]
- Signature style description
- Style strength scores
- Common formulas used
- Successful styles

**API Endpoint:**
```
POST /api/personalization/stylist/signature

Body:
{
  "staffId": "staff_id"
}

Response:
{
  "success": true,
  "data": {
    "id": "signature_id",
    "staffId": "...",
    "specialties": ["PERM_HOT", "KOREAN_STYLE", "LAYER"],
    "preferredCurlSize": ["3.2", "3.5"],
    "preferredColorTones": ["mocha", "beige", "cool brown"],
    "signatureStyle": "Phong cách Hàn Quốc, uốn nóng nhẹ nhàng...",
    ...
  }
}
```

---

### 31C — Personalized Style Recommendation Engine

**Tư vấn cá nhân hóa:**

- Match customer preferences với stylist signature
- Generate personalized recommendations
- Include reasoning và match scores
- Full explanation cho khách

**API Endpoint:**
```
POST /api/personalization/recommend

Body:
{
  "customerId": "customer_id",
  "stylistId": "stylist_id" (optional),
  "recommendationType": "STYLE"
}

Response:
{
  "success": true,
  "data": {
    "id": "recommendation_id",
    "recommendedStyle": "Long Layer + Soft Curl 3.2",
    "recommendedColor": "Cool Mocha 7.5",
    "customerMatchScore": 0.92,
    "stylistMatchScore": 0.95,
    "fullExplanation": "Chị yêu, Mina gợi ý...",
    ...
  }
}
```

---

### 31D — Mina Memory Engine

**Nhớ mọi thứ về khách:**

- Preference memories
- Habit memories
- Feedback memories
- Interaction patterns
- Confidence scores
- Usage tracking

**API Endpoint:**
```
POST /api/personalization/memory

Body:
{
  "customerId": "customer_id",
  "memoryType": "PREFERENCE",
  "category": "color",
  "key": "prefers_brown_over_cool_brown",
  "value": "true",
  "source": "CONVERSATION"
}

GET /api/personalization/memory?customerId=xxx

Response:
{
  "success": true,
  "data": [
    {
      "id": "memory_id",
      "key": "prefers_brown_over_cool_brown",
      "value": "true",
      "confidence": 0.85,
      "confirmedCount": 3,
      ...
    }
  ]
}
```

---

### 31E — Smart Follow-up System

**Follow-up cá nhân hóa:**

- Tone phù hợp với personality
- Length phù hợp với communication style
- Content cá nhân hóa
- Scheduled based on service type

**API Endpoint:**
```
POST /api/personalization/followup

Body:
{
  "customerId": "customer_id",
  "bookingId": "booking_id",
  "followUpType": "POST_SERVICE"
}

Response:
{
  "success": true,
  "data": {
    "id": "followup_id",
    "content": "Chị ơi hôm nay tóc chị sao rồi ha? Nếp xoăn của chị hợp vibe nhẹ nhàng lắm ><",
    "tone": "GENTLE",
    "length": "SHORT",
    ...
  }
}
```

---

### 31F — Personalization Dashboard

**Dashboard tổng hợp:**

- System-wide metrics
- Customer-specific dashboard
- Profiling rates
- Acceptance rates
- Memory statistics
- Recommendation performance

**API Endpoint:**
```
GET /api/personalization/dashboard
GET /api/personalization/dashboard?customerId=xxx

Response:
{
  "success": true,
  "data": {
    "overview": {
      "totalCustomers": 1500,
      "profiledCustomers": 1200,
      "profilingRate": 80,
      "totalMemories": 5000,
      "acceptanceRate": 75.5,
      ...
    },
    "topPersonalizedCustomers": [...],
    ...
  }
}
```

---

## Database Schema

### CustomerPersonalityProfile
- Hair preferences, color preferences
- Style vibe, personality
- Habits, lifestyle
- Communication style

### StylistSignatureStyle
- Specialties, preferred techniques
- Signature style description
- Style strength scores
- Common formulas, successful styles

### PersonalizedRecommendation
- Recommendation type and details
- Match scores
- Reasoning and explanation
- Status tracking

### MinaMemory
- Memory type, category, key, value
- Confidence and confirmation count
- Usage tracking

### PersonalizedFollowUp
- Follow-up type, tone, length
- Personalized content
- Scheduling and status

### PersonalizationMetric
- Personalization scores
- Recommendation accuracy
- Engagement metrics

### CustomerStyleHistory
- Style history tracking
- Customer feedback
- Used for learning

---

## Workflow Examples

### Example 1: Generate Profile & Recommendation
```javascript
// 1. Generate customer profile
const profile = await fetch('/api/personalization/customer/profile', {
  method: 'POST',
  body: JSON.stringify({ customerId })
});

// 2. Get personalized recommendation
const recommendation = await fetch('/api/personalization/recommend', {
  method: 'POST',
  body: JSON.stringify({
    customerId,
    stylistId: 'stylist_hai',
    recommendationType: 'STYLE'
  })
});

console.log(recommendation.data.fullExplanation);
```

### Example 2: Memory & Follow-up
```javascript
// 1. Save memory
await fetch('/api/personalization/memory', {
  method: 'POST',
  body: JSON.stringify({
    customerId,
    memoryType: 'PREFERENCE',
    key: 'prefers_brown_over_cool_brown',
    value: 'true'
  })
});

// 2. Generate follow-up
const followup = await fetch('/api/personalization/followup', {
  method: 'POST',
  body: JSON.stringify({
    customerId,
    bookingId,
    followUpType: 'POST_SERVICE'
  })
});
```

---

## Benefits

✅ **Super personalized** - Mỗi khách có trải nghiệm riêng  
✅ **Better recommendations** - Match gu khách + stylist strength  
✅ **Memory system** - Nhớ mọi thứ, học lâu dài  
✅ **Smart follow-ups** - Phù hợp với tính cách  
✅ **Stylist learning** - Học phong cách từng stylist  
✅ **Impossible to copy** - AI cá nhân hóa độc nhất  

---

## Phase 31 Complete ✅

**Salon Chí Tâm giờ đây có:**
- ✅ MINA phiên bản 3.0 - cá nhân hóa 100%
- ✅ Hiểu gu, tính cách, thẩm mỹ khách
- ✅ Học phong cách từng stylist
- ✅ Tư vấn theo vibe riêng
- ✅ Nhớ lịch sử khách
- ✅ Follow-up kiểu "chăm sóc riêng"
- ✅ Tạo cảm giác như stylist riêng của mỗi khách

**Salon Chí Tâm chính thức bước sang LEVEL "Personalized AI Hair Studio".**

**Không salon nào tại Việt Nam có công nghệ này! 🚀✨**

