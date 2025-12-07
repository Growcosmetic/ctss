// ============================================
// Voice Intent Detection Prompt
// ============================================

export function voiceIntentPrompt(transcript: string, context?: {
  customerId?: string;
  previousIntents?: string[];
  sessionType?: string;
}): string {
  return `
Bạn là AI chuyên phân tích ý định khách hàng từ lời nói tại salon Chí Tâm Hair Salon.

TRANSCRIPT (lời khách nói):
"${transcript}"

NGỮ CẢNH:
${context?.customerId ? `- Khách hàng ID: ${context.customerId}` : ''}
${context?.sessionType ? `- Loại phiên: ${context.sessionType}` : ''}
${context?.previousIntents?.length ? `- Ý định trước đó: ${context.previousIntents.join(', ')}` : ''}

NHIỆM VỤ:
1. Xác định INTENT chính xác nhất từ danh sách sau:
   - BOOKING: Đặt lịch hẹn
   - PRICE_INQUIRY: Hỏi giá dịch vụ
   - SERVICE_ADVICE: Tư vấn dịch vụ phù hợp
   - COLOR_ADVICE: Hỏi màu hợp mặt
   - HAIR_CONDITION_CHECK: Hỏi tóc có uốn/nhuộm được không
   - OPERATING_HOURS: Hỏi giờ mở cửa
   - CANCEL_BOOKING: Hủy lịch hẹn
   - RESCHEDULE_BOOKING: Đổi lịch hẹn
   - COMPLAINT: Phản ánh, góp ý
   - STYLIST_REQUEST: Yêu cầu stylist cụ thể
   - DIRECTIONS: Hỏi chỉ đường
   - PRODUCT_INQUIRY: Hỏi sản phẩm
   - LOYALTY_INQUIRY: Hỏi về tích điểm, ưu đãi
   - GENERAL_QUESTION: Câu hỏi chung

2. Trích xuất ENTITIES (thông tin cụ thể):
   - service: Tên dịch vụ (uốn nóng, nhuộm, cắt, etc.)
   - stylist: Tên stylist (Hải, Nhi, etc.)
   - date: Ngày/thứ (thứ 7, ngày mai, 15/12, etc.)
   - time: Khung giờ (sáng, chiều, 2 giờ, 14h, etc.)
   - serviceType: Loại dịch vụ cụ thể (uốn nóng, uốn lạnh, balayage, etc.)
   - color: Màu sắc
   - phone: Số điện thoại
   - name: Tên khách hàng
   - quantity: Số lượng
   - price: Giá tiền được đề cập

3. Xác định SENTIMENT:
   - POSITIVE: Tích cực, hài lòng
   - NEUTRAL: Bình thường
   - NEGATIVE: Tiêu cực, không hài lòng

4. Xác định EMOTION:
   - HAPPY: Vui vẻ
   - CURIOUS: Tò mò, muốn biết
   - FRUSTRATED: Bực bội
   - URGENT: Gấp gáp
   - CALM: Bình tĩnh

TRẢ VỀ JSON:
{
  "intent": "INTENT_NAME",
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
`;
}

