# Phase 17G - CRM Automation Engine

Hệ thống CRM Automation Engine - Linh hồn cuối cùng của CRM 360° - Chí Tâm Hair Salon.

## 🎯 Mục tiêu

Tạo hệ thống automation để:
- Tự động chăm sóc khách hàng 24/7
- Tự động gửi tin theo hành vi, timeline, tag
- Tự động follow-up
- Tự động nhắc lịch
- Tự động upsale đúng khách
- Tự động gửi ưu đãi VIP
- Tự động kích hoạt lại khách lâu ngày
- Tự động dựa trên AI Insight từ 17F

## 📋 Automation Categories

### 1. Visit-based Automation
- Trigger: Sau khi khách làm dịch vụ
- Actions: Follow-up, tạo reminder, trigger AI insight

### 2. Time-based Automation
- Trigger: Theo thời gian (cron job)
- Examples: 6 tuần từ lần uốn, 4 tuần từ lần nhuộm

### 3. Tag-based Automation
- Trigger: Dựa trên tags từ Phase 17C
- Examples: VIP → gửi ưu đãi, Risky Hair → chăm sóc đặc biệt

### 4. AI Insight-based Automation
- Trigger: Dựa trên AI Insights từ Phase 17F
- Examples: HIGH churn risk → gửi follow-up

### 5. Event-based Automation
- Trigger: Sự kiện (sinh nhật, etc.)

### 6. Manual Trigger
- Trigger: Chạy tay từ UI hoặc API

## 🗂️ Files Structure

```
prisma/
└── schema.prisma              # Added AutomationFlow & AutomationLog models

core/
└── automation/
    └── runFlow.ts             # Workflow Engine

app/
├── api/
│   └── automation/
│       ├── trigger/
│       │   └── route.ts      # Trigger flow manually
│       ├── trigger-visit/
│       │   └── route.ts      # Trigger visit-based flows
│       ├── process/
│       │   └── route.ts      # Process time-based flows (Cron)
│       └── flow/
│           ├── create/
│           │   └── route.ts  # Create flow
│           ├── list/
│           │   └── route.ts  # List flows
│           ├── update/
│           │   └── route.ts  # Update flow
│           ├── delete/
│           │   └── route.ts  # Delete flow
│           └── init-examples/
│               └── route.ts  # Initialize example flows
└── (dashboard)/
    └── crm/
        └── automation/
            └── page.tsx      # Automation Builder UI
```

## 📊 Prisma Models

### AutomationFlow

```prisma
model AutomationFlow {
  id          String   @id @default(cuid())
  name        String
  description String?
  trigger     String   // visit | time | tag | ai | event | manual
  conditions  Json     // Điều kiện trigger
  actions     Json     // Danh sách actions
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  logs AutomationLog[]
}
```

### AutomationLog

```prisma
model AutomationLog {
  id          String   @id @default(cuid())
  flowId      String
  customerId  String
  action      String
  result      String   // success | failed | skipped
  metadata    Json?
  error       String?
  createdAt   DateTime @default(now())

  flow AutomationFlow @relation(...)
}
```

## 🚀 API Endpoints

### POST /api/automation/trigger

Trigger flow manually for a customer.

**Request:**
```json
{
  "flowId": "flow_id",
  "customerId": "customer_id"
}
```

### POST /api/automation/trigger-visit

Auto-trigger visit-based flows when visit is created.

### POST /api/automation/process

Process time-based automations (Cron Job).

### POST /api/automation/flow/create

Create new automation flow.

**Request:**
```json
{
  "name": "Follow-up sau khi làm dịch vụ",
  "description": "...",
  "trigger": "visit",
  "conditions": {...},
  "actions": [...],
  "active": true
}
```

### GET /api/automation/flow/list

List all automation flows.

### POST /api/automation/flow/update

Update automation flow.

### POST /api/automation/flow/delete

Delete automation flow.

### POST /api/automation/flow/init-examples

Initialize example flows for Chí Tâm Salon.

## ⚡ Supported Actions

### 1. sendMessage
Send message via Zalo/FB/SMS.

### 2. createReminder
Create reminder (Phase 17D).

### 3. updateCustomer
Update customer data.

### 4. createVisitNote
Add note to visit.

### 5. assignPreferredStylist
Assign preferred stylist.

### 6. triggerAIInsight
Trigger AI insight generation (Phase 17F).

### 7. addTag / removeTag
Manage customer tags (Phase 17C).

## 🎨 UI Features

### Automation Builder
- Create/Edit/Delete flows
- Toggle flow active/inactive
- View flow conditions and actions
- Initialize example flows
- View execution logs count

## 🔗 Tích hợp

### Phase 17C - Tags
- Tag-based triggers
- Add/remove tags via actions

### Phase 17D - Reminders
- Create reminders via actions
- Auto-trigger visit-based flows

### Phase 17F - AI Insights
- AI-based triggers
- Trigger AI insight generation

### Phase 17B - Visit Timeline
- Auto-trigger on visit creation
- Create visit notes via actions

## ✅ Phase 17G Checklist

- ✅ Prisma Models (AutomationFlow, AutomationLog)
- ✅ Automation Trigger Rules
- ✅ Automation Actions (8 types)
- ✅ Workflow Engine
- ✅ API Trigger Flow
- ✅ API Trigger Visit-based
- ✅ API Process Time-based (Cron)
- ✅ API CRUD Flows
- ✅ UI Automation Builder
- ✅ Integration with 17C, 17D, 17F
- ✅ Example Flows (3 flows)

## 🎉 Kết quả

Sau Phase 17G, salon đã có:
- ✅ Tự động chăm sóc khách hàng 24/7
- ✅ Tự động follow-up
- ✅ Tự động nhắc lịch
- ✅ Tự động upsale
- ✅ Tự động gửi ưu đãi
- ✅ Tự động kích hoạt lại khách
- ✅ Tích hợp với AI Insights
- ✅ Automation Builder UI
- ✅ 6 loại automation triggers
- ✅ 8 loại automation actions

**Salon Chí Tâm chính thức có CRM automation mạnh nhất Việt Nam!**

## 📊 Example Flows

### Flow 1: Follow-up sau khi làm dịch vụ
- Trigger: Visit (Uốn, Nhuộm, Phục hồi)
- Actions: Create follow-up reminder, Create recovery reminder, Trigger AI insight

### Flow 2: Quay lại uốn 6 tuần
- Trigger: Time + Tag "Hay uốn"
- Actions: Send message, Create reminder

### Flow 3: Giữ chân khách sắp mất
- Trigger: AI Insight (churnRisk = HIGH)
- Actions: Send message, Create urgent reminder, Trigger AI insight

