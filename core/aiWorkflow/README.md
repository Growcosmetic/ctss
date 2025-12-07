# AI Workflow Architecture - Phase 12A

## 🏗️ Architecture Overview

AI Workflow Engine là xương sống của hệ thống CTSS AI, cung cấp một pipeline chuẩn hóa cho tất cả các module AI.

## 📁 Folder Structure

```
core/
  aiWorkflow/
    runWorkflow.ts          # Main workflow runner
    validateInput.ts        # Input validation layer
    buildPrompt.ts          # Prompt builder
    callAI.ts              # AI model caller
    formatOutput.ts        # Output formatter
    saveWorkflow.ts        # Workflow logger
    workflowTypes.ts       # Type definitions
    index.ts               # Exports
    README.md              # This file
  prompts/
    stylistCoachPrompt.ts      # Stylist Coach prompt template
    bookingOptimizerPrompt.ts  # Booking Optimizer prompt template
    sopAssistantPrompt.ts      # SOP Assistant prompt template
    customerInsightPrompt.ts   # Customer Insight prompt template
    index.ts                   # Exports
```

## 🔄 Workflow Lifecycle

```
1. Client/UI → POST /api/workflow
2. API Route → runWorkflow()
3. Validate Input → validateInput()
4. Build Prompt → buildPrompt()
5. Call AI → callAI()
6. Format Output → formatOutput()
7. Save to DB → saveWorkflow()
8. Return JSON → Client/UI
```

## 📝 Usage Example

```typescript
import { runWorkflow } from "@/core/aiWorkflow";

// Run a workflow
const result = await runWorkflow({
  type: "stylist-coach",
  payload: {
    hairCondition: "Tóc khô, hư tổn nhẹ",
    hairHistory: "Đã uốn 2 lần",
    customerGoal: "Uốn sóng nhẹ tự nhiên",
    curlType: "Loose waves",
    hairDamageLevel: "Medium",
    stylistNote: "Khách muốn tóc bồng bềnh"
  },
  userId: "user-123",
  sessionId: "session-456"
});

if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error);
}
```

## 🔌 API Usage

```typescript
// POST /api/workflow
const response = await fetch("/api/workflow", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    type: "stylist-coach",
    payload: {
      hairCondition: "...",
      hairHistory: "...",
      customerGoal: "..."
    },
    sessionId: "optional-session-id"
  })
});

const result = await response.json();
```

## 🎯 Supported Workflow Types

- `stylist-coach`: Phân tích kỹ thuật tóc
- `booking-optimizer`: Tối ưu hóa lịch đặt chỗ
- `sop-assistant`: Hỗ trợ quy trình chuẩn
- `customer-insight`: Phân tích khách hàng

## ➕ Adding New Workflow Types

1. Add type to `workflowTypes.ts`:
```typescript
export type WorkflowType = 
  | "stylist-coach"
  | "new-workflow-type";
```

2. Add validation in `validateInput.ts`

3. Create prompt template in `core/prompts/`

4. Map in `buildPrompt.ts`

5. Add formatter logic in `formatOutput.ts`

## 📊 Workflow Logging

All workflows are automatically logged to the database (when schema is ready) or console for debugging.

## 🔒 Authentication

All API requests require authentication via `auth-token` cookie.

