/**
 * Phase 11.2 - AI Alert Explanation Prompt Template
 * 
 * Structured prompt to explain alerts
 * Input: Alert + Related Operational Data
 * Output: Cause + Risk + Suggested Action
 */

export interface AlertData {
  id: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface RelatedData {
  bookings?: {
    total: number;
    completed: number;
    cancelled: number;
    noShow: number;
  };
  revenue?: {
    total: number;
    transactions: number;
    averageOrderValue: number;
  };
  customers?: {
    total: number;
    new: number;
  };
  staff?: {
    total: number;
    active: number;
  };
  products?: Array<{
    id: string;
    name: string;
    stock: number;
    minStock?: number;
  }>;
  subscriptions?: {
    planName: string;
    status: string;
    expiresAt?: string;
    daysUntilExpiry?: number;
  };
}

export interface AlertExplanationResult {
  cause: string; // Nguyên nhân của cảnh báo
  risk: string; // Rủi ro nếu không xử lý
  suggestedAction: string; // Hành động đề xuất
}

/**
 * Build structured prompt for alert explanation
 */
export function buildAlertExplainPrompt(
  alert: AlertData,
  relatedData?: RelatedData
): string {
  return `Bạn là AI Assistant phân tích cảnh báo hệ thống salon. Nhiệm vụ: Giải thích cảnh báo dựa trên DỮ LIỆU THỰC TẾ được cung cấp.

QUAN TRỌNG:
- CHỈ sử dụng dữ liệu được cung cấp bên dưới
- KHÔNG được bịa đặt hoặc suy đoán thông tin không có trong dữ liệu
- Nếu thiếu dữ liệu, ghi rõ "Không đủ dữ liệu"

THÔNG TIN CẢNH BÁO:
- Loại: ${alert.type}
- Mức độ: ${alert.severity}
- Tiêu đề: ${alert.title}
- Nội dung: ${alert.message}
- Thời gian: ${new Date(alert.createdAt).toLocaleString("vi-VN")}
${alert.metadata ? `- Dữ liệu bổ sung: ${JSON.stringify(alert.metadata)}` : ""}

${relatedData ? `DỮ LIỆU LIÊN QUAN:
${relatedData.bookings ? `- Lịch hẹn: Tổng ${relatedData.bookings.total}, Hoàn thành ${relatedData.bookings.completed}, Hủy ${relatedData.bookings.cancelled}, No-show ${relatedData.bookings.noShow}` : ""}
${relatedData.revenue ? `- Doanh thu: ${relatedData.revenue.total.toLocaleString("vi-VN")} VND, ${relatedData.revenue.transactions} giao dịch, Trung bình ${relatedData.revenue.averageOrderValue.toLocaleString("vi-VN")} VND` : ""}
${relatedData.customers ? `- Khách hàng: Tổng ${relatedData.customers.total}, Mới ${relatedData.customers.new}` : ""}
${relatedData.staff ? `- Nhân viên: Tổng ${relatedData.staff.total}, Đang hoạt động ${relatedData.staff.active}` : ""}
${relatedData.products ? `- Sản phẩm liên quan: ${relatedData.products.map((p) => `${p.name} (Tồn kho: ${p.stock}${p.minStock ? `, Tối thiểu: ${p.minStock}` : ""})`).join(", ")}` : ""}
${relatedData.subscriptions ? `- Gói dịch vụ: ${relatedData.subscriptions.planName}, Trạng thái: ${relatedData.subscriptions.status}${relatedData.subscriptions.expiresAt ? `, Hết hạn: ${new Date(relatedData.subscriptions.expiresAt).toLocaleDateString("vi-VN")}${relatedData.subscriptions.daysUntilExpiry !== undefined ? ` (Còn ${relatedData.subscriptions.daysUntilExpiry} ngày)` : ""}` : ""}` : ""}
` : "Không có dữ liệu liên quan"}

YÊU CẦU OUTPUT (JSON format):
{
  "cause": "Giải thích nguyên nhân tại sao cảnh báo này xuất hiện (dựa trên dữ liệu)",
  "risk": "Mô tả rủi ro nếu không xử lý cảnh báo này",
  "suggestedAction": "Hành động cụ thể đề xuất để xử lý cảnh báo"
}

LƯU Ý:
- Cause phải dựa trên dữ liệu thực tế, không suy đoán
- Risk phải cụ thể và có thể đo lường được
- SuggestedAction phải khả thi và cụ thể`;
}

/**
 * Parse AI response to structured format
 */
export function parseAlertExplainResponse(response: string): AlertExplanationResult {
  try {
    // Try to extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        cause: parsed.cause || "Không thể xác định nguyên nhân",
        risk: parsed.risk || "Không thể đánh giá rủi ro",
        suggestedAction: parsed.suggestedAction || "Vui lòng kiểm tra lại",
      };
    }
  } catch (error) {
    console.error("[AI Alert Explain] Failed to parse AI response:", error);
  }

  // Fallback: return basic structure
  return {
    cause: response.substring(0, 300) || "Không thể tạo giải thích",
    risk: "Cần xử lý cảnh báo này để tránh ảnh hưởng đến hoạt động salon",
    suggestedAction: "Kiểm tra và xử lý theo hướng dẫn của hệ thống",
  };
}

/**
 * Mock AI generation (for development/testing)
 * In production, replace with actual AI service call
 */
export async function generateAlertExplanation(
  alert: AlertData,
  relatedData?: RelatedData
): Promise<AlertExplanationResult> {
  // TODO: Replace with actual AI service (OpenAI, Anthropic, etc.)
  // For now, return structured mock based on alert type

  const explanations: Record<string, AlertExplanationResult> = {
    BOOKING_OVERDUE: {
      cause: `Có ${alert.metadata?.count || 0} lịch hẹn đã quá thời gian nhưng chưa được xử lý. Các lịch hẹn này có thể đã bị bỏ quên hoặc khách hàng không đến.`,
      risk: "Lịch hẹn quá hạn có thể gây mất lịch trình, ảnh hưởng đến nhân viên và khách hàng khác. Có thể dẫn đến mất doanh thu và giảm chất lượng dịch vụ.",
      suggestedAction: "Kiểm tra từng lịch hẹn quá hạn, liên hệ khách hàng để xác nhận, và cập nhật trạng thái (hoàn thành/hủy/no-show) để giải phóng lịch trình.",
    },
    BOOKING_CONFLICT: {
      cause: `Phát hiện ${alert.metadata?.count || 0} lịch hẹn có thể trùng thời gian với cùng một nhân viên. Điều này có thể do lỗi đặt lịch hoặc thay đổi lịch trình không được cập nhật.`,
      risk: "Lịch hẹn trùng lịch có thể gây nhầm lẫn, ảnh hưởng đến chất lượng dịch vụ và trải nghiệm khách hàng. Nhân viên có thể bị quá tải.",
      suggestedAction: "Kiểm tra chi tiết các lịch hẹn trùng lịch, điều chỉnh thời gian hoặc phân bổ lại nhân viên để tránh xung đột.",
    },
    LOW_STOCK: {
      cause: `Có ${alert.metadata?.count || 0} sản phẩm có số lượng tồn kho thấp${alert.metadata?.products ? `: ${alert.metadata.products.slice(0, 3).map((p: any) => p.name).join(", ")}` : ""}. Số lượng hiện tại đã gần hoặc dưới mức tối thiểu.`,
      risk: "Hàng tồn kho thấp có thể dẫn đến thiếu nguyên liệu phục vụ khách hàng, ảnh hưởng đến chất lượng dịch vụ và doanh thu.",
      suggestedAction: "Kiểm tra danh sách sản phẩm sắp hết, đặt hàng bổ sung ngay lập tức để đảm bảo không gián đoạn dịch vụ.",
    },
    CUSTOMER_BIRTHDAY: {
      cause: `Hôm nay là sinh nhật của ${alert.metadata?.count || 0} khách hàng${alert.metadata?.customers ? `: ${alert.metadata.customers.slice(0, 3).map((c: any) => c.name).join(", ")}` : ""}. Đây là cơ hội tốt để chăm sóc và tăng cường mối quan hệ với khách hàng.`,
      risk: "Bỏ lỡ cơ hội chúc mừng sinh nhật có thể làm giảm sự hài lòng của khách hàng và mất cơ hội tăng doanh thu.",
      suggestedAction: "Gửi lời chúc mừng sinh nhật qua SMS/Email, có thể kèm theo ưu đãi đặc biệt hoặc voucher để khuyến khích khách hàng đến salon.",
    },
    SUBSCRIPTION_EXPIRING: {
      cause: `Gói dịch vụ "${alert.metadata?.planName || "hiện tại"}" ${alert.metadata?.expired ? "đã hết hạn" : `sẽ hết hạn trong ${alert.metadata?.daysUntilExpiry || 0} ngày`}. ${alert.metadata?.expiresAt ? `Ngày hết hạn: ${new Date(alert.metadata.expiresAt).toLocaleDateString("vi-VN")}` : ""}`,
      risk: "Gói dịch vụ hết hạn sẽ làm giới hạn các tính năng và có thể ảnh hưởng đến hoạt động của salon.",
      suggestedAction: "Gia hạn gói dịch vụ ngay để tiếp tục sử dụng đầy đủ các tính năng. Liên hệ hỗ trợ nếu cần hỗ trợ.",
    },
  };

  // Return specific explanation if available
  if (explanations[alert.type]) {
    return explanations[alert.type];
  }

  // Generic explanation
  return {
    cause: `Cảnh báo "${alert.title}" xuất hiện do: ${alert.message}`,
    risk: `Nếu không xử lý, cảnh báo này có thể ảnh hưởng đến hoạt động của salon. Mức độ nghiêm trọng: ${alert.severity}.`,
    suggestedAction: "Kiểm tra chi tiết cảnh báo và thực hiện các biện pháp xử lý phù hợp. Nếu cần hỗ trợ, liên hệ quản trị viên.",
  };
}

