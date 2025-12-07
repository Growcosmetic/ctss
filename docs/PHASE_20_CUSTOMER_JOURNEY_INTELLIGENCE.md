# Phase 20 - Customer Journey Intelligence

Hệ thống theo dõi, phân tích và tối ưu toàn bộ hành trình khách hàng.

## 🎯 Mục tiêu

- Theo dõi từng bước hành trình khách (7 giai đoạn)
- Tính điểm trải nghiệm khách
- AI phân tích hành vi và phân loại khách
- Dự đoán khách quay lại
- Cảnh báo khách bỏ salon
- Tính Customer Lifetime Value
- Dashboard tổng hợp

## 📋 Components

### 20A - Customer Journey Map
7 giai đoạn:
1. AWARENESS - Nhận biết
2. CONSIDERATION - Cân nhắc
3. BOOKING - Đặt lịch
4. SERVICE - Trải nghiệm tại salon
5. CHECKOUT - Thanh toán
6. POST_SERVICE - Chăm sóc sau dịch vụ
7. RETURN - Quay lại & Loyalty

### 20B - Touchpoint Tracking
Theo dõi điểm chạm:
- INBOX, CALL, BOOKING, SERVICE, CHECKOUT, FOLLOW_UP, REVIEW, REFERRAL
- Response time, outcome, channel tracking

### 20C - Experience Score System
6 metrics (0-100):
- Consultation Score
- Technical Score
- Attitude Score
- Wait Time Score
- Value Score
- Care Score
- Overall Score (weighted average)

### 20D - AI Customer Behavior Analysis
Phân loại 6 nhóm:
- VIP
- HIGH_VALUE
- TREND
- PRICE_SENSITIVE
- RISK_AVERSE
- CHURN_RISK

### 20E - Predictive Return Model
- Return probability (%)
- Predicted return date
- Predicted next service
- Predicted spend

### 20F - Customer Risk Alert
Risk factors:
- Days since last visit
- Experience scores
- No response to follow-ups
- Behavior type
- Visit frequency drop

### 20G - Loyalty & Lifetime Value Engine
- Calculate CLV
- Predict future value
- Categorize (VIP, GOLD, SILVER, REGULAR)

### 20H - Customer Journey Dashboard
- Customer insights
- Journey timeline
- Experience scores
- Behavior analysis
- Predictions
- Risk alerts
- Lifetime value

## 🗂️ Files Structure

```
prisma/
└── schema.prisma              # CustomerJourney, CustomerTouchpoint, CustomerExperience, CustomerBehavior, CustomerRiskAlert, CustomerPrediction models

core/
└── prompts/
    ├── experienceAnalysisPrompt.ts          # AI experience analysis
    └── customerBehaviorAnalysisPrompt.ts    # AI behavior analysis

app/
├── api/
│   └── customer/
│       ├── journey/
│       │   └── track/
│       │       └── route.ts      # Journey tracking
│       ├── touchpoint/
│       │   └── record/
│       │       └── route.ts      # Touchpoint recording
│       ├── experience/
│       │   └── score/
│       │       └── route.ts      # Experience scoring
│       ├── behavior/
│       │   └── analyze/
│       │       └── route.ts      # Behavior analysis
│       ├── prediction/
│       │   └── return/
│       │       └── route.ts      # Return prediction
│       ├── risk/
│       │   └── detect/
│       │       └── route.ts      # Risk detection
│       └── lifetime-value/
│           └── calculate/
│               └── route.ts      # CLV calculation
└── (dashboard)/
    └── customer/
        └── journey/
            └── page.tsx          # Customer Journey Dashboard
```

## 📊 Prisma Models

### CustomerJourney
```prisma
model CustomerJourney {
  id              String   @id @default(cuid())
  customerId      String
  journeyStage    String   // AWARENESS | CONSIDERATION | BOOKING | SERVICE | CHECKOUT | POST_SERVICE | RETURN
  touchpoint      String?
  stageData       Json?
  touchpointData  Json?
  timestamp       DateTime @default(now())
}
```

### CustomerTouchpoint
```prisma
model CustomerTouchpoint {
  id              String   @id @default(cuid())
  customerId      String
  type            String   // INBOX | CALL | BOOKING | SERVICE | CHECKOUT | FOLLOW_UP | REVIEW | REFERRAL
  channel         String?
  responseTime    Int?
  content         String?
  outcome         String?
  staffId         String?
  createdAt       DateTime @default(now())
}
```

### CustomerExperience
```prisma
model CustomerExperience {
  id                  String   @id @default(cuid())
  customerId          String
  consultationScore   Float?
  technicalScore      Float?
  attitudeScore       Float?
  waitTimeScore       Float?
  valueScore          Float?
  careScore           Float?
  overallScore        Float
  strengths           String?
  improvements        String?
  feedback            String?
  aiAnalysis          String?
  sentiment           String?
}
```

### CustomerBehavior
```prisma
model CustomerBehavior {
  id                  String   @id @default(cuid())
  customerId          String   @unique
  behaviorType        String   // VIP | HIGH_VALUE | TREND | PRICE_SENSITIVE | RISK_AVERSE | CHURN_RISK
  confidence          Float?
  totalSpent          Float
  visitCount          Int
  averageSpend        Float
  favoriteService     String?
  visitFrequency      Float?
  lifetimeValue       Float
  predictedValue      Float?
  aiAnalysis          String?
  tags                String[]
}
```

### CustomerRiskAlert
```prisma
model CustomerRiskAlert {
  id                  String   @id @default(cuid())
  customerId          String
  riskType            String   // CHURN | LOW_ENGAGEMENT | NEGATIVE_FEEDBACK | NO_RESPONSE
  riskScore           Float    // 0-100
  severity            String   // LOW | MEDIUM | HIGH | CRITICAL
  churnProbability    Float?
  recommendedAction   String?
  status              String   @default("ACTIVE")
}
```

### CustomerPrediction
```prisma
model CustomerPrediction {
  id                  String   @id @default(cuid())
  customerId          String
  predictionType      String   // RETURN | NEXT_SERVICE | SPEND | CHURN
  returnProbability   Float?
  predictedReturnDate DateTime?
  predictedService    String?
  confidence          Float?
}
```

## 🚀 API Endpoints

### POST /api/customer/journey/track
Track customer journey stage.

### GET /api/customer/journey/track
Get customer journey timeline.

### POST /api/customer/touchpoint/record
Record customer touchpoint.

### GET /api/customer/touchpoint/record
Get touchpoints with statistics.

### POST /api/customer/experience/score
Score customer experience.

### GET /api/customer/experience/score
Get experience scores for customer.

### POST /api/customer/behavior/analyze
Analyze customer behavior (AI).

### GET /api/customer/behavior/analyze
Get behavior analysis.

### POST /api/customer/prediction/return
Predict customer return.

### GET /api/customer/prediction/return
Get return predictions.

### POST /api/customer/risk/detect
Detect churn risk.

### GET /api/customer/risk/detect
Get risk alerts.

### POST /api/customer/lifetime-value/calculate
Calculate CLV.

### GET /api/customer/lifetime-value/calculate
Get CLV for customer.

## ✅ Phase 20 Checklist

- ✅ Prisma Models (6 models)
- ✅ Journey Tracking API
- ✅ Touchpoint Tracking API
- ✅ Experience Score System
- ✅ AI Behavior Analysis
- ✅ Predictive Return Model
- ✅ Customer Risk Alert
- ✅ Lifetime Value Engine
- ✅ AI Prompts

## 🎉 Kết quả

Sau Phase 20, salon đã có:
- ✅ Hệ thống theo dõi hành trình khách đầy đủ
- ✅ Tính điểm trải nghiệm tự động
- ✅ AI phân tích hành vi và phân loại khách
- ✅ Dự đoán khách quay lại
- ✅ Cảnh báo khách bỏ salon
- ✅ Tính Customer Lifetime Value
- ✅ Dashboard tổng hợp

**Đây là CRM + AI cao cấp — salon Việt Nam chưa ai có!**

