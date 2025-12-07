// ============================================
// Customer360 API Service
// ============================================

import { getCustomer360 } from "./customerDataEngine";
import { getCustomerInsights } from "./customerInsightAI";
import { getNBA } from "./nbaEngine";
import type { Customer360Payload } from "../types";

// ============================================
// Get Full Customer 360 Data
// ============================================

export async function getCustomer360API(
  customerId: string
): Promise<{
  customer360: Omit<Customer360Payload, "insights" | "nba">;
  insights: Customer360Payload["insights"];
  nba: Customer360Payload["nba"];
}> {
  if (!customerId) {
    throw new Error("customerId is required");
  }

  // 1️⃣ Load FULL customer data
  const customer360 = await getCustomer360(customerId);

  // 2️⃣ Generate AI insights
  const insights = await getCustomerInsights(customer360);

  // 3️⃣ Generate NBA (Next Best Action)
  const nba = await getNBA(customer360, insights);

  // 4️⃣ Return structured response
  return {
    customer360,
    insights,
    nba,
  };
}

