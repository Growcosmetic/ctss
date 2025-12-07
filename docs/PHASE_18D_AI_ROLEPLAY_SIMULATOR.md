# Phase 18D - AI Roleplay Simulator

Hệ thống mô phỏng AI đóng vai khách hàng - Chí Tâm Hair Salon.

## 🎯 Mục tiêu

Tạo hệ thống AI Roleplay để:
- AI đóng vai khách hàng y như thật
- Tạo tình huống thật - cảm xúc thật - hành vi thật
- Nhân viên tập trả lời
- AI chấm điểm và đưa feedback

## 📋 Roleplay Types (6 loại khách)

### 1. Khách khó tính
- Hỏi giá liên tục
- Soi mói kỹ thuật
- Nghi ngờ stylist
- Dễ nổi nóng nếu trả lời sai

### 2. Khách gấp
- Muốn làm ngay
- Test khả năng xử lý lịch
- Hối thúc

### 3. Khách chưa rõ nhu cầu
- Không biết làm gì
- Cần tư vấn
- Test kỹ năng phân tích nhu cầu

### 4. Khách sợ hư tóc
- Lo lắng tóc sẽ cháy/yếu
- Hỏi nhiều về rủi ro
- Test kỹ thuật + tâm lý

### 5. Khách muốn rẻ
- Hỏi giá liên tục
- Muốn giảm giá
- Test upsale mềm - tinh tế

### 6. Khách phàn nàn/tóc lỗi
- Tóc làm xong không ưng ý
- Test kỹ năng xử lý rủi ro theo SOP Mina

## 🗂️ Files Structure

```
prisma/
└── schema.prisma              # RoleplaySession model (đã có)

core/
└── prompts/
    ├── roleplayScenarioPrompt.ts  # Generate scenario
    └── roleplayBehaviorPrompt.ts  # AI đóng vai khách

app/
├── api/
│   └── training/
│       └── roleplay/
│           ├── start/
│           │   └── route.ts   # Start roleplay session
│           ├── chat/
│           │   └── route.ts   # Chat with AI customer
│           ├── evaluate/
│           │   └── route.ts   # Evaluate session
│           └── list/
│               └── route.ts   # List sessions
└── (dashboard)/
    └── training/
        └── roleplay/
            └── page.tsx       # Roleplay UI
```

## 📊 Prisma Model

### RoleplaySession
```prisma
model RoleplaySession {
  id          String   @id @default(cuid())
  userId      String
  role        String   // RECEPTIONIST | STYLIST | CSKH_ONLINE
  scenario    String
  persona     String
  messages    Json     // Array of chat messages
  score       Int?     // Overall score (0-100)
  assessment  Json?    // Detailed assessment
  feedback    Json?    // AI feedback
  status      String   // active | completed
}
```

## 🚀 API Endpoints

### POST /api/training/roleplay/start

Start new roleplay session.

**Request:**
```json
{
  "userId": "user_id",
  "customerType": "khach_kho_tinh",
  "role": "STYLIST"
}
```

**Response:**
```json
{
  "success": true,
  "session": {
    "id": "...",
    "scenario": "...",
    "persona": "...",
    "messages": [...]
  }
}
```

### POST /api/training/roleplay/chat

Send message to AI customer.

**Request:**
```json
{
  "sessionId": "session_id",
  "staffMessage": "Câu trả lời của nhân viên"
}
```

**Response:**
```json
{
  "success": true,
  "customerMessage": "Phản hồi của AI khách hàng",
  "emotion": "hài lòng",
  "shouldContinue": true,
  "session": {...}
}
```

### POST /api/training/roleplay/evaluate

Evaluate completed session.

**Request:**
```json
{
  "sessionId": "session_id"
}
```

**Response:**
```json
{
  "success": true,
  "session": {...},
  "evaluation": {
    "score": 87,
    "assessment": {
      "communication": {"score": 18, "comment": "..."},
      "technicalUnderstanding": {"score": 17, "comment": "..."},
      "problemSolving": {"score": 16, "comment": "..."},
      "upsale": {"score": 18, "comment": "..."},
      "customerExperience": {"score": 18, "comment": "..."}
    },
    "strengths": [...],
    "improvements": [...]
  }
}
```

### GET /api/training/roleplay/list

List roleplay sessions.

## 🎨 UI Features

### Roleplay Page
- Customer type selection (6 types)
- Role selection (Lễ tân, Stylist, CSKH Online)
- Chat interface (giống chat thật)
- Real-time AI responses
- Evaluation display
- Score breakdown (5 criteria)

### Chat Interface
- Customer messages (left)
- Staff messages (right)
- Emotion indicators
- Continue/End buttons

## 🤖 AI Features

### Scenario Generator
- AI tạo tình huống ngẫu nhiên
- Mô tả persona chi tiết
- Initial message tự nhiên

### Behavior Engine
- AI phản hồi như khách thật
- Giữ nguyên tính cách
- Phản ứng theo staff response
- Emotion tracking

### Evaluation Engine
- Chấm điểm theo 5 tiêu chí
- Detailed feedback
- Strengths & Improvements
- SOP compliance check

## ✅ Phase 18D Checklist

- ✅ Prisma Model (RoleplaySession)
- ✅ Scenario Generator Prompt
- ✅ Behavior Engine Prompt
- ✅ API Start Session
- ✅ API Chat (AI phản hồi)
- ✅ API Evaluate
- ✅ API List Sessions
- ✅ UI Roleplay Page
- ✅ Chat Interface
- ✅ Evaluation Display
- ✅ Skill Progress Integration

## 🎉 Kết quả

Sau Phase 18D, salon đã có:
- ✅ AI đóng vai khách hàng y như thật
- ✅ 6 loại khách hàng khác nhau
- ✅ Scenario generator tự động
- ✅ Chat interface giống thật
- ✅ AI chấm điểm chi tiết (5 criteria)
- ✅ Feedback & improvements
- ✅ Skill progress tracking
- ✅ Integration với certification

**Đây là hệ thống đào tạo salon mạnh nhất Việt Nam!**

