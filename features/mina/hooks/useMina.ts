"use client";

import { useState } from "react";
import {
  getCustomerSummary,
  getPredictReturn,
  getServiceSuggestions,
  getChurnRisk,
  getPOSUpsellSuggestions,
} from "../services/minaApi";
import {
  CustomerSummary,
  ReturnPrediction,
  ServiceSuggestion,
  ChurnRisk,
  POSUpsellSuggestion,
  InvoiceDraft,
} from "../types";

export interface UseMinaReturn {
  loading: boolean;
  error: string | null;
  customerSummary: CustomerSummary | null;
  returnPrediction: ReturnPrediction | null;
  serviceSuggestions: ServiceSuggestion[];
  churnRisk: ChurnRisk | null;
  posUpsellSuggestions: POSUpsellSuggestion[];
  getCustomerSummary: (customerId: string) => Promise<void>;
  getPredictReturn: (customerId: string) => Promise<void>;
  getServiceSuggestions: (customerId: string) => Promise<void>;
  getChurnRisk: (customerId: string) => Promise<void>;
  getPOSUpsellSuggestions: (invoiceDraft: InvoiceDraft) => Promise<void>;
  clearAll: () => void;
}

export function useMina(): UseMinaReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customerSummary, setCustomerSummary] = useState<CustomerSummary | null>(null);
  const [returnPrediction, setReturnPrediction] = useState<ReturnPrediction | null>(null);
  const [serviceSuggestions, setServiceSuggestions] = useState<ServiceSuggestion[]>([]);
  const [churnRisk, setChurnRisk] = useState<ChurnRisk | null>(null);
  const [posUpsellSuggestions, setPosUpsellSuggestions] = useState<POSUpsellSuggestion[]>([]);

  const handleGetCustomerSummary = async (customerId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCustomerSummary(customerId);
      setCustomerSummary(data);
    } catch (err: any) {
      setError(err.message || "Failed to load customer summary");
    } finally {
      setLoading(false);
    }
  };

  const handleGetPredictReturn = async (customerId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPredictReturn(customerId);
      setReturnPrediction(data);
    } catch (err: any) {
      setError(err.message || "Failed to predict return date");
    } finally {
      setLoading(false);
    }
  };

  const handleGetServiceSuggestions = async (customerId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getServiceSuggestions(customerId);
      setServiceSuggestions(data);
    } catch (err: any) {
      setError(err.message || "Failed to load service suggestions");
    } finally {
      setLoading(false);
    }
  };

  const handleGetChurnRisk = async (customerId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getChurnRisk(customerId);
      setChurnRisk(data);
    } catch (err: any) {
      setError(err.message || "Failed to detect churn risk");
    } finally {
      setLoading(false);
    }
  };

  const handleGetPOSUpsellSuggestions = async (invoiceDraft: InvoiceDraft) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPOSUpsellSuggestions(invoiceDraft);
      setPosUpsellSuggestions(data);
    } catch (err: any) {
      setError(err.message || "Failed to load POS upsell suggestions");
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setCustomerSummary(null);
    setReturnPrediction(null);
    setServiceSuggestions([]);
    setChurnRisk(null);
    setPosUpsellSuggestions([]);
    setError(null);
  };

  return {
    loading,
    error,
    customerSummary,
    returnPrediction,
    serviceSuggestions,
    churnRisk,
    posUpsellSuggestions,
    getCustomerSummary: handleGetCustomerSummary,
    getPredictReturn: handleGetPredictReturn,
    getServiceSuggestions: handleGetServiceSuggestions,
    getChurnRisk: handleGetChurnRisk,
    getPOSUpsellSuggestions: handleGetPOSUpsellSuggestions,
    clearAll,
  };
}

