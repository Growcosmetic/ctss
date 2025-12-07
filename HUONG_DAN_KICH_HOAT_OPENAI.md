# 🔑 Hướng dẫn kích hoạt OpenAI API Key cho CTSS

## 📋 Tổng quan

CTSS sử dụng OpenAI API cho các tính năng AI:
- **GPT-4o / GPT-4o-mini**: Chat, phân tích, dự đoán
- **GPT-4o Vision**: Phân tích ảnh/video tóc
- **Whisper API**: Speech-to-Text (chuyển giọng nói thành text)
- **TTS API**: Text-to-Speech (chuyển text thành giọng nói)

---

## 🚀 Bước 1: Lấy OpenAI API Key

### 1.1. Đăng ký/Đăng nhập OpenAI

1. Truy cập: https://platform.openai.com/
2. Đăng nhập hoặc đăng ký tài khoản
3. Nếu chưa có, tạo tài khoản mới

### 1.2. Tạo API Key

1. Vào **API Keys**: https://platform.openai.com/api-keys
2. Click **"Create new secret key"**
3. Đặt tên: `CTSS Production` (hoặc tên bạn muốn)
4. **Copy API Key ngay** (chỉ hiển thị 1 lần!)
   - Format: `sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 1.3. Nạp tiền vào tài khoản

1. Vào **Billing**: https://platform.openai.com/account/billing
2. Click **"Add payment method"**
3. Thêm thẻ tín dụng/ghi nợ
4. Nạp tiền (tối thiểu $5-10 để test)

**Lưu ý:**
- OpenAI tính phí theo usage (pay-as-you-go)
- GPT-4o: ~$0.01-0.03 per 1K tokens
- GPT-4o-mini: ~$0.00015 per 1K tokens (rẻ hơn nhiều)
- Whisper: ~$0.006 per minute
- TTS: ~$0.015 per 1K characters

---

## 🔧 Bước 2: Cấu hình trong CTSS

### 2.1. Mở file `.env`

File `.env` nằm ở thư mục gốc của project:
```
/Users/huynhchitam/Downloads/ctss/.env
```

### 2.2. Thêm API Key

Mở file `.env` và thêm dòng sau:

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-4o-mini
```

**Giải thích:**
- `OPENAI_API_KEY`: API key bạn vừa copy từ OpenAI
- `OPENAI_MODEL`: Model mặc định (có thể dùng `gpt-4o` hoặc `gpt-4o-mini`)

### 2.3. Các biến môi trường khác (nếu cần)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ctss

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000

# OpenAI (BẮT BUỘC)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-4o-mini
```

---

## ✅ Bước 3: Kiểm tra cấu hình

### 3.1. Restart server

Sau khi thêm API key, **restart server**:

```bash
# Dừng server (Ctrl + C)
# Sau đó chạy lại:
npm run dev
```

### 3.2. Test API Key

Có thể test bằng cách:

1. **Test qua Dashboard**: Vào http://localhost:3000/dashboard
2. **Test qua Mina Chat**: Vào http://localhost:3000/mina và chat thử
3. **Test qua API**: Gọi endpoint `/api/ai/business-insights`

### 3.3. Kiểm tra logs

Nếu API key sai, bạn sẽ thấy lỗi trong console:
```
OpenAI API Error: Incorrect API key provided
```

Nếu đúng, sẽ không có lỗi và AI sẽ hoạt động bình thường.

---

## 🎯 Các tính năng AI cần API Key

### ✅ Tính năng sử dụng OpenAI:

1. **Mina AI Assistant** (`/api/mina/chat`)
   - Chat với khách hàng
   - Tư vấn dịch vụ
   - Phân tích khách hàng

2. **AI Image Analysis** (`/api/ai/image-to-formula`)
   - Phân tích ảnh kiểu tóc
   - Tạo công thức uốn/nhuộm

3. **AI Video Analysis** (`/api/ai/video-analysis`)
   - Phân tích video tóc
   - Chẩn đoán sức khỏe tóc

4. **Stylist Coach** (`/api/stylist-coach`)
   - Hỗ trợ stylist real-time
   - Đề xuất kỹ thuật

5. **Customer Insights** (`/api/customer/insight`)
   - Phân tích khách hàng
   - Dự đoán churn risk

6. **Financial Forecasting** (`/api/financial/forecast`)
   - Dự đoán doanh thu
   - Phân tích rủi ro

7. **Loyalty Prediction** (`/api/membership/loyalty/predict`)
   - Dự đoán khách quay lại
   - Đề xuất follow-up

8. **Training AI** (`/api/training/roleplay`, `/api/training/simulation`)
   - Tạo bài học
   - Roleplay simulator

9. **Marketing Content** (`/api/marketing/content`)
   - Tạo nội dung marketing
   - Tạo reels/shorts

10. **Voice Assistant** (`/api/voice/*`)
    - Speech-to-Text (Whisper)
    - Text-to-Speech (TTS)

---

## 🔒 Bảo mật API Key

### ⚠️ QUAN TRỌNG:

1. **KHÔNG commit `.env` lên GitHub**
   - File `.env` đã được thêm vào `.gitignore`
   - Không chia sẻ API key công khai

2. **Không hardcode API key trong code**
   - Luôn dùng `process.env.OPENAI_API_KEY`
   - Không viết trực tiếp trong code

3. **Rotate API key định kỳ**
   - Nếu nghi ngờ bị lộ, tạo key mới ngay
   - Xóa key cũ trên OpenAI dashboard

4. **Set usage limits**
   - Vào OpenAI dashboard → Settings → Usage limits
   - Set giới hạn chi tiêu hàng ngày/tháng

---

## 💰 Quản lý chi phí

### Cách giảm chi phí:

1. **Dùng GPT-4o-mini cho hầu hết tasks**
   - Rẻ hơn 20x so với GPT-4o
   - Đủ tốt cho hầu hết use cases

2. **Cache responses khi có thể**
   - Cache kết quả AI để tránh gọi lại

3. **Set rate limits**
   - Giới hạn số lần gọi API
   - Tránh spam requests

4. **Monitor usage**
   - Vào https://platform.openai.com/usage
   - Theo dõi chi tiêu hàng ngày

### Ước tính chi phí:

- **1000 requests/ngày** với GPT-4o-mini: ~$0.15-0.50/ngày
- **100 requests/ngày** với GPT-4o: ~$1-3/ngày
- **Voice calls** (Whisper + TTS): ~$0.01-0.05/cuộc gọi

---

## 🐛 Troubleshooting

### Lỗi: "OpenAI API key not configured"

**Nguyên nhân:**
- Chưa thêm `OPENAI_API_KEY` vào `.env`
- Server chưa restart sau khi thêm key

**Giải pháp:**
1. Kiểm tra file `.env` có `OPENAI_API_KEY` chưa
2. Restart server: `npm run dev`
3. Kiểm tra không có khoảng trắng thừa: `OPENAI_API_KEY=sk-...` (không có space)

### Lỗi: "Incorrect API key provided"

**Nguyên nhân:**
- API key sai
- API key đã bị xóa/revoke

**Giải pháp:**
1. Tạo API key mới trên OpenAI dashboard
2. Copy và paste vào `.env`
3. Restart server

### Lỗi: "You exceeded your current quota"

**Nguyên nhân:**
- Hết tiền trong tài khoản
- Vượt usage limit

**Giải pháp:**
1. Vào https://platform.openai.com/account/billing
2. Nạp thêm tiền
3. Hoặc tăng usage limit

### AI không hoạt động nhưng không có lỗi

**Nguyên nhân:**
- API key đúng nhưng model không available
- Network issues

**Giải pháp:**
1. Kiểm tra model name: `gpt-4o-mini` hoặc `gpt-4o`
2. Kiểm tra internet connection
3. Thử test trực tiếp trên OpenAI playground

---

## 📝 Checklist

- [ ] Đã tạo tài khoản OpenAI
- [ ] Đã tạo API key
- [ ] Đã nạp tiền vào tài khoản
- [ ] Đã thêm `OPENAI_API_KEY` vào file `.env`
- [ ] Đã thêm `OPENAI_MODEL` (optional)
- [ ] Đã restart server
- [ ] Đã test AI features
- [ ] Đã set usage limits (optional)

---

## 🎉 Hoàn tất!

Sau khi hoàn thành các bước trên, tất cả tính năng AI của CTSS sẽ hoạt động:

✅ Mina AI Assistant  
✅ Image-to-Formula  
✅ Video Hair Analysis  
✅ Stylist Coach  
✅ Customer Insights  
✅ Financial Forecasting  
✅ Loyalty Prediction  
✅ Training AI  
✅ Marketing Content  
✅ Voice Assistant  

**Chúc bạn sử dụng CTSS thành công! 🚀**

---

*Last updated: 2024*

