"use client";

import { useState, useEffect } from "react";
import { getCheckout, saveCheckout } from "../services/posApi";
import { CheckoutItem, InvoiceItem, PaymentMethod, InvoiceStatus } from "../types";

export interface UsePOSReturn {
  loading: boolean;
  error: string | null;
  invoice: any | null;
  invoiceItems: InvoiceItem[];
  discountAmount: number;
  paymentMethod: PaymentMethod | null;
  subtotal: number;
  total: number;
  addItem: (item: CheckoutItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateStaff: (itemId: string, staffId: string) => void;
  setDiscount: (amount: number) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  loadInvoice: (bookingId: string) => Promise<void>;
  saveDraft: (bookingId: string) => Promise<void>;
  confirmPayment: (bookingId: string) => Promise<void>;
}

export function usePOS(): UsePOSReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<any | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);

  // Calculate subtotal and total
  const subtotal = invoiceItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const total = subtotal - discountAmount;

  // Load invoice for a booking
  const loadInvoice = async (bookingId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCheckout(bookingId);
      if (data) {
        setInvoice(data.invoice);
        setInvoiceItems(data.invoiceItems || []);
        setDiscountAmount(Number(data.invoice.discountAmount) || 0);
        setPaymentMethod(data.invoice.paymentMethod);
      } else {
        // No invoice found, start fresh
        setInvoice(null);
        setInvoiceItems([]);
        setDiscountAmount(0);
        setPaymentMethod(null);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load invoice");
    } finally {
      setLoading(false);
    }
  };

  // Add item
  const addItem = (item: CheckoutItem) => {
    const newItem: InvoiceItem = {
      id: `temp-${Date.now()}-${Math.random()}`,
      invoiceId: invoice?.id || "",
      serviceId: item.serviceId || null,
      productId: item.productId || null,
      staffId: item.staffId || null,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.unitPrice * item.quantity,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setInvoiceItems([...invoiceItems, newItem]);
  };

  // Remove item
  const removeItem = (itemId: string) => {
    setInvoiceItems(invoiceItems.filter((item) => item.id !== itemId));
  };

  // Update quantity
  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setInvoiceItems(
      invoiceItems.map((item) => {
        if (item.id === itemId) {
          const newLineTotal = item.unitPrice * quantity;
          return {
            ...item,
            quantity,
            lineTotal: newLineTotal,
          };
        }
        return item;
      })
    );
  };

  // Update staff for an item
  const updateStaff = (itemId: string, staffId: string) => {
    setInvoiceItems(
      invoiceItems.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            staffId,
          };
        }
        return item;
      })
    );
  };

  // Save draft
  const saveDraft = async (bookingId: string) => {
    if (invoiceItems.length === 0) {
      setError("Please add at least one item");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const items = invoiceItems.map((item) => ({
        serviceId: item.serviceId || undefined,
        productId: item.productId || undefined,
        staffId: item.staffId || undefined,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }));

      const data = await saveCheckout({
        bookingId,
        items,
        discountAmount,
        paymentMethod: paymentMethod || PaymentMethod.CASH,
        markAsPaid: false,
      });

      setInvoice(data.invoice);
      setInvoiceItems(data.invoiceItems);
    } catch (err: any) {
      setError(err.message || "Failed to save draft");
    } finally {
      setLoading(false);
    }
  };

  // Confirm payment
  const confirmPayment = async (bookingId: string) => {
    if (invoiceItems.length === 0) {
      setError("Please add at least one item");
      return;
    }

    if (!paymentMethod) {
      setError("Please select a payment method");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const items = invoiceItems.map((item) => ({
        serviceId: item.serviceId || undefined,
        productId: item.productId || undefined,
        staffId: item.staffId || undefined,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }));

      const data = await saveCheckout({
        bookingId,
        items,
        discountAmount,
        paymentMethod,
        markAsPaid: true,
      });

      setInvoice(data.invoice);
      setInvoiceItems(data.invoiceItems);
    } catch (err: any) {
      setError(err.message || "Failed to confirm payment");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    invoice,
    invoiceItems,
    discountAmount,
    paymentMethod,
    subtotal,
    total,
    addItem,
    removeItem,
    updateQuantity,
    updateStaff,
    setDiscount,
    setPaymentMethod,
    loadInvoice,
    saveDraft,
    confirmPayment,
  };
}

