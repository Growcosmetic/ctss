"use client";

import { useState } from "react";
import {
  getCustomer,
  saveCustomer,
  searchCustomers,
  addTag,
  removeTag,
} from "../services/crmApi";
import {
  Customer,
  CustomerSearchResult,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  AddTagRequest,
} from "../types";

export interface UseCRMReturn {
  loading: boolean;
  error: string | null;
  customer: Customer | null;
  searchResults: CustomerSearchResult[];
  loadCustomer: (phone?: string, id?: string) => Promise<void>;
  searchCustomer: (query: string) => Promise<void>;
  updateCustomer: (request: UpdateCustomerRequest) => Promise<void>;
  createCustomer: (request: CreateCustomerRequest) => Promise<Customer>;
  addTagToCustomer: (request: AddTagRequest) => Promise<void>;
  removeTagFromCustomer: (customerId: string, tagId: string) => Promise<void>;
  clearCustomer: () => void;
  clearSearch: () => void;
}

export function useCRM(): UseCRMReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [searchResults, setSearchResults] = useState<CustomerSearchResult[]>([]);

  const loadCustomer = async (phone?: string, id?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCustomer(phone, id);
      setCustomer(data);
    } catch (err: any) {
      setError(err.message || "Failed to load customer");
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  };

  const searchCustomer = async (query: string) => {
    if (!query || query.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const results = await searchCustomers(query);
      setSearchResults(results);
    } catch (err: any) {
      setError(err.message || "Failed to search customers");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const updateCustomer = async (request: UpdateCustomerRequest) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await saveCustomer(request);
      setCustomer(updated);
    } catch (err: any) {
      setError(err.message || "Failed to update customer");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createCustomer = async (request: CreateCustomerRequest): Promise<Customer> => {
    setLoading(true);
    setError(null);
    try {
      const newCustomer = await saveCustomer(request);
      setCustomer(newCustomer);
      return newCustomer;
    } catch (err: any) {
      setError(err.message || "Failed to create customer");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addTagToCustomer = async (request: AddTagRequest) => {
    setLoading(true);
    setError(null);
    try {
      await addTag(request);
      // Reload customer to get updated tags
      if (customer) {
        await loadCustomer(undefined, customer.id);
      }
    } catch (err: any) {
      setError(err.message || "Failed to add tag");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeTagFromCustomer = async (customerId: string, tagId: string) => {
    setLoading(true);
    setError(null);
    try {
      await removeTag(customerId, tagId);
      // Reload customer to get updated tags
      if (customer) {
        await loadCustomer(undefined, customer.id);
      }
    } catch (err: any) {
      setError(err.message || "Failed to remove tag");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearCustomer = () => {
    setCustomer(null);
    setError(null);
  };

  const clearSearch = () => {
    setSearchResults([]);
  };

  return {
    loading,
    error,
    customer,
    searchResults,
    loadCustomer,
    searchCustomer,
    updateCustomer,
    createCustomer,
    addTagToCustomer,
    removeTagFromCustomer,
    clearCustomer,
    clearSearch,
  };
}

