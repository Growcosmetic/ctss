# Customer Journey Module

Module quản lý hành trình khách hàng qua 6 giai đoạn chuẩn salon.

## 🎯 6 Giai Đoạn

1. **AWARENESS** - Khách biết đến salon
2. **CONSIDERATION** - Khách tìm hiểu & hỏi
3. **BOOKING** - Đặt lịch
4. **IN_SALON** - Khách đến salon
5. **POST_SERVICE** - Chăm sóc sau dịch vụ
6. **RETENTION** - Giữ chân khách

## 📁 Cấu Trúc

```
core/customerJourney/
├── types.ts           # Type definitions
├── stateMachine.ts    # State machine logic
├── transitionEngine.ts # Transition engine
├── utils.ts           # Utility functions
├── memoryService.ts   # Customer memory service
└── index.ts           # Exports
```

## 🚀 Usage

### API Route

```typescript
POST /api/customer/journey/state
{
  "customerId": "123",
  "event": "customer-requests-booking"
}
```

### React Hook

```typescript
import { useCustomerJourney } from "@/features/customer360/hooks/useCustomerJourney";

const { transitionState, loading, error } = useCustomerJourney();

await transitionState(customerId, "customer-requests-booking");
```

### State Machine

```typescript
import { getNextState, canTransition } from "@/core/customerJourney";

const nextState = getNextState("CONSIDERATION", "customer-requests-booking");
// Returns: "BOOKING"
```

### Customer Memory

```typescript
import { getCustomerMemorySummary } from "@/core/customerJourney";

const { profile, summary } = await getCustomerMemorySummary(customerId);
```

### Auto-transition from Workflow

Workflow engine tự động chuyển state khi:
- `stylist-coach` → `IN_SALON` → `POST_SERVICE`
- `booking-optimizer` → `CONSIDERATION` → `BOOKING`
- `customer-insight` → `POST_SERVICE` → `RETENTION`

## 📊 Events

- `customer-asks-question` → CONSIDERATION
- `customer-requests-booking` → BOOKING
- `customer-arrives-salon` → IN_SALON
- `service-completed` → POST_SERVICE
- `customer-feedback-positive` → RETENTION
- `retention-period-complete` → CONSIDERATION

## 🧠 Customer Memory System

Hệ thống lưu trữ trí nhớ AI về từng khách hàng:

- **preferences** - Sở thích khách
- **hairHistory** - Lịch sử hóa chất
- **technicalHistory** - Lịch sử kỹ thuật từ Stylist Coach
- **bookingHistory** - Lịch sử đặt lịch
- **chatHistory** - Tóm tắt hội thoại AI
- **insight** - AI phân tích hành vi

### Auto-update từ Workflows

Khi workflow chạy, memory tự động cập nhật:
- `stylist-coach` → cập nhật `technicalHistory`
- `booking-optimizer` → cập nhật `bookingHistory`
- `customer-insight` → cập nhật `insight`
- `sop-assistant` → cập nhật `hairHistory`
