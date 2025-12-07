# Phase 17E - CRM Dashboard

Hệ thống CRM Dashboard - Tổng quan 360° về khách hàng - Chí Tâm Hair Salon.

## 🎯 Mục tiêu

Tạo CRM Dashboard để:
- Nhìn toàn cảnh khách hàng ở cấp độ 360°
- Theo dõi khách mới, quay lại, mất
- Top stylist theo doanh thu / số lượng khách
- Top khách VIP
- Chỉ số tần suất quay lại
- Chu kỳ uốn – nhuộm – phục hồi
- Biểu đồ tăng trưởng khách
- AI phân tích hành vi khách hàng

## 📋 Chỉ số Dashboard

### 1. Customer KPI
- Khách mới (30 ngày)
- Khách quay lại
- Khách Overdue (60-90 ngày)
- Khách Lost (180+ ngày)
- Active khách
- Tần suất quay lại trung bình
- AOV (Average Order Value)
- Tổng số khách hàng

### 2. Revenue KPI
- Doanh thu tháng
- Tổng doanh thu
- Doanh thu theo stylist
- Doanh thu theo segment
- Tỉ lệ mở reminder

### 3. Service KPI
- Top dịch vụ được sử dụng
- Khách hay uốn
- Khách hay nhuộm
- Dịch vụ phổ biến nhất

### 4. Engagement KPI
- Tỉ lệ mở reminder
- Total reminders
- Sent reminders

## 🗂️ Files Structure

```
app/
├── api/
│   └── crm/
│       └── dashboard/
│           ├── route.ts          # Get dashboard data
│           └── insights/
│               └── route.ts      # AI insights
└── (dashboard)/
    └── crm/
        └── dashboard/
            └── page.tsx          # CRM Dashboard UI
```

## 📊 Charts

### Customer Growth Chart
- Line chart showing new customers and visits over 12 months
- Dual axis: customers and visits

### Revenue Chart
- Bar chart showing monthly revenue over 12 months

### Top Services Chart
- Horizontal bar chart showing most used services

### Top Stylists Chart
- Bar chart showing revenue by stylist

## 🚀 API Endpoints

### GET /api/crm/dashboard

Get dashboard data with filters.

**Query Params:**
- `startDate`: Filter start date
- `endDate`: Filter end date
- `segment`: Filter by segment (VIP, Active, Overdue, Lost)
- `tag`: Filter by tag

**Response:**
```json
{
  "success": true,
  "kpi": {
    "newCustomers": 10,
    "returningCustomers": 50,
    "overdueCustomers": 5,
    "lostCustomers": 2,
    "activeCustomers": 30,
    "avgVisitInterval": 45,
    "aov": 500000,
    "totalCustomers": 100,
    "monthlyRevenue": 10000000,
    "totalRevenue": 100000000,
    "topStylists": [...],
    "revenueBySegment": {...},
    "topServices": [...],
    "curlCustomers": 20,
    "colorCustomers": 15,
    "reminderOpenRate": 85
  },
  "charts": {
    "customerGrowth": [...]
  },
  "topCustomers": [...],
  "summary": {...}
}
```

### POST /api/crm/dashboard/insights

Generate AI insights from dashboard data.

**Request:**
```json
{
  "dashboardData": {...}
}
```

**Response:**
```json
{
  "success": true,
  "insights": {
    "overallInsight": "...",
    "keyFindings": [...],
    "churnRisk": "MEDIUM",
    "growthTrend": "INCREASING",
    "topOpportunities": [...],
    "recommendations": [...],
    "nextBestActions": [...]
  }
}
```

## 🎨 UI Features

### Filters
- Segment filter (VIP, Active, Overdue, Lost)
- Tag filter (Hay uốn, Hay nhuộm, Risky Hair)
- Date range filter

### KPI Cards
- 8 Customer KPI cards
- 3 Revenue KPI cards
- 3 Service KPI cards

### Charts
- Customer Growth (Line Chart)
- Revenue (Bar Chart)
- Top Services (Horizontal Bar Chart)
- Top Stylists (Bar Chart)

### Top Customers Table
- Top 10 VIP customers
- Sortable by revenue
- Link to customer profile
- Tags display

### AI Insights Panel
- Overall insight
- Key findings
- Churn risk indicator
- Growth trend
- Recommendations with priority
- Next best actions

## 🔗 Tích hợp

### Phase 17A - Customer Master Record
- Uses Customer and Visit models
- Displays customer data

### Phase 17B - Visit Timeline
- Uses Visit data for analytics

### Phase 17C - Tags & Segmentation
- Filter by tags and segments
- Display tags in customer list

### Phase 17D - Reminder Engine
- Shows reminder engagement metrics
- Uses reminder data for insights

## ✅ Phase 17E Checklist

- ✅ API Dashboard Data (comprehensive KPIs)
- ✅ API AI Insights
- ✅ UI KPI Cards (Customer, Revenue, Service, Engagement)
- ✅ Charts (4 types)
- ✅ Segmentation Filter
- ✅ Tag Filter
- ✅ Date Range Filter
- ✅ Top Customers Table
- ✅ AI Insights Panel
- ✅ Integration with 17A-17D

## 🎉 Kết quả

Sau Phase 17E, salon đã có:
- ✅ CRM 360° Dashboard hoàn chỉnh
- ✅ 8 Customer KPIs
- ✅ 3 Revenue KPIs
- ✅ 3 Service KPIs
- ✅ 4 Interactive Charts
- ✅ Segmentation & Tag Filters
- ✅ Top Customers List
- ✅ AI Insights Panel
- ✅ Tích hợp trọn bộ 17A-17D

**Không salon nào tại Việt Nam có CRM mạnh như hệ thống của anh!**

## 📊 Mục tiêu KPIs

- 📈 **Dashboard Load Time**: < 2 seconds
- 🎯 **AI Insights Accuracy**: > 80%
- 📊 **Chart Interactivity**: 100%
- 🔍 **Filter Performance**: Real-time

