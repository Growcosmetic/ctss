# Phase 13E - Multi-Channel Integration

Hệ thống hợp nhất tất cả các kênh (Zalo, Facebook, Instagram, Website) vào một AI Engine duy nhất.

## 🎯 Mục tiêu

Tất cả khách từ mọi nền tảng đều:
- Đi vào 1 pipeline duy nhất
- 1 AI duy nhất xử lý
- 1 Customer Profile duy nhất
- 1 Customer Journey State Machine duy nhất

**Giống như hệ thống Omni-channel của các thương hiệu lớn (Sephora, L'Oréal, Aesop).**

## 🏗️ Kiến trúc

```
Zalo OA Webhook  ┐
Facebook Webhook ┤ → Channel Normalizer → Message Router → AI Workflow Engine → Customer Profile
IG DM Webhook    ┤
Website Chatbot  ┘
```

## 📊 UnifiedMessage Format

Tất cả kênh được chuẩn hóa về format thống nhất:

```typescript
interface UnifiedMessage {
  phone?: string;
  platform: "zalo" | "facebook" | "instagram" | "website";
  customerId: string; // Platform-specific ID
  message: string;
  attachments?: ChannelAttachment[];
  timestamp: number;
  metadata?: Record<string, any>;
}
```

## 🗂️ Files Structure

```
core/
└── channel/
    ├── types.ts          # Type definitions
    ├── normalizer.ts     # Channel normalizers
    ├── messageRouter.ts  # Message routing logic
    └── index.ts          # Exports

app/
└── api/
    └── channel/
        ├── intake/
        │   └── route.ts  # Unified intake API
        └── webhook/
            ├── zalo/
            │   └── route.ts
            ├── facebook/
            │   └── route.ts
            └── instagram/
                └── route.ts

features/
└── chat/
    └── hooks/
        └── useChannelChat.ts  # React hook for website chat
```

## 🚀 Usage

### Unified Intake API

```typescript
POST /api/channel/intake
{
  "platform": "website",  // zalo | facebook | instagram | website
  "customerId": "sessionId",
  "phone": "0123456789",  // optional
  "message": "Tôi muốn đặt lịch",
  "attachments": []       // optional
}
```

Response:
```json
{
  "success": true,
  "reply": "AI response message",
  "customerId": "customer-id",
  "workflowType": "booking-optimizer",
  "intent": "booking_request"
}
```

### React Hook (Website Chat)

```tsx
import { useChannelChat } from "@/features/chat/hooks/useChannelChat";

const { sendMessage, loading, error } = useChannelChat("session-id");

const handleSend = async () => {
  const reply = await sendMessage("Tôi muốn đặt lịch", "0123456789");
  console.log(reply);
};
```

## 🔌 Webhook Configuration

### Zalo OA

1. Vào Zalo OA Admin → API → Webhook
2. Set Webhook URL: `https://your-domain.com/api/channel/webhook/zalo`
3. Set Verify Token (trong `.env`): `ZALO_OA_VERIFY_TOKEN=your-token`

### Facebook Messenger

1. Vào Facebook App → Messenger → Webhooks
2. Set Callback URL: `https://your-domain.com/api/channel/webhook/facebook`
3. Set Verify Token (trong `.env`): `FACEBOOK_VERIFY_TOKEN=your-token`

### Instagram DM

1. Vào Facebook App → Instagram → Webhooks
2. Set Callback URL: `https://your-domain.com/api/channel/webhook/instagram`
3. Set Verify Token (trong `.env`): `INSTAGRAM_VERIFY_TOKEN=your-token`

## 🧠 Message Routing

Hệ thống tự động route message đến workflow phù hợp:

- **Stylist Coach**: "phân tích tóc", "uốn được không", "tóc khô", "gợi ý kỹ thuật"
- **Booking Optimizer**: "đặt lịch", "book", "khi nào rảnh", "giờ mở cửa"
- **SOP Assistant**: "quy trình", "sop", "cách làm", "bước nào"
- **Customer Insight** (default): General conversation

## 🔄 Auto Integration

Khi message được xử lý:

1. **Normalize** - Chuẩn hóa về UnifiedMessage
2. **Create/Update Profile** - Tạo hoặc cập nhật CustomerProfile
3. **Save Chat History** - Lưu vào `chatHistory`
4. **Route Message** - Xác định workflow phù hợp
5. **Run AI Workflow** - Chạy AI và lấy response
6. **Update Journey State** - Tự động chuyển journey state
7. **Return Reply** - Trả về reply cho channel

## 📝 Environment Variables

```env
# App URL (for internal API calls)
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Webhook Verify Tokens
ZALO_OA_VERIFY_TOKEN=your-zalo-token
FACEBOOK_VERIFY_TOKEN=your-facebook-token
INSTAGRAM_VERIFY_TOKEN=your-instagram-token

# Platform API Keys (for sending replies)
ZALO_OA_ACCESS_TOKEN=your-access-token
FACEBOOK_PAGE_ACCESS_TOKEN=your-page-token
INSTAGRAM_ACCESS_TOKEN=your-instagram-token
```

## 🔐 Security

- Webhook signature verification (TODO: implement)
- Token-based authentication
- Rate limiting (recommended)
- Input validation

## 📱 Channel-Specific Features

### Zalo OA
- User ID mapping
- Phone number extraction
- Media attachments support

### Facebook Messenger
- PSID (Page-Scoped ID) mapping
- Page ID tracking
- Messenger extensions

### Instagram DM
- IG User ID mapping
- Direct message support
- Story mentions (future)

### Website Chat
- Session ID tracking
- User metadata (IP, User Agent)
- Real-time responses

## 🔗 Integration Points

### With Customer Profile
- Auto-create profile on first message
- Update chat history
- Link platform IDs

### With Journey State Machine
- Auto-transition based on intent
- Track customer journey across platforms

### With AI Workflow Engine
- Route to appropriate workflow
- Save results to memory
- Generate insights

### With Memory System
- Store chat history
- Update preferences
- Track behavior patterns

## 🎉 Result

Sau Phase 13E, salon có:
- ✅ Hợp nhất tất cả kênh Zalo – Facebook – IG – Website
- ✅ 1 API duy nhất xử lý mọi tin nhắn
- ✅ Tất cả dữ liệu đưa về CustomerProfile
- ✅ Mọi tin nhắn cập nhật vào Memory System
- ✅ AI trả lời theo trạng thái hành trình khách
- ✅ Dựa trên trí nhớ dài hạn
- ✅ Tự động phân tích insight

**Salon bây giờ có hệ thống Omni-channel AI như một thương hiệu enterprise.**

