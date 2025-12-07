import { NextRequest } from "next/server";
import { getPOSUpsellSuggestions } from "@/features/mina/services/minaEngine";
import { successResponse, errorResponse } from "@/lib/api-response";
import { InvoiceDraft } from "@/features/mina/types";

// POST /api/mina/pos-upsell
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const invoiceDraft: InvoiceDraft = body;

    if (!invoiceDraft || !invoiceDraft.items) {
      return errorResponse("invoiceDraft with items is required", 400);
    }

    const suggestions = await getPOSUpsellSuggestions(invoiceDraft);

    return successResponse(suggestions);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to get POS upsell suggestions", 500);
  }
}

