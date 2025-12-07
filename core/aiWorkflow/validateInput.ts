// ============================================
// Input Validator
// ============================================

import { WorkflowType, WorkflowPayload } from "./workflowTypes";

export function validateInput(type: WorkflowType, payload: WorkflowPayload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Payload không hợp lệ");
  }

  switch (type) {
    case "stylist-coach":
      if (!payload.hairCondition || !payload.customerGoal) {
        throw new Error("Thiếu dữ liệu bắt buộc của Stylist Coach");
      }
      break;

    case "booking-optimizer":
      if (!payload.services || !payload.stylistId) {
        throw new Error("Thiếu dữ liệu booking optimizer");
      }
      break;

    case "marketing-content":
      if (!payload.topic || !payload.goal || !payload.platform || !payload.style) {
        throw new Error("Thiếu thông tin marketing content: topic, goal, platform, style");
      }
      break;

    default:
      break;
  }

  return payload;
}

