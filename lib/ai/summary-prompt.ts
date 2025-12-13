/**
 * Phase 11.1 - AI Operational Summary Prompt Template
 * 
 * Structured prompt to avoid hallucination
 * Input: Operation Insights + System Alerts
 * Output: Summary + Risks + Suggested Actions
 */

export interface InsightsData {
  period: {
    start: string;
    end: string;
    type: string;
  };
  bookings: {
    total: number;
    completed: number;
    cancelled: number;
    noShow: number;
    change: number;
    byStatus: Array<{ status: string; count: number }>;
    byStaff: Array<{ staffId: string; staffName: string; bookings: number }>;
  };
  revenue: {
    total: number;
    change: number;
    transactions: number;
    averageOrderValue: number;
    byDay: Array<{ date: string; revenue: number; transactions: number }>;
  };
  customers: {
    total: number;
    new: number;
    change: number;
    bySource: Array<{ source: string; count: number }>;
    topCustomers: Array<{ id: string; name: string; totalSpent: number; totalVisits: number }>;
  };
  staff: {
    total: number;
    active: number;
    performance: Array<{
      id: string;
      name: string;
      role: string;
      totalBookings: number;
      completedBookings: number;
      completionRate: number;
    }>;
  };
}

export interface AlertsData {
  alerts: Array<{
    id: string;
    type: string;
    severity: string;
    title: string;
    message: string;
    createdAt: string;
  }>;
  counts: {
    active: number;
    critical: number;
    high: number;
  };
}

export interface AISummaryResult {
  summary: string; // Tóm tắt hoạt động
  risks: Array<{
    level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    description: string;
    impact: string;
  }>;
  suggestedActions: Array<{
    priority: "LOW" | "MEDIUM" | "HIGH";
    action: string;
    reason: string;
  }>;
}

/**
 * Build structured prompt for AI summary generation
 * Uses only provided data, no hallucination
 */
export function buildSummaryPrompt(
  insights: InsightsData,
  alerts: AlertsData,
  period: "day" | "week" | "month"
): string {
  const periodLabel = period === "day" ? "ngày" : period === "week" ? "tuần" : "tháng";

  return `Bạn là AI Assistant phân tích hoạt động salon. Nhiệm vụ: Tạo báo cáo tóm tắt hoạt động ${periodLabel} dựa trên DỮ LIỆU THỰC TẾ được cung cấp.

QUAN TRỌNG:
- CHỈ sử dụng dữ liệu được cung cấp bên dưới
- KHÔNG được bịa đặt hoặc suy đoán thông tin không có trong dữ liệu
- Nếu thiếu dữ liệu, ghi rõ "Không đủ dữ liệu"

DỮ LIỆU HOẠT ĐỘNG (${insights.period.start} - ${insights.period.end}):

1. LỊCH HẸN:
- Tổng số: ${insights.bookings.total}
- Hoàn thành: ${insights.bookings.completed}
- Hủy: ${insights.bookings.cancelled}
- No-show: ${insights.bookings.noShow}
- Thay đổi so với kỳ trước: ${insights.bookings.change > 0 ? "+" : ""}${insights.bookings.change.toFixed(1)}%
- Phân bổ theo trạng thái: ${insights.bookings.byStatus.map((s) => `${s.status}: ${s.count}`).join(", ")}
- Top nhân viên: ${insights.bookings.byStaff.slice(0, 3).map((s) => `${s.staffName}: ${s.bookings} lịch`).join(", ")}

2. DOANH THU:
- Tổng doanh thu: ${insights.revenue.total.toLocaleString("vi-VN")} VND
- Số giao dịch: ${insights.revenue.transactions}
- Giá trị trung bình: ${insights.revenue.averageOrderValue.toLocaleString("vi-VN")} VND
- Thay đổi so với kỳ trước: ${insights.revenue.change > 0 ? "+" : ""}${insights.revenue.change.toFixed(1)}%
- Xu hướng theo ngày: ${insights.revenue.byDay.length > 0 ? insights.revenue.byDay.map((d) => `${d.date}: ${d.revenue.toLocaleString("vi-VN")} VND`).join(", ") : "Không có dữ liệu"}

3. KHÁCH HÀNG:
- Tổng số: ${insights.customers.total}
- Khách mới: ${insights.customers.new}
- Thay đổi: ${insights.customers.change > 0 ? "+" : ""}${insights.customers.change.toFixed(1)}%
- Phân bổ theo nguồn: ${insights.customers.bySource.length > 0 ? insights.customers.bySource.map((s) => `${s.source}: ${s.count}`).join(", ") : "Không có dữ liệu"}
- Top khách hàng: ${insights.customers.topCustomers.slice(0, 3).map((c) => `${c.name}: ${c.totalSpent.toLocaleString("vi-VN")} VND`).join(", ")}

4. NHÂN VIÊN:
- Tổng số: ${insights.staff.total}
- Đang hoạt động: ${insights.staff.active}
- Hiệu suất: ${insights.staff.performance.slice(0, 3).map((s) => `${s.name} (${s.role}): ${s.completedBookings}/${s.totalBookings} hoàn thành (${s.completionRate.toFixed(1)}%)`).join(", ")}

5. CẢNH BÁO HỆ THỐNG:
- Tổng số cảnh báo: ${alerts.counts.active}
- Critical: ${alerts.counts.critical}
- High: ${alerts.counts.high}
- Chi tiết: ${alerts.alerts.slice(0, 5).map((a) => `[${a.severity}] ${a.title}: ${a.message}`).join(" | ")}

YÊU CẦU OUTPUT (JSON format):
{
  "summary": "Tóm tắt ngắn gọn hoạt động ${periodLabel} (2-3 câu)",
  "risks": [
    {
      "level": "LOW|MEDIUM|HIGH|CRITICAL",
      "description": "Mô tả rủi ro dựa trên dữ liệu",
      "impact": "Tác động nếu không xử lý"
    }
  ],
  "suggestedActions": [
    {
      "priority": "LOW|MEDIUM|HIGH",
      "action": "Hành động cụ thể",
      "reason": "Lý do dựa trên dữ liệu"
    }
  ]
}

LƯU Ý:
- Risks phải dựa trên cảnh báo và dữ liệu bất thường
- SuggestedActions phải cụ thể và khả thi
- Tất cả phải dựa trên dữ liệu thực tế, không suy đoán`;
}

/**
 * Parse AI response to structured format
 */
export function parseAIResponse(response: string): AISummaryResult {
  try {
    // Try to extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: parsed.summary || "Không có tóm tắt",
        risks: parsed.risks || [],
        suggestedActions: parsed.suggestedActions || [],
      };
    }
  } catch (error) {
    console.error("[AI Summary] Failed to parse AI response:", error);
  }

  // Fallback: return basic structure
  return {
    summary: response.substring(0, 500) || "Không thể tạo tóm tắt",
    risks: [],
    suggestedActions: [],
  };
}

/**
 * Mock AI generation (for development/testing)
 * In production, replace with actual AI service call
 */
export async function generateAISummary(
  insights: InsightsData,
  alerts: AlertsData,
  period: "day" | "week" | "month"
): Promise<AISummaryResult> {
  // TODO: Replace with actual AI service (OpenAI, Anthropic, etc.)
  // For now, return structured mock based on data

  const periodLabel = period === "day" ? "ngày" : period === "week" ? "tuần" : "tháng";
  const risks: AISummaryResult["risks"] = [];
  const actions: AISummaryResult["suggestedActions"] = [];

  // Generate risks from alerts
  if (alerts.counts.critical > 0) {
    risks.push({
      level: "CRITICAL",
      description: `Có ${alerts.counts.critical} cảnh báo nghiêm trọng cần xử lý ngay`,
      impact: "Có thể ảnh hưởng đến hoạt động salon",
    });
  }

  if (alerts.counts.high > 0) {
    risks.push({
      level: "HIGH",
      description: `Có ${alerts.counts.high} cảnh báo quan trọng`,
      impact: "Cần theo dõi và xử lý sớm",
    });
  }

  // Generate risks from insights
  if (insights.bookings.cancelled > insights.bookings.total * 0.2) {
    risks.push({
      level: "MEDIUM",
      description: `Tỷ lệ hủy lịch cao (${((insights.bookings.cancelled / insights.bookings.total) * 100).toFixed(1)}%)`,
      impact: "Ảnh hưởng đến doanh thu và lịch trình",
    });
  }

  if (insights.revenue.change < -10) {
    risks.push({
      level: "MEDIUM",
      description: `Doanh thu giảm ${Math.abs(insights.revenue.change).toFixed(1)}% so với kỳ trước`,
      impact: "Cần phân tích nguyên nhân và có biện pháp cải thiện",
    });
  }

  // Generate suggested actions
  if (alerts.counts.critical > 0) {
    actions.push({
      priority: "HIGH",
      action: "Xử lý ngay các cảnh báo nghiêm trọng",
      reason: `Có ${alerts.counts.critical} cảnh báo CRITICAL cần được giải quyết`,
    });
  }

  if (insights.bookings.noShow > 0) {
    actions.push({
      priority: "MEDIUM",
      action: "Cải thiện hệ thống nhắc nhở khách hàng",
      reason: `Có ${insights.bookings.noShow} lịch hẹn no-show`,
    });
  }

  if (insights.staff.performance.some((s) => s.completionRate < 70)) {
    actions.push({
      priority: "MEDIUM",
      action: "Hỗ trợ nhân viên có tỷ lệ hoàn thành thấp",
      reason: "Một số nhân viên có tỷ lệ hoàn thành dưới 70%",
    });
  }

  if (insights.customers.new > 0) {
    actions.push({
      priority: "LOW",
      action: "Chăm sóc khách hàng mới",
      reason: `Có ${insights.customers.new} khách hàng mới trong ${periodLabel}`,
    });
  }

  const summary = `Trong ${periodLabel} này, salon đã có ${insights.bookings.total} lịch hẹn với ${insights.bookings.completed} hoàn thành. Doanh thu đạt ${insights.revenue.total.toLocaleString("vi-VN")} VND với ${insights.revenue.transactions} giao dịch. Có ${insights.customers.new} khách hàng mới và ${insights.staff.active} nhân viên đang hoạt động. ${alerts.counts.active > 0 ? `Có ${alerts.counts.active} cảnh báo hệ thống cần xử lý.` : "Không có cảnh báo nào."}`;

  return {
    summary,
    risks,
    suggestedActions: actions,
  };
}

