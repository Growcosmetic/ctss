"use client";

import React, { useState, useEffect } from "react";
import { Search, User, Phone, Mail } from "lucide-react";
import { CustomerSearchResult } from "../types";

interface CustomerSearchProps {
  onSelect: (customer: CustomerSearchResult) => void;
  onClose?: () => void;
}

export default function CustomerSearch({ onSelect, onClose }: CustomerSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CustomerSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim().length >= 2) {
        searchCustomers();
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const searchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/crm/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("Failed to search");
      const data = await response.json();
      setResults(data.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to search customers");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border p-4">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm kiếm theo tên, số điện thoại, email..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && (
        <div className="mb-4 p-2 bg-red-100 border border-red-300 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-4 text-gray-500">Đang tìm kiếm...</div>
      )}

      {!loading && query.trim().length >= 2 && results.length === 0 && (
        <div className="text-center py-4 text-gray-500">Không tìm thấy kết quả</div>
      )}

      {results.length > 0 && (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {results.map((customer) => (
            <button
              key={customer.id}
              onClick={() => {
                onSelect(customer);
                setQuery("");
                setResults([]);
                onClose?.();
              }}
              className="w-full p-3 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {customer.firstName} {customer.lastName}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {customer.phone}
                    </span>
                    {customer.email && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {customer.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

