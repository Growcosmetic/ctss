// ============================================
// CRM API Service
// ============================================

import {
  Customer,
  CustomerSearchResult,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  AddTagRequest,
} from "../types";

const API_BASE = "/api/crm";

/**
 * GET /api/crm/customer?phone=... or ?id=...
 * Load customer with full details
 */
export async function getCustomer(phone?: string, id?: string): Promise<Customer | null> {
  try {
    const params = new URLSearchParams();
    if (id) params.append("id", id);
    if (phone) params.append("phone", phone);

    const response = await fetch(`${API_BASE}/customer?${params.toString()}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error("Failed to load customer");
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error loading customer:", error);
    throw error;
  }
}

/**
 * POST /api/crm/customer
 * Create or update customer
 */
export async function saveCustomer(
  request: CreateCustomerRequest | UpdateCustomerRequest
): Promise<Customer> {
  try {
    const response = await fetch(`${API_BASE}/customer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to save customer");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error saving customer:", error);
    throw error;
  }
}

/**
 * GET /api/crm/search?q=...
 * Search customers by name or phone
 */
export async function searchCustomers(query: string): Promise<CustomerSearchResult[]> {
  try {
    const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error("Failed to search customers");
    }
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error searching customers:", error);
    throw error;
  }
}

/**
 * POST /api/crm/tags/add
 * Add tag to customer
 */
export async function addTag(request: AddTagRequest): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/tags/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to add tag");
    }
  } catch (error) {
    console.error("Error adding tag:", error);
    throw error;
  }
}

/**
 * POST /api/crm/tags/remove
 * Remove tag from customer
 */
export async function removeTag(customerId: string, tagId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/tags/remove`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ customerId, tagId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to remove tag");
    }
  } catch (error) {
    console.error("Error removing tag:", error);
    throw error;
  }
}

