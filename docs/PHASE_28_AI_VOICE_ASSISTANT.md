# PHASE 28 — AI VOICE ASSISTANT (MINA 3.0)

## Tổng quan

Phase 28 biến MINA thành trợ lý giọng nói AI chuyên nghiệp, tương tự như tổng đài AI cao cấp của Momo, Viettel, hay Apple Siri bản salon.

**Tính năng chính:**
- ✅ Nhận và trả lời cuộc gọi điện thoại tự động
- ✅ Đặt lịch bằng giọng nói
- ✅ Tư vấn dịch vụ bằng giọng nói
- ✅ Stylist ra lệnh bằng giọng nói (Intercom Mode)
- ✅ Phân tích và lưu trữ toàn bộ hội thoại
- ✅ Tích hợp với CRM, Booking, SOP

---

## Các Module

### 28A — Voice Identity (Tạo giọng Mina cố định)

**Giọng Mina được thiết kế:**
- Ấm áp, nhẹ nhàng, nữ tính
- Tông "dịu + chuyên nghiệp"
- Phát âm chuẩn Sài Gòn
- 15% hơi "Hàn tone" cho cảm giác sang trọng
- Tốc độ nói có thể chỉnh 0.9x → 1.2x
- Ngữ điệu thay đổi theo ngữ cảnh

**Công nghệ:**
- OpenAI TTS API với voice "nova" (warm, feminine)
- Model: `tts-1-hd` (high quality)
- Speed adjustment: 0.25x - 4.0x

**Ví dụ giọng Mina:**
```
"Chào chị yêu, em là Mina của Chí Tâm Hair Salon.  
Hôm nay em có thể hỗ trợ chị về uốn, nhuộm hay đặt lịch ạ?"
```

---

### 28B — Speech-to-Text Engine

**Tính năng:**
- Nhận diện giọng nói từ audio file
- Hỗ trợ tiếng Việt và nhiều ngôn ngữ khác
- Trích xuất transcript với độ chính xác cao
- Lưu lại audio URL và metadata

**Công nghệ:**
- OpenAI Whisper API (`whisper-1` model)
- Hỗ trợ: Vietnamese, English, và nhiều ngôn ngữ khác
- Output: Text transcript + language detection + word timestamps

**API Endpoint:**
```
POST /api/voice/speech-to-text
Content-Type: multipart/form-data

Body:
- audio: File (audio file)
- sessionId: string (optional)
- language: string (optional, default: "vi")
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transcript": "Chị muốn đặt uốn nóng chiều thứ 7 với anh Hải.",
    "language": "vi",
    "duration": 3.5,
    "words": [...]
  }
}
```

---

### 28C — AI Intent Model

**Các Intent được hỗ trợ:**
1. `BOOKING` - Đặt lịch hẹn
2. `PRICE_INQUIRY` - Hỏi giá dịch vụ
3. `SERVICE_ADVICE` - Tư vấn dịch vụ phù hợp
4. `COLOR_ADVICE` - Hỏi màu hợp mặt
5. `HAIR_CONDITION_CHECK` - Hỏi tóc có uốn/nhuộm được không
6. `OPERATING_HOURS` - Hỏi giờ mở cửa
7. `CANCEL_BOOKING` - Hủy lịch hẹn
8. `RESCHEDULE_BOOKING` - Đổi lịch hẹn
9. `COMPLAINT` - Phản ánh, góp ý
10. `STYLIST_REQUEST` - Yêu cầu stylist cụ thể
11. `DIRECTIONS` - Hỏi chỉ đường
12. `PRODUCT_INQUIRY` - Hỏi sản phẩm
13. `LOYALTY_INQUIRY` - Hỏi về tích điểm, ưu đãi
14. `GENERAL_QUESTION` - Câu hỏi chung

**Entities được trích xuất:**
- `service` - Tên dịch vụ
- `stylist` - Tên stylist
- `date` - Ngày/thứ
- `time` - Khung giờ
- `serviceType` - Loại dịch vụ cụ thể
- `color` - Màu sắc
- `phone` - Số điện thoại
- `name` - Tên khách hàng

**API Endpoint:**
```
POST /api/voice/intent

Body:
{
  "transcript": "Chị muốn đặt uốn nóng chiều thứ 7 với anh Hải.",
  "sessionId": "session_id" (optional),
  "interactionId": "interaction_id" (optional)
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "intent": "BOOKING",
    "confidence": 0.95,
    "entities": {
      "service": "uốn nóng",
      "stylist": "Hải",
      "date": "thứ 7",
      "time": "chiều"
    },
    "sentiment": "POSITIVE",
    "emotion": "CURIOUS",
    "requiresFollowup": false,
    "certainty": "HIGH"
  }
}
```

---

### 28D — Voice Response Engine

**Tính năng:**
- Tạo câu trả lời tự nhiên, ấm áp theo phong cách MINA
- Tích hợp thông tin khách hàng và salon
- Tự động đề xuất action tiếp theo
- Generate audio response

**Response Style:**
- Friendly, warm, professional
- 2-4 câu, ngắn gọn, dễ nghe
- Tự nhiên như người thật
- Phù hợp với ngữ cảnh

**API Endpoint:**
```
POST /api/voice/response

Body:
{
  "intent": "BOOKING",
  "entities": {...},
  "sessionId": "session_id" (optional),
  "interactionId": "interaction_id" (optional),
  "includeAudio": true (optional)
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "responseText": "Dạ có luôn chị. Thứ 7 bên em còn slot 13h30 hoặc 15h15. Chị chọn giờ nào tiện nè?",
    "responseStyle": "FRIENDLY",
    "tone": "warm",
    "requiresFollowup": true,
    "nextAction": "WAIT_FOR_RESPONSE",
    "audioUrl": "base64_encoded_audio" (if includeAudio=true)
  }
}
```

---

### 28E — Phone Call Automation

**Flow xử lý cuộc gọi:**

1. **Nhận cuộc gọi:**
   - Tạo voice session
   - Nhận diện khách hàng (nếu có)
   - Generate greeting từ MINA

2. **Xử lý phản hồi khách:**
   - Speech-to-Text
   - Intent Detection
   - Generate Response
   - Text-to-Speech

3. **Hoàn tất:**
   - Lưu conversation
   - Tạo booking (nếu cần)
   - Chuyển sang người thật (nếu cần)

**API Endpoints:**
```
POST /api/voice/call/handle
Body: { callId, callerPhone, callDirection, branchId, partnerId }

PUT /api/voice/call/[sessionId]/process
Body: { audioUrl, transcript }
```

**Tự động chuyển sang người thật khi:**
- Intent = COMPLAINT
- Sentiment = NEGATIVE
- Khách yêu cầu chuyển

---

### 28F — Salon Intercom Mode

**Các lệnh được hỗ trợ:**
1. `CHECK_SCHEDULE` - Kiểm tra lịch làm việc
2. `VIEW_CUSTOMER` - Xem thông tin khách hàng
3. `OPEN_SOP` - Mở SOP/quy trình
4. `CREATE_PROFILE` - Tạo hồ sơ khách mới
5. `ADD_NOTE` - Thêm ghi chú cho khách
6. `CHECK_INVENTORY` - Kiểm tra tồn kho
7. `VIEW_STYLIST_SCHEDULE` - Xem lịch stylist cụ thể
8. `VIEW_BOOKING_DETAILS` - Xem chi tiết booking

**Ví dụ lệnh:**
- "Mina ơi, check lịch Hải thứ 7."
- "Mina, xem tóc khách này có uốn được không."
- "Mina, mở SOP uốn nóng giúp anh."
- "Mina, tạo hồ sơ khách mới."
- "Mina, ghi chú khách: tóc yếu – xử lý nhẹ."

**API Endpoint:**
```
POST /api/voice/command
Authorization: Bearer <token>

Body:
{
  "transcript": "check lịch Hải thứ 7",
  "audioUrl": "url" (optional),
  "branchId": "branch_id" (optional)
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "commandId": "command_id",
    "commandType": "CHECK_SCHEDULE",
    "responseText": "Em tìm thấy 5 lịch hẹn của Hải vào thứ 7.",
    "responseAudio": "base64_audio",
    "result": {
      "bookings": [...]
    }
  }
}
```

---

### 28G — Voice Dashboard & Analytics

**Metrics được tracking:**
- Tổng số sessions và interactions
- Average duration và interactions per session
- Intent breakdown
- Resolution rate và booking rate
- Sentiment analysis
- Phone call metrics
- Voice command success rate

**API Endpoints:**
```
GET /api/voice/dashboard
Query: periodStart, periodEnd, branchId, partnerId

GET /api/voice/sessions
Query: page, limit, branchId, partnerId, sessionType, status, customerPhone
```

**Dashboard Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalSessions": 150,
      "totalInteractions": 450,
      "avgDuration": 120,
      "resolutionRate": 85.5,
      "bookingRate": 45.2,
      "positiveRate": 78.3
    },
    "phoneCalls": {
      "totalCalls": 80,
      "avgCallDuration": 180,
      "transferRate": 12.5
    },
    "voiceCommands": {
      "totalCommands": 200,
      "commandSuccessRate": 92.0
    },
    "intentBreakdown": {...},
    "topIntents": [...],
    "recentSessions": [...]
  }
}
```

---

## Database Schema

### VoiceSession
- Lưu trữ thông tin phiên hội thoại
- Hỗ trợ: Phone Call, Voice Message, Intercom, Chat Voice
- Tracking: duration, status, intent, resolution

### VoiceInteraction
- Lưu từng tương tác trong session
- Phân biệt: CUSTOMER, MINA, STAFF
- Lưu transcript, intent, sentiment, emotion
- Audio URLs và response data

### VoiceCommand
- Lưu lệnh bằng giọng từ stylist
- Tracking execution status và results
- Command type và parameters

### VoiceIntent
- Phân loại intent từ interactions
- Confidence score
- Extracted entities
- Resolution tracking

### VoiceAnalytics
- Tổng hợp metrics theo period
- Daily, Weekly, Monthly analytics
- Branch và Partner level metrics

---

## Integration Points

### Với Booking System
- Tự động tạo booking từ voice session
- Extract date, time, service, stylist từ entities
- Confirm booking qua SMS/Zalo

### Với CRM
- Link voice session với customer profile
- Update customer notes từ voice interactions
- Track customer sentiment và satisfaction

### Với SOP System
- Mở SOP khi stylist yêu cầu
- Reference SOP trong responses
- Track SOP compliance

### Với Inventory
- Check inventory qua voice command
- Alert khi sắp hết hàng
- Update inventory logs

---

## Security & Privacy

- **Authentication:** All endpoints require valid auth token
- **Role-based access:** Admin, Manager, Stylist permissions
- **Data isolation:** Partner và Branch level isolation
- **Audio storage:** Secure storage với access control
- **PII protection:** Customer data encryption

---

## Future Enhancements

- [ ] Multi-language support (English, Korean)
- [ ] Voice biometric authentication
- [ ] Real-time streaming transcription
- [ ] Advanced emotion detection
- [ ] Predictive intent (suggest actions)
- [ ] Voice synthesis với custom voice model
- [ ] Integration với IVR systems
- [ ] WhatsApp Voice Message support

---

## Usage Examples

### Example 1: Phone Call Flow
```javascript
// 1. Incoming call
const call = await fetch('/api/voice/call/handle', {
  method: 'POST',
  body: JSON.stringify({
    callId: 'call_123',
    callerPhone: '0901234567',
    callDirection: 'INBOUND'
  })
});

// 2. Play greeting
// Use response.greetingAudio

// 3. Process customer response
const response = await fetch(`/api/voice/call/${sessionId}/process`, {
  method: 'PUT',
  body: JSON.stringify({
    transcript: 'Chị muốn đặt uốn nóng thứ 7'
  })
});

// 4. Play response
// Use response.data.responseAudio
```

### Example 2: Voice Command
```javascript
// Stylist says: "Mina, check lịch Hải thứ 7"
const command = await fetch('/api/voice/command', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({
    transcript: 'check lịch Hải thứ 7',
    branchId: 'branch_123'
  })
});

// Response with booking list
console.log(command.data.result.bookings);
```

### Example 3: Intent Detection
```javascript
const intent = await fetch('/api/voice/intent', {
  method: 'POST',
  body: JSON.stringify({
    transcript: 'Giá uốn nóng bao nhiêu vậy?',
    sessionId: 'session_123'
  })
});

// Intent: PRICE_INQUIRY
// Entities: { service: 'uốn nóng' }
```

---

## Performance Considerations

- **Response Time:** Average 1-2 seconds per interaction
- **Concurrent Calls:** Support multiple simultaneous calls
- **Audio Processing:** Async processing for large files
- **Database:** Indexed queries for fast retrieval
- **Caching:** Cache common responses và SOP data

---

## Monitoring & Alerts

- Voice session failures
- High transfer rate (>20%)
- Negative sentiment spikes
- Command execution errors
- Low resolution rate (<70%)

---

## Phase 28 Complete ✅

**Salon Chí Tâm giờ đây có:**
- ✅ AI Voice Assistant chuyên nghiệp nhất Việt Nam
- ✅ Tự động nhận và xử lý cuộc gọi
- ✅ Đặt lịch bằng giọng nói
- ✅ Stylist ra lệnh bằng giọng
- ✅ Phân tích và lưu trữ toàn bộ conversations
- ✅ Tích hợp sâu với hệ thống hiện có

**CTSS = Salon công nghệ 5.0 - Không đối thủ nào có level này! 🚀**

