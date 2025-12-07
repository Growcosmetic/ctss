// ============================================
// Customer Journey Utilities
// ============================================

import type { CustomerJourneyState } from "./types";

// ============================================
// Get Journey Stage Label (Vietnamese)
// ============================================

export function getJourneyStageLabel(state: CustomerJourneyState): string {
  const labels: Record<CustomerJourneyState, string> = {
    AWARENESS: "Nhận biết",
    CONSIDERATION: "Tìm hiểu",
    BOOKING: "Đặt lịch",
    IN_SALON: "Tại salon",
    POST_SERVICE: "Sau dịch vụ",
    RETENTION: "Giữ chân",
  };

  return labels[state] || state;
}

// ============================================
// Get Journey Stage Description
// ============================================

export function getJourneyStageDescription(
  state: CustomerJourneyState
): string {
  const descriptions: Record<CustomerJourneyState, string> = {
    AWARENESS: "Khách biết đến salon qua quảng cáo, bài đăng, hoặc giới thiệu",
    CONSIDERATION: "Khách đang tìm hiểu, hỏi giá, xem kiểu tóc",
    BOOKING: "Khách đã đặt lịch và chờ đến salon",
    IN_SALON: "Khách đang ở salon, đang được phục vụ",
    POST_SERVICE: "Khách vừa rời salon, cần chăm sóc sau dịch vụ",
    RETENTION: "Khách hàng trung thành, cần duy trì mối quan hệ",
  };

  return descriptions[state] || "";
}

// ============================================
// Get Journey Stage Color (for UI)
// ============================================

export function getJourneyStageColor(
  state: CustomerJourneyState
): {
  bg: string;
  text: string;
  border: string;
} {
  const colors: Record<
    CustomerJourneyState,
    { bg: string; text: string; border: string }
  > = {
    AWARENESS: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
    },
    CONSIDERATION: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
    },
    BOOKING: {
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      border: "border-yellow-200",
    },
    IN_SALON: {
      bg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-200",
    },
    POST_SERVICE: {
      bg: "bg-orange-50",
      text: "text-orange-700",
      border: "border-orange-200",
    },
    RETENTION: {
      bg: "bg-indigo-50",
      text: "text-indigo-700",
      border: "border-indigo-200",
    },
  };

  return colors[state] || {
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200",
  };
}

// ============================================
// Get Journey Progress Percentage
// ============================================

export function getJourneyProgress(state: CustomerJourneyState): number {
  const progressMap: Record<CustomerJourneyState, number> = {
    AWARENESS: 16.7,
    CONSIDERATION: 33.3,
    BOOKING: 50,
    IN_SALON: 66.7,
    POST_SERVICE: 83.3,
    RETENTION: 100,
  };

  return progressMap[state] || 0;
}

