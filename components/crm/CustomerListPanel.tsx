"use client";

import React, { useState, useMemo } from "react";
import { Search, Download, Filter, FileSpreadsheet } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  avatar?: string;
  customerCode?: string;
}

interface CustomerListPanelProps {
  customers: Customer[];
  selectedCustomerId: string | null;
  onSelectCustomer: (customer: Customer) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export default function CustomerListPanel({
  customers,
  selectedCustomerId,
  onSelectCustomer,
  searchTerm,
  onSearchChange,
}: CustomerListPanelProps) {
  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return customers;
    const term = searchTerm.toLowerCase();
    return customers.filter(
      (c) =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(term) ||
        c.phone.includes(term) ||
        c.customerCode?.toLowerCase().includes(term)
    );
  }, [customers, searchTerm]);

  const getInitials = (firstName: string, lastName: string) => {
    const first = firstName?.[0]?.toUpperCase() || "";
    const last = lastName?.[0]?.toUpperCase() || "";
    return `${first}${last}` || "?";
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-[calc(100vh-72px)]">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">Khách hàng</h2>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Tìm kiếm khách hàng"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Filter size={14} className="mr-1" />
            Tìm nâng cao
          </Button>
          <Button variant="outline" size="sm" title="Xuất dữ liệu">
            <Download size={14} />
          </Button>
        </div>
      </div>

      {/* Customer List */}
      <div className="flex-1 overflow-y-auto">
        {filteredCustomers.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            {searchTerm ? "Không tìm thấy khách hàng" : "Chưa có khách hàng"}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredCustomers.map((customer) => {
              const fullName = `${customer.firstName} ${customer.lastName}`.trim();
              const isSelected = selectedCustomerId === customer.id;

              return (
                <div
                  key={customer.id}
                  onClick={() => onSelectCustomer(customer)}
                  className={`p-3 cursor-pointer transition-colors ${
                    isSelected ? "bg-blue-50 border-l-4 border-blue-500" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                      {customer.avatar ? (
                        <img src={customer.avatar} alt={fullName} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        getInitials(customer.firstName, customer.lastName)
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm truncate ${isSelected ? "text-blue-900" : "text-gray-900"}`}>
                        {fullName || "Khách hàng"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{customer.phone}</p>
                      {customer.customerCode && (
                        <p className="text-xs text-gray-400 mt-0.5">{customer.customerCode}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

