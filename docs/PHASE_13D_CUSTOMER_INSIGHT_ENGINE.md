# Phase 13D - AI Customer Insight Engine

Hệ thống AI phân tích khách hàng để tạo insights, dự đoán nhu cầu, và tìm cơ hội upsell.

## 🎯 Mục tiêu

AI Customer Insight Engine giúp salon:
- Biết khách thích kiểu gì
- Dự đoán nhu cầu lần tới
- Tìm sản phẩm phù hợp
- Theo dõi tần suất quay lại
- Đánh giá mức độ hài lòng
- Phát hiện nguy cơ churn
- Tìm cơ hội upsell

## 📊 Insight Categories

### 1. Personal Preferences (Sở thích cá nhân)
- Kiểu tóc khách thích
- Độ dài mong muốn
- Màu sắc ưa thích
- Sản phẩm hay hỏi

### 2. Technical Pattern (Thói quen làm kỹ thuật)
- Tần suất uốn
- Khoảng cách nhuộm
- Độ hư tổn qua từng lần
- Lịch sử hóa chất

### 3. Behavior Pattern (Hành vi quay lại)
- Bao lâu quay lại 1 lần
- Thời gian ưa thích đặt lịch
- Ngày/giờ khách hay đi
- Stylist yêu thích

### 4. Financial Segments (Khả năng chi tiêu)
- Chi tiêu trung bình
- Chi tiêu cao nhất
- Lifetime Value
- Gợi ý upsell phù hợp

### 5. Risk Signals (Tín hiệu rủi ro)
- Khách sắp "rời salon"
- Lâu chưa quay lại
- Phản hồi chưa tốt
- Lịch sử hư tổn cao

## 🗂️ Files Structure

```
core/
├── prompts/
│   └── customerInsightAnalysisPrompt.ts  # AI prompt cho insight analysis
├── customerJourney/
│   └── insightGenerator.ts               # Generator function
└── aiWorkflow/
    └── updateCustomerMemory.ts           # Auto-trigger insight (optional)

app/
├── api/
│   └── customer/
│       └── insight/
│           └── route.ts                  # Insight API endpoint
└── (dashboard)/
    └── customers/
        └── [phone]/
            └── insight/
                └── page.tsx              # Insight UI page

features/
└── customer360/
    └── components/
        └── CustomerInsightPanel.tsx      # Insight display component
```

## 🚀 Usage

### API Endpoint

```typescript
POST /api/customer/insight
{
  "customerId": "123",  // or "phone": "0123456789"
}
```

Response:
```json
{
  "success": true,
  "insight": {
    "summary": "...",
    "preferences": [...],
    "patterns": [...],
    "risks": [...],
    "opportunities": [...],
    "recommendations": [...],
    "financialSegment": {...},
    "loyaltyScore": 85,
    "churnProbability": 15,
    "nextVisitPrediction": "2024-12-25"
  }
}
```

### Programmatic Usage

```typescript
import { generateCustomerInsight } from "@/core/customerJourney/insightGenerator";

const insight = await generateCustomerInsight(customerId);
```

### React Component

```tsx
import { CustomerInsightPanel } from "@/features/customer360/components/CustomerInsightPanel";

<CustomerInsightPanel customerId="123" />
// or
<CustomerInsightPanel phone="0123456789" />
```

## 🔄 Auto-trigger Insight

Insight tự động được generate khi:
- Customer memory được update (nếu `ENABLE_AUTO_INSIGHT=true`)

To enable auto-trigger, add to `.env`:
```
ENABLE_AUTO_INSIGHT=true
```

**Note:** Auto-trigger is disabled by default for performance. You can manually call the insight API when needed.

## 📈 Insight Structure

```typescript
{
  summary: string;                    // Tóm tắt insight
  preferences: string[];              // Sở thích khách
  patterns: string[];                 // Hành vi & thói quen
  risks: RiskSignal[];                // Rủi ro
  opportunities: Opportunity[];       // Cơ hội upsell
  recommendations: Recommendation[];  // Gợi ý hành động
  financialSegment: {
    segment: "PREMIUM" | "STANDARD" | "BUDGET";
    avgSpend: number;
    maxSpend: number;
    lifetimeValue: number;
  };
  loyaltyScore: number;               // 0-100
  churnProbability: number;           // 0-100
  nextVisitPrediction: string | null; // Date
}
```

## 🎨 UI Features

- **Summary Card** - Tóm tắt insight tổng quan
- **Metrics Dashboard** - Loyalty score, churn probability, next visit prediction
- **Preferences Section** - Sở thích khách hàng
- **Patterns Section** - Hành vi & thói quen
- **Risks Section** - Rủi ro với mức độ và gợi ý giải pháp
- **Opportunities Section** - Cơ hội upsell với priority
- **Recommendations Section** - Gợi ý hành động với urgency
- **Financial Segment** - Phân khúc tài chính và chi tiêu

## 🔗 Integration

### With Customer360

Insight được tích hợp vào Customer360 module để hiển thị insights trong customer detail page.

### With Workflow Engine

Khi workflow chạy và update customer memory, insight có thể tự động được regenerate (if enabled).

## 📝 Notes

- Insight generation uses OpenAI GPT-4o-mini
- Response format is enforced as JSON
- Insight is saved to `CustomerProfile.insight` field
- Old insights are overwritten when new insight is generated
- For historical insights, consider adding an `InsightHistory` model

## 🎉 Result

Sau Phase 13D, salon có:
- ✅ AI phân tích hồ sơ khách chuyên sâu
- ✅ Tạo insights thông minh
- ✅ Đọc hành vi + sở thích
- ✅ Dự đoán nhu cầu → upsell tinh tế
- ✅ Phân loại khách (VIP / rủi ro / tiềm năng)
- ✅ Hệ thống như CRM AI của Sephora, L'Oréal Pro

Hồ sơ khách của salon bây giờ có **trí tuệ** — không còn là dữ liệu đơn thuần.

