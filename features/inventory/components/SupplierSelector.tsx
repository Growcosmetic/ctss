"use client";

import React, { useState, useEffect } from "react";
import { Building2, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Supplier {
  id: string;
  code: string;
  name: string;
  contactName?: string | null;
  phone?: string | null;
}

interface SupplierSelectorProps {
  value?: string | null;
  onChange: (supplierId: string | null) => void;
  disabled?: boolean;
}

export default function SupplierSelector({
  value,
  onChange,
  disabled = false,
}: SupplierSelectorProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/inventory/suppliers?isActive=true", {
        credentials: "include",
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSuppliers(result.data || []);
        }
      }
    } catch (error) {
      console.error("Error loading suppliers:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Đang tải nhà cung cấp...</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value || null)}
          disabled={disabled}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        >
          <option value="">-- Chọn nhà cung cấp --</option>
          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.code} - {supplier.name}
            </option>
          ))}
        </select>
      </div>

      {value && suppliers.find((s) => s.id === value) && (
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
          <Building2 className="w-4 h-4" />
          <span>
            {suppliers.find((s) => s.id === value)?.code} -{" "}
            {suppliers.find((s) => s.id === value)?.name}
          </span>
        </div>
      )}
    </div>
  );
}
