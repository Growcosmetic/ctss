# Phase 15D - Simulation Engine

Hệ thống AI mô phỏng khách hàng để stylist luyện tập tư vấn như ngoài salon.

## 🎯 Mục tiêu

Tạo môi trường luyện tập thực tế cho stylist:
- AI đóng vai khách hàng với nhiều tính cách
- Tình huống thực tế: uốn, nhuộm, tóc hư tổn, khách khó, VIP
- Stylist chat với AI → AI chấm điểm kỹ năng
- Phân tích: tư vấn, đặt câu hỏi, gợi ý sản phẩm, xử lý lo lắng, chốt dịch vụ
- Lưu transcript và đánh giá
- Foundation for Certification (Phase 15F)

## 📋 Tính năng

1. **AI Customer Simulation**:
   - Multiple personas (dễ thương, khó tính, VIP, ít nói...)
   - Realistic scenarios
   - Natural conversation flow
   - Context-aware responses

2. **Real-time Evaluation**:
   - 5 skill dimensions (0-10 each)
   - Overall score (0-100)
   - Detailed feedback
   - Strengths & improvements

3. **Session Management**:
   - Start/end sessions
   - Save conversation transcript
   - Track performance over time

## 🗂️ Database Schema

```prisma
model SimulationSession {
  id        String   @id @default(cuid())
  userId    String
  scenario  String
  persona   String
  messages  Json     // Array of chat messages
  score     Int?     // Overall score (0-100)
  feedback  Json?    // Detailed evaluation feedback
  status    String   @default("active") // active | completed
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User @relation(...)
}
```

## 🚀 API Endpoints

### 1. Start Simulation

```
POST /api/training/simulation/start
{
  "userId": "...",
  "scenario": "Tóc hư tổn sau tẩy, khách muốn uốn nhưng lo sợ",
  "persona": "khách dễ thương"
}
```

**Response:**
```json
{
  "success": true,
  "session": {
    "id": "...",
    "userId": "...",
    "scenario": "...",
    "persona": "...",
    "status": "active",
    "messages": [...]
  },
  "initialMessage": "Xin chào, em cần tư vấn về tóc..."
}
```

### 2. Chat

```
POST /api/training/simulation/chat
{
  "sessionId": "...",
  "message": "Chào bạn, bạn có thể cho em biết tình trạng tóc hiện tại không?"
}
```

**Response:**
```json
{
  "success": true,
  "reply": "Dạ em ơi, tóc em vừa tẩy xong, giờ khá khô và hư tổn...",
  "evaluation": {
    "scores": {
      "questioning": 8,
      "analysis": 7,
      "suggestion": 6,
      "emotion": 7,
      "closing": 5
    },
    "overallScore": 66,
    "feedback": "...",
    "strengths": [...],
    "improvements": [...]
  }
}
```

### 3. End Session

```
POST /api/training/simulation/end
{
  "sessionId": "..."
}
```

## 🎨 UI Page

**Path:** `/training/simulation`

**Features:**
- Setup form (scenario, persona)
- Chat interface (ChatGPT-like)
- Real-time evaluation display
- Score breakdown
- Strengths & improvements
- Session management

**Personas:**
- Khách dễ thương
- Khách khó tính
- Khách chậm hiểu
- Khách VIP sang
- Khách thiếu kiên nhẫn
- Khách ít nói

**Scenarios:**
- Tóc hư tổn sau tẩy, khách muốn uốn
- Khách muốn nhuộm màu mới
- Tóc xoăn tự nhiên, khách muốn duỗi thẳng
- Tóc mỏng, muốn làm dày và có độ phồng
- Muốn layer kiểu Hàn nhưng sợ bị hỏng

## 📊 Evaluation Criteria

### 5 Skill Dimensions (0-10 each):

1. **questioning** (Đặt câu hỏi):
   - Đặt câu hỏi đúng trọng tâm
   - Đủ thông tin để phân tích
   - Câu hỏi chuyên nghiệp, lịch sự

2. **analysis** (Phân tích):
   - Nhận diện đúng vấn đề
   - Phân tích tình trạng tóc chính xác
   - Hiểu nhu cầu và mong muốn

3. **suggestion** (Gợi ý):
   - Gợi ý phù hợp với tình trạng tóc
   - Phù hợp với mong muốn khách
   - Giải thích rõ ràng lý do

4. **emotion** (Xử lý cảm xúc):
   - Nhận diện cảm xúc, lo lắng
   - An ủi, trấn an hợp lý
   - Xử lý khách khó tính

5. **closing** (Chốt dịch vụ):
   - Chốt dịch vụ tự nhiên, không ép buộc
   - Xác nhận lại mong muốn
   - Đặt lịch hẹn rõ ràng

### Scoring:
- 8-10: Xuất sắc
- 6-7: Tốt
- 4-5: Trung bình
- 0-3: Yếu

## 🔧 Technical Details

### AI Models
- Customer Simulation: `gpt-4o-mini` (temperature: 0.8)
- Evaluation: `gpt-4o-mini` (temperature: 0.5)

### Evaluation Frequency
- Evaluate every 2 stylist messages (to reduce API calls)
- Final evaluation on session end

### Conversation Flow
- System prompt sets persona and scenario
- Conversation history maintained throughout session
- Context-aware responses based on persona

## ✅ Phase 15D Checklist

- ✅ Prisma model (SimulationSession)
- ✅ Simulation prompt
- ✅ Evaluation engine
- ✅ API: Start session
- ✅ API: Chat & real-time evaluation
- ✅ API: End session
- ✅ UI: Simulation interface
- ✅ UI: Evaluation display
- ✅ Error handling
- ✅ Documentation

## 🎯 Next Steps (Phase 15E)

- Skill Tracking Dashboard
- Progress visualization
- Performance analytics
- Learning path recommendations

## 🎉 Kết quả

Sau Phase 15D, salon đã có:
- ✅ AI đóng vai khách thật
- ✅ Hiển thị theo tính cách khách
- ✅ Stylist chat → AI phản hồi tự nhiên
- ✅ AI chấm điểm theo 5 kỹ năng cốt lõi
- ✅ Feedback cải thiện theo chuẩn salon
- ✅ Lưu log toàn bộ buổi mô phỏng
- ✅ Nền tảng cho cấp chứng chỉ (Phase 15F)

**Không salon nào ở Việt Nam có công nghệ này!**

