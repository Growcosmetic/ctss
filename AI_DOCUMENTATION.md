# CTSS AI Functions Documentation

Tài liệu về các hàm AI sử dụng OpenAI API để sinh insight cho CTSS.

## 📋 Tổng quan

Tất cả các hàm AI được đặt trong thư mục `/lib/ai/` và có API routes tương ứng trong `/app/api/ai/`.

## 🔑 Setup

### 1. Cài đặt OpenAI package

```bash
npm install openai
```

### 2. Cấu hình Environment Variables

Thêm vào file `.env`:

```env
OPENAI_API_KEY=your-openai-api-key-here
```

### 3. Model Configuration

Mặc định sử dụng `gpt-4o`. Để sử dụng GPT-5.1 (khi có), cập nhật trong các hàm AI:

```typescript
const model = process.env.OPENAI_MODEL || "gpt-4o"; // hoặc "gpt-5.1"
```

## 🤖 AI Functions

### 1. getUpsellSuggestions(customerId)

**Mô tả:** Phân tích lịch sử mua hàng của khách hàng và đề xuất sản phẩm/dịch vụ phù hợp để upsell.

**Location:** `lib/ai/upsell.ts`

**API:** `GET /api/ai/upsell?customerId=xxx`

**Input:**
- `customerId`: ID khách hàng

**Output:**
```typescript
interface UpsellSuggestion {
  productId?: string;
  serviceId?: string;
  name: string;
  reason: string;
  confidence: number; // 0-100
  estimatedValue: number;
}
```

**Ví dụ:**
```typescript
const suggestions = await getUpsellSuggestions("customer-123");
// Returns: Array of upsell suggestions
```

**Logic:**
- Phân tích lịch sử mua hàng và đặt lịch
- Tìm sản phẩm/dịch vụ bổ sung
- Đề xuất dịch vụ cao cấp hơn
- Gợi ý sản phẩm chưa thử

---

### 2. getInventoryForecast(productId)

**Mô tả:** Dự đoán nhu cầu tồn kho cho sản phẩm dựa trên lịch sử bán hàng và xu hướng.

**Location:** `lib/ai/inventory.ts`

**API:** `GET /api/ai/inventory-forecast?productId=xxx`

**Input:**
- `productId`: ID sản phẩm

**Output:**
```typescript
interface InventoryForecast {
  productId: string;
  productName: string;
  currentStock: number;
  predictedDemand: number; // Units needed in next 30 days
  recommendedOrder: number; // Units to order
  forecastDate: string;
  confidence: number; // 0-100
  reasoning: string;
  urgency: "low" | "medium" | "high";
}
```

**Ví dụ:**
```typescript
const forecast = await getInventoryForecast("product-123");
// Returns: Forecast with recommendations
```

**Logic:**
- Phân tích lịch sử bán hàng theo tháng
- Tính toán sales velocity
- Dự đoán nhu cầu 30 ngày tới
- Đề xuất số lượng đặt hàng
- Đánh giá mức độ khẩn cấp

---

### 3. getBookingPrediction(customerId)

**Mô tả:** Dự đoán khi khách hàng sẽ đặt lịch tiếp theo và đề xuất dịch vụ phù hợp.

**Location:** `lib/ai/booking.ts`

**API:** `GET /api/ai/booking-prediction?customerId=xxx`

**Input:**
- `customerId`: ID khách hàng

**Output:**
```typescript
interface BookingPrediction {
  customerId: string;
  predictedNextVisit: string; // ISO date
  confidence: number; // 0-100
  recommendedServices: Array<{
    serviceId: string;
    serviceName: string;
    reason: string;
  }>;
  bestTimeSlots: Array<{
    dayOfWeek: string;
    timeRange: string;
    reason: string;
  }>;
  reasoning: string;
}
```

**Ví dụ:**
```typescript
const prediction = await getBookingPrediction("customer-123");
// Returns: Prediction with next visit date and recommendations
```

**Logic:**
- Phân tích khoảng thời gian giữa các lần đặt lịch
- Xác định ngày và giờ ưa thích
- Đề xuất dịch vụ dựa trên lịch sử
- Gợi ý time slots phù hợp

---

### 4. getStaffPerformanceAnalysis(staffId, period)

**Mô tả:** Phân tích hiệu suất nhân viên và đưa ra insights, điểm mạnh, điểm yếu, và khuyến nghị.

**Location:** `lib/ai/staff.ts`

**API:** `GET /api/ai/staff-performance?staffId=xxx&period=MONTHLY`

**Input:**
- `staffId`: ID nhân viên
- `period`: "WEEKLY" | "MONTHLY" | "YEARLY" (default: "MONTHLY")

**Output:**
```typescript
interface StaffPerformanceAnalysis {
  staffId: string;
  employeeId: string;
  period: string;
  overallScore: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  revenueAnalysis: {
    totalRevenue: number;
    averageOrderValue: number;
    growth: number;
  };
  bookingAnalysis: {
    totalBookings: number;
    completionRate: number;
    averageRating?: number;
  };
  comparison: {
    rank: number;
    percentile: number;
  };
  insights: string[];
}
```

**Ví dụ:**
```typescript
const analysis = await getStaffPerformanceAnalysis("staff-123", "MONTHLY");
// Returns: Comprehensive performance analysis
```

**Logic:**
- Phân tích doanh thu và đơn hàng
- Tính toán completion rate
- So sánh với nhân viên khác
- Xác định điểm mạnh/yếu
- Đưa ra khuyến nghị cải thiện

---

### 5. getBusinessInsights()

**Mô tả:** Phân tích tổng thể doanh nghiệp và đưa ra insights đa chiều về revenue, customer, staff, inventory, booking.

**Location:** `lib/ai/business.ts`

**API:** `GET /api/ai/business-insights`

**Input:** None

**Output:**
```typescript
interface BusinessInsight {
  type: "revenue" | "customer" | "staff" | "inventory" | "booking" | "general";
  title: string;
  message: string;
  priority: "low" | "medium" | "high";
  actionable: boolean;
  actionItems?: string[];
  metrics?: {
    current: number;
    target?: number;
    trend?: "up" | "down" | "stable";
  };
  confidence: number; // 0-100
}
```

**Ví dụ:**
```typescript
const insights = await getBusinessInsights();
// Returns: Array of business insights
```

**Logic:**
- Phân tích revenue trends
- Đánh giá customer growth
- Phân tích staff performance
- Kiểm tra inventory status
- Tối ưu booking patterns
- Đưa ra actionable recommendations

---

## 📊 AI Logging

Tất cả các lần gọi AI đều được log vào bảng `ai_logs` với:
- Type: Loại AI call
- Input/Output: Dữ liệu đầu vào và kết quả
- Model: Model được sử dụng
- Duration: Thời gian xử lý
- Status: SUCCESS/FAILED
- Tokens & Cost: (nếu có)

## 🔧 Utility Functions

### callOpenAI(prompt, systemPrompt?, model?)

Gọi OpenAI API và trả về text response.

### callOpenAIJSON(prompt, systemPrompt?, model?)

Gọi OpenAI API và parse JSON response.

### logAIUsage(type, input, output, model, tokens?, cost?, duration?)

Log AI usage vào database.

## 🚀 Usage Examples

### Trong API Routes

```typescript
import { getUpsellSuggestions } from "@/lib/ai/upsell";

export async function GET(request: NextRequest) {
  const customerId = request.nextUrl.searchParams.get("customerId");
  const suggestions = await getUpsellSuggestions(customerId!);
  return successResponse(suggestions);
}
```

### Trong Client Components

```typescript
"use client";

const fetchUpsellSuggestions = async (customerId: string) => {
  const response = await fetch(`/api/ai/upsell?customerId=${customerId}`);
  const result = await response.json();
  if (result.success) {
    return result.data;
  }
};
```

## ⚙️ Configuration

### Model Selection

Để thay đổi model, cập nhật trong `.env`:

```env
OPENAI_MODEL=gpt-4o
# hoặc khi GPT-5.1 có sẵn:
OPENAI_MODEL=gpt-5.1
```

### Temperature & Tokens

Có thể điều chỉnh trong `lib/ai/openai.ts`:

```typescript
temperature: 0.7, // 0-2, higher = more creative
max_tokens: 1000, // Maximum response length
```

## 🛡️ Error Handling

Tất cả các hàm AI đều có:
- Try-catch error handling
- Fallback logic khi AI fails
- Graceful degradation
- Error logging

## 📝 Best Practices

1. **Caching:** Cache AI responses khi có thể để giảm cost
2. **Rate Limiting:** Implement rate limiting cho AI endpoints
3. **Cost Monitoring:** Track AI usage costs qua ai_logs
4. **Fallback:** Luôn có fallback logic khi AI fails
5. **Validation:** Validate input trước khi gọi AI

## 🔒 Security

- API key được lưu trong environment variables
- Không expose API key trong client code
- Validate user permissions trước khi gọi AI
- Sanitize input data

---

*Last updated: 2024*

