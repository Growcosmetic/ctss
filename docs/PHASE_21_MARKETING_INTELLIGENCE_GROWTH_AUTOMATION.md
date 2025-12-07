# Phase 21 - Marketing Intelligence & Growth Automation

Hệ thống AI phân tích marketing, tạo chiến dịch, tự động tối ưu khách mới và khách quay lại.

## 🎯 Mục tiêu

- AI phân tích hiệu quả kênh marketing
- Tự tạo nội dung quảng cáo, hình ảnh, video
- Dự đoán chi phí khách mới (CAC)
- Tính giá trị khách (LTV)
- Chạy chuỗi automation chăm khách quay lại
- Chiến dịch nhắm đúng khách VIP, khách rời bỏ salon
- Lịch posting, nội dung, hashtag, thời điểm vàng

## 📋 Components

### 21A - Marketing Data Tracking
- Track leads, bookings, arrivals, conversions
- Track ad spend, revenue by channel
- Calculate cost per lead, cost per customer
- Conversion rate tracking

### 21B - Campaign Analytics
- Campaign performance metrics
- CAC, LTV, ROI calculation
- Campaign comparison

### 21C - Customer Segmentation (AI)
- AI phân loại 8 nhóm khách
- VIP, HIGH_SPENDER, TREND_HUNTER, BEAUTY_ADDICT, BUDGET, ONE_TIME, RISK, REFERRAL
- Segment statistics

### 21D - Content Generator
- AI tạo Ads Script
- AI tạo Post content
- AI tạo Reel script
- AI tạo Image prompts
- Hashtags generation

### 21E - Growth Automation Flows
- New customer automation
- Risk customer automation
- VIP automation
- Post-service automation

### 21F - LTV vs CAC Engine
- Calculate LTV by channel
- Calculate CAC by channel
- LTV/CAC ratio
- Profit analysis

### 21G - Trend & Competitor Analysis
- Trend detection
- Competitor pricing
- Competitor campaigns
- Opportunities analysis

### 21H - Marketing Dashboard
- KPI summary
- Channel performance
- Campaign performance
- Segments overview
- Trends

## 🗂️ Files Structure

```
prisma/
└── schema.prisma              # MarketingChannel, MarketingDataPoint, MarketingCampaignV2, MarketingContent, MarketingAutomation, MarketingSegment, MarketingTrend, CompetitorAnalysis

core/
└── prompts/
    ├── contentGeneratorPrompt.ts          # AI content generation
    └── customerSegmentationPrompt.ts      # AI segmentation

app/
├── api/
│   └── marketing/
│       ├── channel/
│       │   └── track/
│       │       └── route.ts      # Channel data tracking
│       ├── campaign/
│       │   └── analytics/
│       │       └── route.ts      # Campaign analytics
│       ├── content/
│       │   └── generate/
│       │       └── route.ts      # AI content generation
│       ├── segment/
│       │   └── analyze/
│       │       └── route.ts      # AI segmentation
│       ├── automation/
│       │   └── create/
│       │       └── route.ts      # Automation flows
│       ├── ltv-cac/
│       │   └── analyze/
│       │       └── route.ts      # LTV vs CAC analysis
│       ├── trend/
│       │   └── analyze/
│       │       └── route.ts      # Trend analysis
│       ├── competitor/
│       │   └── analyze/
│       │       └── route.ts      # Competitor analysis
│       └── dashboard/
│           └── route.ts          # Marketing dashboard data
└── (dashboard)/
    └── marketing/
        └── page.tsx              # Marketing Dashboard UI
```

## 📊 Prisma Models

### MarketingChannel
```prisma
model MarketingChannel {
  id              String   @id @default(cuid())
  name            String   // Facebook | Instagram | TikTok | Google | Referral | Walk-in
  type            String   // PAID | ORGANIC | REFERRAL | DIRECT
  isActive        Boolean  @default(true)
}
```

### MarketingDataPoint
```prisma
model MarketingDataPoint {
  id              String   @id @default(cuid())
  channelId       String
  date            DateTime @db.Date
  leads           Int
  bookings        Int
  arrivals        Int
  conversions     Int
  adSpend         Float
  revenue         Float
  costPerLead     Float?
  costPerCustomer Float?
  conversionRate  Float?
}
```

### MarketingCampaignV2
```prisma
model MarketingCampaignV2 {
  id              String   @id @default(cuid())
  name            String
  channelId       String
  type            String   // PROMOTION | SEASONAL | RETARGETING | VIP | CHURN_PREVENTION
  budget          Float
  spent           Float
  leads           Int
  bookings        Int
  customers       Int
  revenue         Float
  cac             Float?
  ltv             Float?
  roi             Float?
  status          String   @default("DRAFT")
}
```

### MarketingContent
```prisma
model MarketingContent {
  id              String   @id @default(cuid())
  campaignId      String?
  contentType     String   // POST | AD | REEL | SCRIPT | IMAGE_PROMPT
  content         String
  imagePrompt     String?
  hashtags        String[]
  platform        String?
  isAIGenerated   Boolean  @default(false)
}
```

### MarketingAutomation
```prisma
model MarketingAutomation {
  id              String   @id @default(cuid())
  campaignId      String?
  name            String
  triggerType     String   // NEW_CUSTOMER | RISK_CUSTOMER | VIP | POST_SERVICE | BIRTHDAY
  steps           Json     // Automation steps
  isActive        Boolean  @default(true)
}
```

### MarketingSegment
```prisma
model MarketingSegment {
  id              String   @id @default(cuid())
  name            String   // VIP | HIGH_SPENDER | TREND_HUNTER | etc.
  criteria        Json?
  customerCount   Int
  averageLTV      Float
  isAIGenerated   Boolean  @default(false)
}
```

### MarketingTrend
```prisma
model MarketingTrend {
  id              String   @id @default(cuid())
  trendType       String   // HAIR_STYLE | COLOR | TECHNIQUE | SEASONAL
  title           String
  popularity      Float?
  season          String?
  source          String?
}
```

### CompetitorAnalysis
```prisma
model CompetitorAnalysis {
  id              String   @id @default(cuid())
  competitorName  String
  location        String?
  servicePrices   Json?
  services        Json?
  activeCampaigns Json?
  promotions      Json?
  strengths       Json?
  weaknesses      Json?
  opportunities   Json?
}
```

## 🚀 API Endpoints

### POST /api/marketing/channel/track
Track marketing channel data.

### GET /api/marketing/channel/track
Get channel data with statistics.

### POST /api/marketing/campaign/analytics
Update campaign analytics.

### GET /api/marketing/campaign/analytics
Get campaign analytics.

### POST /api/marketing/content/generate
Generate AI content (Ads, Post, Reel, Script, Image Prompt).

### GET /api/marketing/content/generate
Get generated contents.

### POST /api/marketing/segment/analyze
AI customer segmentation.

### GET /api/marketing/segment/analyze
Get segments.

### POST /api/marketing/automation/create
Create automation flow.

### GET /api/marketing/automation/create
Get automations.

### GET /api/marketing/ltv-cac/analyze
Analyze LTV vs CAC by channel.

### POST /api/marketing/trend/analyze
Create trend record.

### GET /api/marketing/trend/analyze
Get trends.

### POST /api/marketing/competitor/analyze
Analyze competitor.

### GET /api/marketing/competitor/analyze
Get competitors.

### GET /api/marketing/dashboard
Get marketing dashboard data.

## ✅ Phase 21 Checklist

- ✅ Prisma Models (8 models)
- ✅ Marketing Data Tracking
- ✅ Campaign Analytics
- ✅ AI Customer Segmentation
- ✅ AI Content Generator
- ✅ Growth Automation Flows
- ✅ LTV vs CAC Engine
- ✅ Trend & Competitor Analysis
- ✅ Marketing Dashboard API

## 🎉 Kết quả

Sau Phase 21, salon đã có:
- ✅ Hệ thống tracking marketing data đầy đủ
- ✅ AI phân tích hiệu quả kênh
- ✅ AI tạo content (Ads, Post, Reel, Scripts)
- ✅ AI phân loại khách thành 8 nhóm
- ✅ Automation flows tự động
- ✅ LTV vs CAC analysis
- ✅ Trend & competitor tracking
- ✅ Marketing dashboard

**Salon Chí Tâm = Vận hành theo chuẩn doanh nghiệp – automation 60%!**

